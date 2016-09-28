/**
 * The background script to handle url redirection.
 */

/* Initialization: Load configuration from local storage */
var storage = {};
var reCache = {};
var downloading = false;

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        load("storage", function (result) {
            if (result && result.storage) {
                storage = result.storage;
                reCache = {};
                resetDownloadTimer();
            }
        });
    }
});

load("storage", function (result) {
    if (result && result.storage) {
        storage = result.storage;
        reCache = {};
        resetDownloadTimer();
    }
});


/* Download online rules */
function downloadOnlineURLs(){
    if (!storage.onlineURLs) {
        return;
    }
    downloading = true;
    try {
        for (var i = 0; i < storage.onlineURLs.length; i++) {
            var onlineURL = storage.onlineURLs[i];
            if (onlineURL.enable) {
                console.log("Download " + onlineURL.url);
                var content = download(onlineURL.url);
                if (content) {
                    try {
                        var json = JSON.parse(content);
                        json.url = onlineURL.url;
                        json.enable = onlineURL.enable;
                        json.downloadAt = new Date();
                        /* version < 1.0, assume >= 1.0 doesn't need to change */
                        if (!json.version || json.version < "1.0") {
                            var rules = [];
                            for (var key in json.rules) {
                                var rule = json.rules[key];
                                rules.push({
                                    origin: key,
                                    target: rule.dstURL,
                                    enable: rule.enable === undefined ? true : rule.enable,
                                    kind: rule.kind
                                });
                            }
                        }
                        json.rules = rules;
                        /* replace the object */
                        storage.onlineURLs[i] = json;
                    } catch (err) {
                        console.error(err);
                        continue;
                    }
                }
            }
        }
        storage.updatedAt = new Date();
        browser.storage.local.set(
            {"storage": storage}
        );
    } finally {
        downloading = false;
    }
}

var downloadTimer = null;

function resetDownloadTimer() {
    if (downloadTimer != null) {
        clearInterval(downloadTimer);
    }
    var interval = 3600;
    if (storage.updateInterval) {
        interval = parseInt(storage.updateInterval);
    }
    interval = interval * 1000;
    downloadTimer = setInterval(function () {
        if (storage.enable) {
            downloadOnlineURLs();
        }
    }, interval);
}

/* Handle runtime messages */
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message) {
        console.log("Calling " + message.method + " from " + sender);
    }
    if (message.method == "download") {
        downloadOnlineURLs();
    }
    else if (message.method == "isDownloading") {
        sendResponse(downloading);
    }
    else {
        console.error("Unknown method");
    }
});


function redirect(rule, url) {
    var re = reCache[rule];
    if (!re) {
        re = new RegExp(rule.origin);
        reCache[rule] = re;
    }
    if (re.test(url)) {
        var url = url.replace(re, rule.target);
        return {
            redirectUrl: url
        }
    }
}

function handleRedirect(details) {
    if (storage.enable && details.url) {
        /* custom rules */
        if (storage.customRules) {
            for (var i = 0; i < storage.customRules.length; i++) {
                var rule = storage.customRules[i];
                var result = redirect(rule, details.url);
                if (result) {
                    return result;
                }
            }
        }
        /* online rules */
        if (storage.onlineURLs) {
            for (var i = 0; i < storage.onlineURLs.length; i++) {
                var onlineURL = storage.onlineURLs[i];
                if (onlineURL.rules) {
                    for (var j = 0; j < onlineURL.rules.length; j++) {
                        var rule = onlineURL.rules[i];
                        var result = redirect(rule, details.url);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        }
        /* finally the internal */
        for (var i = 0; i < INTERNAL_RULES.length; i++) {
            var rule = INTERNAL_RULES[i];
                var result = redirect(rule, details.url);
                if (result) {
                    return result;
                }
        }
    }
    return {};
}

browser.webRequest.onBeforeRequest.addListener(
    handleRedirect,
    {urls: ["<all_urls>"]},
    ["blocking"]
);
