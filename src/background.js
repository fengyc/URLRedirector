/**
 * The background script to handle url redirection.
 */

/* Initialization: Load configuration from local storage and setup timers */
var storage = new Storage();
storage.reload();

/* Reload rules every 60s */
reload_timer_id = setInterval(function () {
    storage.reload();
}, 60000);

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
    storage.saveOnlineURLs();
}


/* Handle runtime messages */
function handleMessage(message, sender, sendResponse) {
    if (message.method == "getEnable") {
        sendResponse(storage.enable);
    }
    else if (message.method == "getUpdatedAt") {
        sendResponse(storage.updatedAt);
    }
    else if (message.method == "toggleEnable") {
        storage.enable = message.args.enable;
        storage.saveEnable()
    }
    else if (message.method == "getOnlineURLs") {
        sendResponse(storage.onlineURLs);
    }
    else if (message.method == "addOnlineURL") {
        var url = message.args["url"];
        storage.onlineURLs.push(url);
        storage.saveOnlineURLs();
    }
    else if (message.method == "deleteOnlineURL") {
        var index = message.args["index"];
        storage.onlineURLs.removeAt(index);
        storage.saveOnlineURLs();
    }
    else if (message.method == "getCustomeRules") {
        sendResponse(storage.customRules);
    }
    else if (message.method == "addCustomeRule") {
        var rule = {};
        rule.origin = message.args["origin"];
        rule.target = message.args["target"];
        rule.kind = message.args["kind"];
        rule.enable = message.args["enable"];
        storage.customRules.push(rule);
        storage.saveCustomRules();
    }
    else if (message.method == "deleteCustomRule") {
        var index = message.args["index"];
        storage.customRules.removeAt(index);
        storage.saveCustomRules();
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
