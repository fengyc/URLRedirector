/**
 * OneDrive
 *
 * See https://dev.onedrive.com/auth/graph_oauth.htm
 */

function OneDrive() {
    this._authorizedCallbcak = null;
    this._tab = null;
}

OneDrive.CLIENT_ID = "380231ba-6b4d-44ae-a1bf-8daa67c0e15a";
OneDrive.AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/_authorize";
OneDrive.REDIRECT_URL = "https://urlredirector.github.io/auth_onedrive.html";
OneDrive.SCOPE = "onedrive.appfolder";
OneDrive.RESPONSE_TYPE = "token";


function _dumpQueryString(obj) {
    var queryString = "";
    for (var k in obj) {
        queryString += encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]) + "&";
    }
    if (queryString != "") {
        queryString = queryString.slice(0, queryString.length - 1)
    }
    return queryString;
}

function _loadQueryString(queryString) {
    var params = queryString.split("&");
    var obj = {};
    for (var p in params) {
        var kv = p.split("=");
        var k = decodeURIComponent(kv[0]);
        var v = undefined;
        if (kv.length>1) {
            v = decodeURIComponent(kv[1]);
        }
        obj[k] = v;
    }
    return obj;
}

OneDrive.prototype._authorize = function (callback) {
    if (this._tab) {
        callback(this.isAuthorized());
    }

    this._authorizedCallbcak = callback;

    var queryString = _dumpQueryString({
        client_id: OneDrive.CLIENT_ID,
        response_type: OneDrive.RESPONSE_TYPE,
        scope: OneDrive.SCOPE,
        redirect_url: OneDrive.REDIRECT_URL
    });
    var authURL = this.AUTH_URL + "?" + queryString;

    var creating = browser.tabs.create({
        active: true,
        url: authURL
    });
    creating.then(
        function (tab) {
            this._tab = tab;
            // Do nothing, just wait for authorization.
        },
        function (error) {
            callback(false);
        }
    );
};

OneDrive.prototype._handleTabUpdated = function (tabId, changeInfo, tab) {
    if (this._tab && this._tab.id == tabId) {
        if (changeInfo.url.startsWith(OneDrive.REDIRECT_URL)) {
            /* Parse query string */
            var queryString = url.split("?")[1];
            var queryInfo = _loadQueryString(queryString);
            /* Update obj */
            this.access_token = queryInfo.access_token;
            this.authentication_token = queryInfo.authentication_token;
            this.token_type = queryInfo.token_type;
            this.expires_in = queryInfo.expires_in;
            this.scope = queryInfo.scope;
            this.user_id = queryInfo.user_id;
            this.issued_at = new Date();
            browser.tabs.remove(tabId);
        }
    }
};

OneDrive.prototype._handleTabRemoved = function(tabId, removeInfo) {
    if (this._tab && this._tab.id == tabId) {
        this._tab = null;
        if (this._authorizedCallbcak) {
            this._authorizedCallbcak(this.isAuthorized());
        }
    }
};

OneDrive.prototype.setup = function () {
    /* Listen on tab update and remove  */
    if (!browser.tabs.onUpdated.hasListener(this._handleTabUpdated)) {
        browser.tabs.onUpdated.addListener(this._handleTabUpdated);
    }
    if (!browser.tabs.onRemoved.hasListener(this._handleTabRemoved)) {
        browser.tabs.onRemoved.addListener(this._handleTabRemoved)
    }
};

OneDrive.prototype.teardown = function () {
    /* Remove listeners */
    if (browser.tabs.onUpdated.hasListener(this._handleTabUpdated)) {
        browser.tabs.onUpdated.removeListener(this._handleTabUpdated);
    }
    if (!browser.tabs.onRemoved.hasListener(this._handleTabRemoved)) {
        browser.tabs.onRemoved.removeListener(this._handleTabRemoved)
    }
};

OneDrive.prototype.isAuthorized = function() {
    if (!this.access_token) {
        return false;
    }
    var now = new Date();
    var seconds = (now.getTime() - this.issued_at.getTime())/1000;
    if (seconds > this.expires_in - 10) {
        return false;
    }
    return true;
};

OneDrive.prototype.authorizeFromURL = function (url) {
    if (url.startsWith(OneDrive.REDIRECT_URL)) {
        /* Parse query string */
        var queryString = url.split("?")[1];
        var queryInfo = _loadQueryString(queryString);
        /* Update obj */
        this.access_token = queryInfo.access_token;
        this.authentication_token = queryInfo.authentication_token;
        this.token_type = queryInfo.token_type;
        this.expires_in = queryInfo.expires_in;
        this.scope = queryInfo.scope;
        this.user_id = queryInfo.user_id;
        this.issued_at = new Date();
        /* Authorized promise callback */
        if (this.authorizedPromise) {
            this.authorizedPromise.resolve(true);
        }
    }
};


OneDrive.prototype.uploadTo = function (path, data, promise) {
    $.ajax({
        url: "/drive/special/approot:/" + encodeURIComponent(path) + ":/content",
        headers: {
            Authorization: "bearer " + this.access_token
        },
        type: "PUT",
        body: data,
        success: function (data) {
            promise.resolve(data);
        },
        error: function (xhr, error, e) {
            promise.reject(error);
        }
    })
};

OneDrive.prototype.upload = function (path, data) {
    return new Promise(function (resolve, reject) {
        function _upload() {
            $.ajax({
                url: "/drive/special/approot:/" + encodeURIComponent(path) + ":/content",
                headers: {
                    Authorization: "bearer " + this.access_token
                },
                type: "PUT",
                body: data,
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, error, e) {
                    reject(error);
                }
            })
        }
        if (!this.isAuthorized()) {
            this._authorize(function (isAuthorized) {
                if (isAuthorized) {
                    _upload()
                }
                else {
                    reject("Canceled");
                }
            })
        } else {
            _upload();
        }
    })
};

OneDrive.prototype.download = function (path) {
    return new Promise(function (resole, reject) {
        function _download() {
            $.ajax({
                url: "/drive/special/approot:/" + encodeURIComponent(path) + ":/content",
                headers: {
                    Authorization: "bearer " + this.access_token
                },
                type: "GET",
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, error, e) {
                    reject(error);
                }
            });
        }
        if (!this.isAuthorized()) {
            this._authorize(function (isAuthorized) {
                if (isAuthorized) {
                    _download();
                } else {
                    reject("Canceled");
                }
            });
        } else {
            _download();
        }
    });
};