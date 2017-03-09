/**
 * The background script to handle url redirection.
 */

var storage = null;
var downloading = false;
var downloadTimer = null;

/* Reload callback */
function reload(result) {
    storage = new Storage();
    if (result && result.storage) {
        storage.fromObject(result.storage);
        resetDownloadTimer();
    }
}

/* Auto reload */
browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        load("storage", reload);
    }
});

/* The first time of loading storage */
load("storage", reload);


/* Download online rules */
function downloadOnlineURLs() {
    /* Still downloading */
    if (!storage.onlineURLs || storage.onlineURLs.length <=0 || downloading) {
        return;
    }
    downloading = true;
    var toDownload = [];    // URLs that need to be downloaded
    for (var i = 0; i < storage.onlineURLs.length; i++) {
        var onlineURL = storage.onlineURLs[i];
        if (onlineURL.auto && onlineURL.enable && onlineURL.url != "") {
            toDownload.push(onlineURL.url);
            download(onlineURL.url, function (url, content) {
                toDownload.remove(url);
                if (content) {
                    try {
                        var json = JSON.parse(content);
                        json.url = url;
                        json.enable = true;
                        json.downloadAt = new Date();
                        /* To compact with gooreplacer */
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
                        /* replace the onlineURL */
                        for (var j = 0; j < storage.onlineURLs.length; j++){
                            if (storage.onlineURLs[j].url == url){
                                storage.onlineURLs[j] = new OnlineURL();
                                storage.onlineURLs[j].fromObject(json);
                                break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
                if (toDownload.length <= 0) {
                    downloading = false;
                    storage.updatedAt = (new Date()).toISOString();
                    save({"storage": storage});
                }
            });
        }
    }
}

/* Reset download timer to download online urls */
/* Setup a listener if alarm api supported */
if (browser.alarms) {
    browser.alarms.onAlarm.addListener(function (alarm) {
        if (alarm.name == "download") {
            downloadOnlineURLs();
        }
    })
}

/* Reset the download timer */
function resetDownloadTimer() {
    var interval = 900;     // Default 15min
    if (storage.updateInterval) {
        interval = parseInt(storage.updateInterval);
    }
    /* If the browser support alarms api */
    if (browser.alarms) {
        browser.alarms.create("download", {
            periodInMinutes: Math.ceil(interval / 60)
        });
    }
    else {
        /* With setInterval */
        if (downloadTimer != null) {
            clearInterval(downloadTimer);
        }
        interval = interval * 1000;     // In milli-seconds
        downloadTimer = setInterval(function () {
            if (storage.enable) {
                downloadOnlineURLs();
            }
        }, interval);
    }
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

function redirect(details) {
    if (storage.enable && details.url) {
        var newURL = storage.redirect(details.url, details.method, details.type);
        if (newURL){
            return {
                redirectUrl: newURL
            }
        }
    }
    return {};
}

var _redirect_promise_supported = false;

/* Handle redirect */
function handleRedirect(details) {
    if (_redirect_promise_supported) {
        var promise = new Promise(function (resolve, reject) {
            var blockingResponse = redirect(details);
            return resolve(blockingResponse);
        });
        return promise;
    } else {
        return redirect(details);
    }
}

/* Since firefox 52, could return a promise to handles asynchronously */
if (browser.runtime.getBrowserInfo) {
    function checkRedirectPromise(info) {
        if (info.name == "Firefox") {
            if (parseInt(info.version.split('.')[0]) >= 52) {
                _redirect_promise_supported = true;
            }
        }
    }
    var gettingInfo = browser.runtime.getBrowserInfo();
    gettingInfo.then(checkRedirectPromise)
}

/* Add listener */
browser.webRequest.onBeforeRequest.addListener(
    handleRedirect,
    {urls: ["<all_urls>"]},
    ["blocking"]
);
