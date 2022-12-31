const other_scripts = [
    "js/common/azure_devops.js",
    "js/background/main.js"
];
const full_paths = other_scripts.map(path => chrome.runtime.getURL(path));
try {
    importScripts(...full_paths);
} catch (e) {
    console.error(e);
    throw e;
}
