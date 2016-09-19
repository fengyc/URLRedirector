/**
 * The background script to handle url redirection.
 */

function logURL(requestDetails) {
    console.log(requestDetails.method + " " + requestDetails.url);
    return {}
}

browser.webRequest.onBeforeRequest.addListener(
    logURL,
    {urls: ["<all_urls>"]},
    ["blocking"]
);
