/**
 * OneDrive
 *
 * See https://dev.onedrive.com/auth/graph_oauth.htm
 */

function OneDrive() {
    this.CLIENT_ID = "380231ba-6b4d-44ae-a1bf-8daa67c0e15a";
    this.AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
    this.REDIRECT_URL = "https://urlredirector.github.io/auth_onedrive.html";
    this.SCOPE = "files.readwrite";
    this.RESPONSE_TYPE = "token";

}

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

OneDrive.prototype.authorize = function () {
    var queryString = _dumpQueryString({
        client_id: this.CLIENT_ID,
        response_type: this.RESPONSE_TYPE,
        scope: this.SCOPE,
        redirect_url: this.REDIRECT_URL
    });
    var authURL = this.AUTH_URL + "?" + queryString;
    var creating = browser.tabs.create({
        active: true,
        url: authURL
    });
    creating.then(
        function (tab) {
            browser.tabs.onUpdate
        },
        function (error) {
            console.error(error);
        }
    );
};

function authorize() {
    var auth_url = ONEDRIVE_AUTHORIZE_URL + "?" +
            "client_id+" + encodeURIComponent(onedrive_options.client_id) + "&" +
            "scope=" + encodeURIComponent(onedrive_options.scope) + "&" +
            "response_type=" + encodeURIComponent(onedrive_options.response_type) + "&" +
            "redirect_url=" + encodeURIComponent(onedrive_options.redirect_url);

    var creating = browser.tabs.create({
        active: true,
        url: auth_url
    });
    creating.then(
        function (tab) {
        },
        function (error) {
        })

}

/**
 * Check the redirected url, if the url contains ?code= then success
 * @param url
 */
function checkAuthorized(url) {
    if (url.startsWith(ONEDRIVE_REDIRECT_URL)) {
        var access_token = url.match(new RegExp("#access_token=([^&]*)($)"))
    }
}

function handleOAuth2Callback(tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.url) {

    }
}

/* Listen on tab */
browser.tabs.onUpdated.addListener(handleOAuth2Callback());



