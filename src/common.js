/**
 * common functions
 */

/* Array */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                return i;
            }
        }
        return -1;
    };
}

if (!Array.prototype.indexOfAll) {
    Array.prototype.indexOfAll = function (val) {
        var indexArray = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                indexArray.push(i);
            }
        }
        return indexArray;
    };
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
}

if (!Array.prototype.removeAt) {
    Array.prototype.removeAt = function (index) {
        this.splice(index, 1);
    };
}

if (!Array.prototype.insert) {
    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };
}

/* String */

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

/* Storage */

function load(keys, callback) {
    browser.storage.local.get(
        keys,
        function (item) {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            } else {
                callback(item);
            }
        }
    );
}

function save(obj, callback) {
    browser.storage.local.set(
        obj,
        function () {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            } else {
                callback(item);
            }
        }
    );
}

/* Message */
/* Send message to background */
function sendMessage(method, args, callback) {
    if (arguments.length == 2){
        browser.runtime.sendMessage({
            method: method,
            args: args
        });
    } else if (arguments.length == 3) {
        browser.runtime.sendMessage({
            method: method,
            args: args
        }, callback);
    }
}

/* Download */

function download(url){
    var content = null;
    jQuery.ajax({
        async: false,
        url: url,
        type: "GET",
        success: function (result, status, xhr) {
            content = result;
        }
    });
    return content;
}

/* Rules */

var INTERNAL_RULES = [
    {
        origin: "ajax.googleapis.com",
        target: "ajax.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    {
        origin: "fonts.googleapis.com",
            "target": "fonts.lug.ustc.edu.cn",
            "kind": "wildcard",
            "enable": true
    },
    {
        origin: "themes.googleusercontent.com",
        target: "google-themes.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    {
        origin: "fonts.gstatic.com",
        target: "fonts-gstatic.lug.ustc.edu.cn",
        "kind": "wildcard",
        "enable": true
    },
    {
        origin: "platform.twitter.com/widgets.js",
        target: "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/widgets.js",
        "kind": "wildcard",
        "enable": true
    },
    {
        origin:"apis.google.com/js/api.js",
        target: "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/api.js",
        "kind": "wildcard",
        "enable": true
    },
    {
        origin: "apis.google.com/js/plusone.js",
        target: "cdn.rawgit.com/jiacai2050/gooreplacer/gh-pages/proxy/plusone.js",
        "kind": "wildcard",
        "enable": true
    }
];