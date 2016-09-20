/**
 * The background script to handle url redirection.
 */

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


function replaceWildcard(origin, dstURL) {
    var reverse = function(str) {
        return str.split("").reverse().join("");
    };
    var reversedUrl = reverse(url);
    return reverse(reversedUrl.replace(/([\*|\?])(?!\\)/g,"$1."));
}

function replaceRegExp() {
    
}

function redirect(details) {
    if (details.url) {
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
