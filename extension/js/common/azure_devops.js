
class AzureDevOps {
    static VOTE_STATUS = {
        "10": "APPROVED",
        "5": "APPROVED_WITH_SUGGESTIONS",
        "0": "NO_VOTE",
        "-5": "WAITING_FOR_AUTHOR",
        "-10": "REJECTED",
    }
    static CLOSED_VOTE_STATUS = [10, 5, -10]

    constructor(organization, project, user_id) {
        this.organization = organization;
        this.project = project;
        this.project_info = null;
        this.user_id = user_id;
        this.user = null;
        this.project_base_url = `https://dev.azure.com/${organization}/${project}`;
        this.root_base_url = `https://dev.azure.com/${organization}`;
        this.api_version = "6.0";
    }

    async getJson(path, params, base_url) {
        params ||= {};
        if (base_url === undefined) {
            base_url = this.project_base_url;
        }
        const search_params = new URLSearchParams();
        search_params.append("api-version", this.api_version);
        for (let key in params) {
            search_params.append(key, params[key]);
        }

        const url = base_url + path + "?" + search_params.toString();
        console.log("getjson", url);
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) {
            throw new Error(`getJson error: ${response.status}`);
        }

        return await response.json();
    }

    async projectInfo(refresh) {
        if (this.project_info && !refresh) {
            return this.project_info;
        }

        const path = `/_apis/projects/${this.project}`;
        this.project_info = (await this.getJson(path, {}, this.root_base_url));
        return this.project_info;
    }

    async teamsInProject() {
        const project_info = await this.projectInfo();
        const teams_url = `${project_info.url}/teams`;
        const teams = (await this.getJson(teams_url, {}, "")).value;
        return teams;
    }

    async membersInProject() {
        const teams = await this.teamsInProject();
        const members_url_list = teams.map(t => `${t.url}/members`);
        const promises = members_url_list.map(url => this.getJson(url, {}, ""));
        const members_in_teams = (await Promise.all(promises)).map(res => res.value).flat();

        const member_id_set = new Set();
        const members = [];
        members_in_teams.forEach(member => {
            const identity = member.identity;
            if (member_id_set.has(identity.id)) {
                return;
            }
            member_id_set.add(identity.id);
            members.push(identity);
        });
        return members;
    }

    async userInfo() {
        if (this.user) {
            return this.user;
        }
        const members = await this.membersInProject();
        return members.find(member => member.id == this.user_id);
    }

    async activePullRequests() {
        const path = "/_apis/git/pullrequests";
        const params = { "searchCriteria.status": "active" };
        return (await this.getJson(path, params)).value;
    }

    async threadsForPullRequest(pr) {
        const repository_id = pr.repository.id;
        const pull_request_id = pr.pullRequestId;
        const path = `/_apis/git/repositories/${repository_id}/pullRequests/${pull_request_id}/threads`;
        return (await this.getJson(path)).value;
    }

    static comparePullRequestWithThread(a, b) {
        const a_date_str = a.pull_request.creationDate;
        const b_date_str = b.pull_request.creationDate;
        if (a_date_str !== b_date_str) {
            if (Date.parse(a_date_str) < Date.parse(b_date_str)) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.pullRequestId !== b.pullRequestId) {
            if (a.pullRequestId < b.pullRequestId) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.title !== b.title) {
            if (a.title < b.title) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.repository.id !== b.repository.id) {
            if (a.repository.id < b.repository.id) {
                return -1;
            } else {
                return 1;
            }
        }
        return 0;
    }

    async activePullRequestsWithActiveThreads() {
        const pull_requests = await this.activePullRequests();
        const promises = pull_requests.map(pr => this.threadsForPullRequest(pr));
        const threads_list = await Promise.all(promises);
        const active_threads_list = threads_list.map(threads => threads.filter(th => th.status === "active"));
        const pr_with_threads = pull_requests.map((pr, index) => ({ pull_request: pr, threads: active_threads_list[index] }));
        return pr_with_threads.sort(AzureDevOps.comparePullRequestWithThread);
    }

    isPullRequestCreatedByMe(pull_request) {
        return pull_request.createdBy.id === this.user_id;
    }

    isPullRequestReviewedByMe(pull_request) {
        const reviewers = pull_request.reviewers;
        if (!reviewers) {
            return false;
        }

        for (let reviewer of reviewers) {
            if (reviewer.id == this.user_id && !AzureDevOps.CLOSED_VOTE_STATUS.includes(reviewer.vote)) {
                return true;
            }
        }
        return false;
    }

    isThreadCreatedByMe(thread) {
        if (!thread.comments) {
            return false;
        }
        if (!thread.comments[0]) {
            return false;
        }
        if (thread.comments[0].author.id !== this.user_id) {
            return false;
        }
        return true;
    }

    async findMyWorks() {
        const pull_requests_with_threads = await this.activePullRequestsWithActiveThreads();

        const my_pull_requests = [];
        const my_review_items = [];
        pull_requests_with_threads.forEach(pr_with_threads => {
            const pr = pr_with_threads.pull_request;
            const threads = pr_with_threads.threads;
            if (this.isPullRequestCreatedByMe(pr)) {
                my_pull_requests.push(pr);
            }
            if (this.isPullRequestReviewedByMe(pr) || threads.some(th => this.isThreadCreatedByMe(th))) {
                my_review_items.push({
                    pull_request: pr,
                    threads: threads.filter(th => this.isThreadCreatedByMe(th))
                });
            }
        });

        return {
            my_pull_requests: my_pull_requests,
            my_review_items: my_review_items
        }
    }
}
