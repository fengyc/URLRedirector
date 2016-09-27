/**
 * Javascript for options page.
 */

var storage = {};

var urlTemp =
    "<tr><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='checkbox' class='checkbox' {1} data-index='{0}'/></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' value='{2}'/></td></tr>";

var ruleTemp =
    "<tr><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='checkbox' class='checkbox' {1} data-index='{0}'></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' data-name='origin' value='{2}'/></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' data-name='target' value='{3}'/></td></tr>";

$("#btnAddOnlineURL").click(function () {
    $("#tblOnlineURLs tbody").append(urlTemp.format("", "", ""));
});

$("#btnAddCustomRule").click(function () {
    $("#tblCustomRules tbody").append(ruleTemp.format("", "", "", ""))
});

function displayAll() {
    browser.storage.local.get(
        "storage",
        function (item) {
            if (item) {
                storage = item.storage;
                var body = $("#tblOnlineURLs tbody");
                var html = "";
                body.html("");

                for (var i = 0; i < storage.onlineURLs.length; i++) {
                    var url = storage.onlineURLs[i];
                    html = urlTemp.format(i, url.enable?"checked":"", url.url);
                    body.append(html);
                }
                html = urlTemp.format("", "", "");
                body.append(html);


                body = $("#tblCustomRules tbody");
                body.html("");
                for (var i = 0; i < storage.customRules.length; i++) {
                    var rule = storage.customRules[i];
                    html = ruleTemp.format(i, rule.enable?"checked":"", rule.origin, rule.target)
                    body.append(html);
                }
                html = ruleTemp.format("", "", "", "");
                body.append(html);
            }
        }
    );
}
displayAll();
