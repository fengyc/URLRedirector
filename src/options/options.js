/**
 * Javascript for options page.
 */

var storage = {};

var urlTemp =
    "<tr><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' value='{2}'/></td>" +
    "<td><input type='checkbox' class='checkbox' {1} data-index='{0}'/></td></tr>";

var ruleTemp =
    "<tr><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' data-name='origin' value='{2}'/></td>" +
    "<td><input type='text' class='form-control' data-index='{0}' data-name='target' value='{3}'/></td>" +
    "<td><input type='checkbox' class='checkbox' {1} data-index='{0}'></td></tr>";

/* Check all and uncheck all */
$("table thead input[type=checkbox]").click(function () {
    var checked = $(this).is(":checked");
    var table = $(this).closest("table");
    table.find("tbody tr").each(function () {
        if (checked) {
            $(this).find("input[type=checkbox]").first().attr("checked",'true');
        } else {
            $(this).find("input[type=checkbox]").first().removeAttr("checked");
        }
    });
});

$("#btnAddOnlineURL").click(function () {
    // already has empty row
    var hasEmpty = false;
    $("#tblOnlineURLs").find("input[type=text]").each(function () {
        if ($(this).text() == "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        $("#tblOnlineURLs tbody").append(urlTemp.format("", "checked", ""));
    }
});

$("#btnDeleteOnlineURL").click(function () {
    $("#tblOnlineURLs tbody tr").each(function () {
        if ($(this).find("input[type=checkbox]").first().is(":checked")) {
            $(this).remove();
        }
    });
});

$("#btnAddCustomRule").click(function () {
    var hasEmpty = false;
    $("#tblCustomRules").find("input[type=text]").each(function () {
        if ($(this).text() == "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        $("#tblCustomRules tbody").append(ruleTemp.format("", "checked", "", ""));
    }
});

$("#btnDeleteCustomRule").click(function () {
    $("#tblCustomRules tbody tr").each(function () {
        if ($(this).find("input[type=checkbox]").first().is(":checked")) {
            $(this).remove();
        }
    });
});

/* Save options */
$("#btnSave").click(function () {

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
