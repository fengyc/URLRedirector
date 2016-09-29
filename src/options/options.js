/**
 * Javascript for options page.
 */

var storage = {};
var urlToRemoves = [];
var ruleToRemoves = [];

var urlTemp =
    "<tr data-index='{0}'><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control' value='{2}'/></td>" +
    "<td style='width: 60px'><a>查看</a></td>" +
    "<td><input type='checkbox' class='checkbox' {1} /></td></tr>";

var ruleTemp =
    "<tr data-index='{0}'><td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control' data-name='origin' value='{2}'/></td>" +
    "<td><input type='text' class='form-control' data-name='target' value='{3}'/></td>" +
    "<td><input type='checkbox' class='checkbox' {1} ></td></tr>";

function bindDisplayURL() {
    $("#tblOnlineURLs tbody a").click(function () {
        var url = $(this).closest("tr").find(":text").val();
        if (url) {
            browser.tabs.create({url: url});
        }
    });
}

function displayAll() {
    var manifest = browser.runtime.getManifest();
    $("h1 a").attr("href", manifest.homepage_url);

    load("storage", function (item) {
        if (item && item.storage) {
            storage = item.storage;
        }

        if (storage.updateInterval) {
            var intervalMinutes = Math.round(storage.updateInterval / 60);
            $("select").val(intervalMinutes);
        }
        if (storage.updatedAt) {
            var updatedAt = new moment(storage.updatedAt);
            $("#lblUpdatedAt").text(updatedAt.format("YYYY-MM-DD HH:mm:ss"))
        }
        if (storage.enable !== undefined) {
            $("#chbEnable").attr("checked", storage.enable);
        }
        /* online urls */
        var body = $("#tblOnlineURLs tbody");
        var html = "";
        body.html("");
        if (storage.onlineURLs) {
            for (var i = 0; i < storage.onlineURLs.length; i++) {
                var url = storage.onlineURLs[i];
                html = urlTemp.format(i, url.enable ? "checked" : "", url.url);
                body.append(html);
            }
        }
        bindDisplayURL();

        /* custom rules */
        body = $("#tblCustomRules tbody");
        body.html("");
        if (storage.customRules) {
            for (var i = 0; i < storage.customRules.length; i++) {
                var rule = storage.customRules[i];
                html = ruleTemp.format(i, rule.enable ? "checked" : "", rule.origin, rule.target);
                body.append(html);
            }
        }
    });
}
displayAll();

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        displayAll();
        sendMessage("isDownloading", {}, function (response) {
            if (!response) {
                $("#downloadState").text("");
            } else {
                $("#downloadState").text("正在下载在线规则...");
            }
        });
    }
});

/* Check all and uncheck all */
$("table thead input[type=checkbox]").click(function () {
    var checked = $(this).is(":checked");
    var table = $(this).closest("table");
    table.find("tbody tr").each(function () {
        $(this).find("input[type=checkbox]:first").attr("checked", checked);
    });
});

$("#btnAddOnlineURL").click(function () {
    // already has empty row
    var hasEmpty = false;
    $("#tblOnlineURLs").find("input[type=text]").each(function () {
        if ($(this).val() === "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        $("#tblOnlineURLs tbody").append(urlTemp.format("", "checked", ""));
        bindDisplayURL();
    }
});

$("#btnDeleteOnlineURL").click(function () {
    $("#tblOnlineURLs tbody tr").each(function () {
        var index = $(this).data("index");
        if ($(this).find("input[type=checkbox]:first").is(":checked")) {
            if (index !== "") {
                urlToRemoves.push(parseInt(index));
            }
            $(this).remove();
        }
    });
    $("#tblOnlineURLs thead :checkbox").attr("checked", false);
});

/* Download in background */
$("#btnDownload").click(function () {
    sendMessage("isDownloading", {}, function (response) {
        if (!response) {
            $("#downloadState").text("正在下载在线规则...");
            sendMessage("download", {});
        } else {
            $("#downloadState").text("");
        }
    });
});

$("#btnAddCustomRule").click(function () {
    var hasEmpty = false;
    $("#tblCustomRules").find("input[type=text]").each(function () {
        if ($(this).val() === "") {
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
        var index = $(this).data("index");
        if ($(this).find("input[type=checkbox]").first().is(":checked")) {
            if (index !== ""){
                ruleToRemoves.push(parseInt(index));
            }
            $(this).remove();
        }
    });
    $("#tblCustomRules thead :checkbox").attr("checked", false);
});

/* Save options */
$("#btnSave").click(function () {
    var intervalMinutes = $("#onlineInterval").val();
    intervalMinutes = parseInt(intervalMinutes);

    var enable = $("#chbEnable").is(":checked");

    var urls = [];
    $("#tblOnlineURLs tbody tr").each(function () {
        // skip empty row
        var hasEmpty = false;
        $(this).find(":text").each(function () {
            if ($(this).val() === "") {
                hasEmpty = true;
                return false;
            }
        });
        if (hasEmpty) {
            return;
        }
        var url = $(this).find("input[type=text]").val();
        var enable = $(this).find("input[type=checkbox]:last").is(":checked");
        var index = $(this).data("index");
        urls.push({
            url: url,
            enable: enable,
            index: index
        });
    });

    var rules = [];
    $("#tblCustomRules tbody tr").each(function () {
        // skip empty row
        var hasEmpty = false;
        $(this).find(":text").each(function () {
            if ($(this).val() === "") {
                hasEmpty = true;
            }
            return false;
        });
        if (hasEmpty) {
            return;
        }
        var origin = $(this).find("input[type=text]:eq(0)").val();
        var target = $(this).find("input[type=text]:eq(1)").val();
        var enable = $(this).find("input[type=checkbox]:last").is(":checked");
        var index = $(this).data("index");
        rules.push({
            origin: origin,
            target: target,
            enable: enable,
            index: index
        });
    });

    /* reload storage and save options */
    load("storage", function (item) {
        if (item && item.storage) {
            storage = item.storage;
        }
        storage.updateInterval = intervalMinutes * 60;
        storage.enable = enable;
        /* online url */
        if (!storage.onlineURLs) {
            storage.onlineURLs = [];
        }
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (url.index !== "") {
                var index = parseInt(url.index);
                storage.onlineURLs[index].url = url.url;
                storage.onlineURLs[index].enable = url.enable;
            } else {
                storage.onlineURLs.push({
                    url: url.url,
                    enable: url.enable
                });
            }
        }
        var toRemoves = [];
        for (var i = 0; i < urlToRemoves.length; i++) {
            toRemoves.push(storage.onlineURLs[urlToRemoves[i]]);
        }
        for (var i = 0; i < toRemoves.length; i++) {
            storage.onlineURLs.remove(toRemoves[i]);
        }
        /* custom rule */
        if (!storage.customRules) {
            storage.customRules = [];
        }
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.index !== "") {
                var index = parseInt(rule.index);
                storage.customRules[index].origin = rule.origin;
                storage.customRules[index].target = rule.target;
                storage.customRules[index].enable = rule.enable;
            } else {
                storage.customRules.push({
                    origin: rule.origin,
                    target: rule.target,
                    enable: rule.enable
                });
            }
        }
        toRemoves = [];
        for (var i = 0; i < ruleToRemoves.length; i++) {
            toRemoves.push(storage.customRules[ruleToRemoves[i]]);
        }
        for (var i = 0; i < toRemoves.length; i++) {
            storage.customRules.remove(toRemoves[i]);
        }

        /* save */
        save({"storage": storage});
    });
});


