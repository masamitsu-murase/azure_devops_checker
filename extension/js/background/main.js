(function () {
    var set_badge_text = function (my_pr_count, my_rv_count) {
        if (my_pr_count == 0 && my_rv_count == 0) {
            browser.browserAction.setBadgeText({ text: "" });
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
        browser.browserAction.setBadgeText({ text: `${pr_text}|${rv_text}` });
    };

    var set_badge_error = function () {
        const text = "!";
        browser.browserAction.setBadgeText({ text: text });
    };

    var find_my_works = async function () {
        const {
            organization,
            project,
            user_id,
        } = await AzureDevOps.currentUserInfo();
        let azure_devops = new AzureDevOps(organization, project, user_id);
        return await azure_devops.findMyWorks();
    };

    var refresh_data = function () {
        let promise = find_my_works();
        promise.then(my_works => {
            const { my_pull_requests, my_review_items } = my_works;
            set_badge_text(my_pull_requests.length, my_review_items.length);
        }).catch(_ => {
            set_badge_error();
        });
    };

    var initialize = function () {
        browser.browserAction.setBadgeTextColor({ color: "rgb(255,255,255)" });
        browser.browserAction.setBadgeBackgroundColor({ color: "rgb(255,0,0)" });

        refresh_data();
    };

    browser.runtime.onMessage.addListener((message, sender) => {
        switch (message.type) {
            case "findMyWorks":
                return find_my_works();
            default:
                console.error(`Unknown type ${message.type}`);
                break;
        }
    });

    initialize();
})();
