const other_scripts = [
    "js/common/simple_browser_polyfill.js",
    "js/common/azure_devops.js",
    "js/background/main.js"
];
const chrome_or_browser = (typeof(browser) != "undefined" ? browser : chrome);
const full_paths = other_scripts.map(path => chrome_or_browser.runtime.getURL(path));
try {
    importScripts(...full_paths);
} catch (e) {
    console.error(e);
    throw e;
}
