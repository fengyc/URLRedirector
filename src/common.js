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

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (s) {
        return this.indexOf(s) === 0;
    }
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
function download(url, callback){
    var content = null;
    var async = false;
    if (callback) {
        async = true;
    }
    jQuery.ajax({
        async: async,
        url: url,
        type: "GET",
        success: function (result, status, xhr) {
            content = result;
            if (callback) {
                callback(url, result);
            }
        },
        error: function (xhr, status, error) {
            console.error("Fail to download " + url);
            console.error("Status: " + status);
            console.error("Error: "+ error);
            if (callback) {
                callback(url);
            }
        }
    });
    return content;
}

/* Others */
jQuery.fn.flash = function( color, duration )
{
  var current = this.css( 'color' );
  this.animate( { color: 'rgb(' + color + ')' }, duration / 2 );
  this.animate( { color: current }, duration / 2 );
};

/* Fix chrome */
if (typeof browser == "undefined" && chrome) {
    var browser = chrome;
}
