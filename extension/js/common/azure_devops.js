
(function (context) {
    "use strict";

    const API_VERSION = "6.0";

    async function getJson(url, params) {
        params = (params || {});
        const search_params = new URLSearchParams();
        search_params.append("api-version", API_VERSION);
        for (let key in params) {
            search_params.append(key, params[key]);
        }

        const url_with_params = url + "?" + search_params.toString();
        const response = await fetch(url_with_params, { credentials: "include" });
        if (!response.ok) {
            throw new Error(`getJson error: ${response.status}`);
        }

        return await response.json();
    }

    class AzureDevOpsProject {
        constructor(organization, project) {
            this.organization = organization;
            this.project = project;

            this.project_info = null;
            this.root_base_url = `https://dev.azure.com/${organization}`;
        }

        projectRootUrl() {
            return `${this.root_base_url}/${this.project}`;
        }

        async projectInfo(refresh) {
            if (this.project_info && !refresh) {
                return this.project_info;
            }

            const path = `/_apis/projects/${this.project}`;
            const url = `${this.root_base_url}${path}`
            this.project_info = (await getJson(url));
            return this.project_info;
        }

        async teamsInProject() {
            const project_info = await this.projectInfo();
            const teams_url = `${project_info.url}/teams`;
            const teams = (await getJson(teams_url)).value;
            return teams;
        }

        async membersInTeam(team_id) {
            const project_info = await this.projectInfo();
            const team_members_url = `${project_info.url}/teams/${team_id}/members`;
            const members = (await getJson(team_members_url)).value;
            return members;
        }

        async membersInProject() {
            const teams = await this.teamsInProject();
            const members_url_list = teams.map(t => `${t.url}/members`);
            const promises = members_url_list.map(url => getJson(url));
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

    }

    class AzureDevOps {
        static async currentUserInfo() {
            const user_info = await browser.storage.local.get("user_info");
            return user_info.user_info;
            // return {
            //     organization: "masamitsu-murase",
            //     project: "test",
            //     user_id: "6dfca89d-806c-4387-a03b-009e458cfaf9"
            // };
        }

        constructor(organization, project, user_id) {
            this.azure_devops_project = new AzureDevOpsProject(organization, project);
            this.user_id = user_id;
            this.user = null;
            this.project_base_url = this.azure_devops_project.projectRootUrl();
        }

        async getJson(path, params) {
            const url = this.project_base_url + path;
            return await getJson(url, params);
        }

        async userInfo() {
            if (this.user) {
                return this.user;
            }
            const members = await this.azure_devops_project.membersInProject();
            return members.find(member => member.id == this.user_id);
        }

        async myTeams() {
            const teams = await this.azure_devops_project.teamsInProject();
            const members_list = await Promise.all(teams.map(t => this.azure_devops_project.membersInTeam(t.id)));
            return teams.filter((t, i) => members_list[i].some(member => member.identity.id == this.user_id));
        }

        async activePullRequests() {
            const path = "/_apis/git/pullrequests";
            const params = { "searchCriteria.status": "active" };
            const pull_requests = (await this.getJson(path, params)).value;
            const promises = pull_requests.map(pr => getJson(pr.url));
            return await Promise.all(promises);
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

        isPullRequestReviewedByMe(pull_request, my_teams) {
            const reviewers = pull_request.reviewers;
            if (!reviewers) {
                return false;
            }

            const me_in_reviewer = reviewers.find(x => x.id === this.user_id);
            if (me_in_reviewer) {
                if (!AzureDevOps.CLOSED_VOTE_STATUS.includes(me_in_reviewer.vote)) {
                    return true;
                }
                return false;
            }

            const my_team_in_reviewer = reviewers.find(x => (x.id in my_teams));
            if (my_team_in_reviewer) {
                if (!AzureDevOps.CLOSED_VOTE_STATUS.includes(my_team_in_reviewer.vote)) {
                    return true;
                }
                return false;
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
            const my_teams = await this.myTeams(true);

            const my_pull_requests = [];
            const my_review_items = [];
            pull_requests_with_threads.forEach(pr_with_threads => {
                const pr = pr_with_threads.pull_request;
                const threads = pr_with_threads.threads;
                if (this.isPullRequestCreatedByMe(pr)) {
                    my_pull_requests.push(pr);
                }
                if (this.isPullRequestReviewedByMe(pr, my_teams) || threads.some(th => this.isThreadCreatedByMe(th))) {
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

    AzureDevOps.VOTE_STATUS = {
        "10": "APPROVED",
        "5": "APPROVED_WITH_SUGGESTIONS",
        "0": "NO_VOTE",
        "-5": "WAITING_FOR_AUTHOR",
        "-10": "REJECTED",
    };
    AzureDevOps.CLOSED_VOTE_STATUS = [10, 5, -10];

    window.AzureDevOps = AzureDevOps;
    window.AzureDevOpsProject = AzureDevOpsProject;
})(window);
