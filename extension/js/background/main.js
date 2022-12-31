(function () {
    var gFindMyWorksPromise = null;

    var set_badge_text = function (my_pr_count, my_rv_count) {
        if (my_pr_count == 0 && my_rv_count == 0) {
            chrome.action.setBadgeText({ text: "" });
            return;
        }

        var pr_text = `${my_pr_count}`;
        if (my_pr_count >= 10) {
            pr_text = "+";
        }
        var rv_text = `${my_rv_count}`;
        if (my_rv_count >= 10) {
            rv_text = "+";
        }
        chrome.action.setBadgeText({ text: `${pr_text}|${rv_text}` });
    };

    var set_badge_error = function () {
        const text = "!";
        chrome.action.setBadgeText({ text: text });
    };

    var find_my_works = async function () {
        const {
            organization,
            projects,
            user_id,
        } = await AzureDevOps.currentUserInfo();
        const azure_devops_list = projects.map(project => new AzureDevOps(organization, project, user_id));
        const my_works_list = await Promise.all(azure_devops_list.map(ad => ad.findMyWorks()));
        return new Map(projects.map((project, i) => [project, my_works_list[i]]));
    };

    var find_my_works_in_single_request = async function () {
        if (gFindMyWorksPromise != null) {
            return await gFindMyWorksPromise;
        }

        const promise = find_my_works();
        gFindMyWorksPromise = promise;
        try {
            return await promise;
        } finally {
            gFindMyWorksPromise = null;
        }
    };

    var update_badge_text = function (my_works) {
        const [pull_request_count, review_count] = Array.from(my_works.values())
            .map(item => [item.my_pull_requests.length, item.my_review_items.length])
            .reduce((prev, curr) => prev.map((v, i) => v + curr[i]), [0, 0]);
        set_badge_text(pull_request_count, review_count);
    };

    var refresh_data = function () {
        (async function () {
            try {
                const my_works = await find_my_works_in_single_request();
                update_badge_text(my_works);
            } catch (e) {
                set_badge_error();
            }
        })();
    };

    var initialize = function () {
        chrome.runtime.onInstalled.addListener(() => {
            chrome.alarms.create("periodic", { periodInMinutes: 1 });
        });

        if (chrome.action.setBadgeTextColor) {
            chrome.action.setBadgeTextColor({ color: "rgb(255,255,255)" });
        }
        chrome.action.setBadgeBackgroundColor({ color: "rgb(196,0,0)" });

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.type) {
                case "findMyWorks":
                    find_my_works_in_single_request().then(works => {
                        update_badge_text(works);
                        sendResponse(Array.from(works.entries()));
                    });
                    return true;
                default:
                    console.error(`Unknown type ${message.type}`);
                    break;
            }
        });

        chrome.alarms.onAlarm.addListener(alarm => {
            switch (alarm.name) {
                case "periodic":
                    refresh_data();
                    break;
                default:
                    console.error("Unknown alarm");
                    break;
            }
        })

        refresh_data();
    };

    initialize();
})();
