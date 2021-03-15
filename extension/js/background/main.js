(function () {
    var load_data = function () {
        return fetch("https://dev.azure.com/masamitsu-murase/test/_apis/git/repositories?api-version=6.0", {
            "credentials": "include"
        })
            .then(result => {
                return result.json()
            })
            .then(json => {
                return json;
            });
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("onMessage");
        return load_data();
    });
})();
