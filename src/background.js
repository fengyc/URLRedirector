/**
 * The background script to handle url redirection.
 */

/* Initialization: Load configuration from local storage */
var storage = {};

function reloadDB() {
    browser.storage.local.get(
        "storage",
        function (item) {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            }
            storage = item.storage;
            console.log(storage);
        }
    );
}

function saveDB() {
    browser.storage.local.set(
        {"storage": storage},
        function () {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            }
        }
    );
}

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        reloadDB();
    }
});

reloadDB();



/* Download online rules */
function downloadRulesFrom(url){
    jQuery.ajax({
        async: false,
        url: url,
        type: "GET",
        success: function (result, status, xhr) {
            try {
                return result;
            } catch (e) {
                console.log(e);
            }
        }
    });
    return null;
}

function downloadOnlineURLs(){
    for (var i = 0; i < storage.onlineURLs.length; i++) {
        var onlineURL = storage.onlineURLs[i];
        if (onlineURL.enable) {
            var result = downloadRulesFrom(onlineURL.url);
            if (result) {
                var resultJson = null;
                try {
                    resultJson = JSON.parse(result);
                } catch (err) {
                    console.error(err);
                    continue;
                }
                var resultJson = JSON.parse(result);
                if (!resultJson.hasOwnProperty("version") ||
                    resultJson.version <= "1.0") {
                    resultJson.url = onlineURL.url;
                    resultJson.enable = onlineURL.enable;
                    resultJson.lastUpdatedAt = new Date();
                    storage.onlineURLs[i] = resultJson;
                }
            }
        }
    }
    storage.updatedAt = new Date();
    saveDB();
}

var updateTimer = null;

function resetUpdateTimer() {
    if (updateTimer != null) {
        clearInterval(updateTimer);
    }
    var interval = 60000;
    if (storage.updateInterval && storage.updateInterval >= 0) {
        interval = storage.updateInterval * 1000;
    }
    updateTimer = setInterval(function () {
        if (storage.enable) {
            downloadOnlineURLs();
        }
    }, interval);
}

resetUpdateTimer();


/* Handle runtime messages */
function handleMessage(message, sender, sendResponse) {
    if (message) {
        console.log("Calling " + message.method + " from " + sender);
    }
    else {
        console.error("Unknown method");
    }
}
browser.runtime.onMessage.addListener(handleMessage);

var db =  {
    "ajax.googleapis.com": {
        "dstURL": "ajax.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    "fonts.googleapis.com": {
        "dstURL": "fonts.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    "themes.googleusercontent.com": {
        "dstURL": "google-themes.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    "fonts.gstatic.com": {
        "dstURL": "fonts-gstatic.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    "platform.twitter.com/widgets.js": {
        "dstURL": "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/widgets.js",
        "kind": "wildcard",
        "enable": true
    },
    "apis.google.com/js/api.js": {
        "dstURL": "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/api.js",
        "kind": "wildcard",
        "enable": true
    },
    "apis.google.com/js/plusone.js": {
        "dstURL": "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/plusone.js",
        "kind": "wildcard",
        "enable": true
    }
};


function redirect(details) {
    if (storage.enable && details.url) {
        for (var key in db) {
            var re = RegExp(key);
            var rule = db[key];
            if (rule.enable && re.test(details.url)) {
                var url = details.url.replace(key, rule.dstURL);
                return {redirectUrl: url};
            }
        }
    }
    return {};
}

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"]},
    ["blocking"]
);
