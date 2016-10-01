/**
 * The background script to handle url redirection.
 */

var storage = {};
var reCache = {};
var downloading = false;
var downloadTimer = null;

/* Reload callback */
function reload(result) {
    console.log("Reload");
    if (result && result.storage) {
        storage = result.storage;
        reCache = {};
        resetDownloadTimer();
    }
}

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        load("storage", reload);
    }
});

load("storage", reload);


/* Download online rules */
function downloadOnlineURLs() {
    if (!storage.onlineURLs) {
        return;
    }
    downloading = true;
    var toDownload = [];
    for (var i = 0; i < storage.onlineURLs.length; i++) {
        var onlineURL = storage.onlineURLs[i];
        if (onlineURL.enable) {
            toDownload.push(onlineURL.url);
            console.log("Download " + onlineURL.url);
            download(onlineURL.url, function (url, content) {
                toDownload.remove(url);
                if (content) {
                    try {
                        var json = JSON.parse(content);
                        json.url = url;
                        json.enable = true;
                        json.downloadAt = new Date();
                        /* version < 1.0, version >= 1.0 doesn't change */
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
                            json.rules = rules;
                        }
                        /* replace the object */
                        for (var j = 0; j < storage.onlineURLs.length; j++){
                            if (storage.onlineURLs[j].url == url){
                                storage.onlineURLs[j] = json;
                                break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
                if (toDownload.length <= 0) {
                    console.log("Download completed");
                    downloading = false;
                    storage.updatedAt = (new Date()).toISOString();
                    save({"storage": storage}, function () {
                        load("storage", reload);
                    });
                }
            });
        }
    }
}

/* Reset download timer to download online urls */
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

/* Redirect url */
function redirect(rule, url) {
    if (!rule.enable){
        return;
    }
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
                if (onlineURL.enable && onlineURL.rules) {
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
    }
    return {};
}

browser.webRequest.onBeforeRequest.addListener(
    handleRedirect,
    {urls: ["<all_urls>"]},
    ["blocking"]
);
