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
OneDrive.GRAPH_URL = "https://graph.microsoft.com/v1.0";
OneDrive.REDIRECT_URL = "https://urlredirector.github.io/auth_onedrive.html";
OneDrive.SCOPE = "files.readwrite";
OneDrive.RESPONSE_TYPE = "token";
OneDrive.AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
    _dumpQueryString({
        client_id: OneDrive.CLIENT_ID,
        response_type: OneDrive.RESPONSE_TYPE,
        scope: OneDrive.SCOPE,
        redirect_url: OneDrive.REDIRECT_URL
    });

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
    for (var i=0; i<params.length; i++) {
        var p = params[i];
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
    var self = this;

    /* Authenticating? */
    if (self._tab) {
        callback(self._isAuthorized());
    }

    self._authorizedCallbcak = callback;

    /* Create a tab, firefox and chrome have different api :-( */
    var creating = browser.tabs.create({
        active: true,
        url: OneDrive.AUTH_URL
    }, function (tab) {
        self._tab = tab;
    });
    /* firefox */
    if (creating) {
        creating.then(
            function (tab) {
                self._tab = tab;
            },
            function (error) {
                callback(false);
            }
        );
    }
};


OneDrive.prototype.setup = function () {
    var self = this;


    function _handleTabUpdated (tabId, changeInfo, tab) {
        var url = tab.url;
        if (url && url.startsWith(OneDrive.REDIRECT_URL) && changeInfo.status == "loading") {
            /* Redirected, parse query string */
            var queryString = tab.url.slice(OneDrive.REDIRECT_URL.length+1);
            var queryInfo = _loadQueryString(queryString);
            /* Update obj */
            self.access_token = queryInfo.access_token;
            self.authentication_token = queryInfo.authentication_token;
            self.token_type = queryInfo.token_type;
            self.expires_in = queryInfo.expires_in;
            self.scope = queryInfo.scope;
            self.user_id = queryInfo.user_id;
            self.issued_at = new Date();
            if (self._authorizedCallbcak) {
                var callback = self._authorizedCallbcak;
                self._authorizedCallbcak = null;
                callback(self._isAuthorized());
            }
            browser.tabs.remove(tabId);
        }
    }

    /* Listen on tab update and remove  */
    browser.tabs.onUpdated.addListener(_handleTabUpdated);
};


OneDrive.prototype._isAuthorized = function() {
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


OneDrive.prototype.upload = function (path, data) {
    var self = this;

    return new Promise(function (resolve, reject) {
        function _upload() {
            $.ajax({
                url: OneDrive.GRAPH_URL+"/drive/special/approot:/" + encodeURIComponent(path) + ":/content",
                headers: {
                    "Authorization": "bearer " + self.access_token,
                    "Content-Type": "application/oct-stream"
                },
                type: "PUT",
                data: data,
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, error, e) {
                    reject(error);
                }
            })
        }
        if (!self._isAuthorized()) {
            self._authorize(function (isAuthorized) {
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
    var self = this;

    return new Promise(function (resolve, reject) {
        function _download() {
            $.ajax({
                url: OneDrive.GRAPH_URL + "/drive/special/approot:/" + encodeURIComponent(path) + ":/content",
                headers: {
                    Authorization: "bearer " + self.access_token
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
        if (!self._isAuthorized()) {
            self._authorize(function (isAuthorized) {
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

var onedrive = new OneDrive();
onedrive.setup();
