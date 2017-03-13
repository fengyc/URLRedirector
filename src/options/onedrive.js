/**
 * OneDrive
 *
 * See https://dev.onedrive.com/auth/graph_oauth.htm
 */

function OneDrive() {
    this._AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
    this._REDIRECT_URL = "https://urlredirector.github.io/auth_onedrive.html";
    this._CLIENT_ID = "380231ba-6b4d-44ae-a1bf-8daa67c0e15a";
}

function dumpQueryString(obj) {
    var queryString = "";
    for (var k in obj) {
        queryString += encodeURIComponent(k + "=" + obj[k]) + "&";
    }
    if (queryString != "") {
        return queryString.slice(0, queryString.length - 1)
    }
}

function loadQueryString(s) {

}

OneDrive.prototype.authorize = function () {
};

var onedrive_options = {
    client_id: "380231ba-6b4d-44ae-a1bf-8daa67c0e15a",
    scope: "files.readwrite offline_access",
    response_type: "token",
    redirect_url: ONEDRIVE_REDIRECT_URL
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






