/**
 * Javascript for options page.
 */

var DOWNLOADING = "正在下载在线规则...";
var storage = {};

var urlTemp =
    "<td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control'/></td>" +
    "<td style='width: 60px'><a class='btn btn-xs btn-info'>查看</a></td>" +
    "<td><input type='checkbox' class='checkbox'/></td>";

var ruleTemp =
    "<td><input type='checkbox' class='checkbox'/></td>" +
    "<td><input type='text' class='form-control'/></td>" +
    "<td><input type='text' class='form-control'/></td>" +
    "<td><input type='checkbox' class='checkbox'></td>";


function createURLRow(enable, value) {
    var tr = document.createElement("tr");
    tr.innerHTML = urlTemp.format(enable, value);
    $(tr).find(":checkbox").last().attr("checked", enable);
    $(tr).find(":text").val(value).data("old", value);
    $(tr).find(":text").change(function () {
        var ele = this;
        var url = $.trim($(this).val());
        var hasSame = false;
        $(this).closest("tbody").find(":text").each(function () {
            var another = $.trim($(this).val());
            if (ele != this && url == another) {
                // Same online urls
                hasSame = true;
                return false;
            }
        });
        if (!hasSame) {
            $(this).data("old", url);
        } else {
            $(this).val($(this).data("old"));
        }
    });
    $(tr).find("a").click(function () {
        var url = $(this).closest("tr").find(":input").val();
        if ($.trim(url)) {
            browser.tabs.create({url: url});
        }
    });
    return tr;
}

function createRuleRow(enable, origin, target) {
    var tr = document.createElement("tr");
    tr.innerHTML = ruleTemp.format(enable, origin, target);
    $(tr).find(":checkbox").last().attr("checked", enable);
    $(tr).find(":text").first().val(origin);
    $(tr).find(":text").last().val(target);
    return tr;
}

function displayAll() {
    var checkAll = $("table thead").find(":checkbox");
    checkAll.prop("checked", false);

    sendMessage("isDownloading", {}, function (response) {
        if (!response) {
            $("#downloadState").text("");
        } else {
            $("#downloadState").text(DOWNLOADING);
        }
    });

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
        if (storage.updatedAt != "") {
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
                var onlineURL = storage.onlineURLs[i];
                var tr = createURLRow(onlineURL.enable, onlineURL.url);
                body.append(tr);
            }
        }
        /* custom rules */
        body = $("#tblCustomRules tbody");
        body.html("");
        if (storage.customRules) {
            for (var i = 0; i < storage.customRules.length; i++) {
                var rule = storage.customRules[i];
                var tr = createRuleRow(rule.enable, rule.origin, rule.target);
                body.append(tr);
            }
        }
    });
}

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        displayAll();
    }
});

/* Check all and uncheck all */
$("table thead :checkbox").click(function () {
    var checked = $(this).is(":checked");
    var table = $(this).closest("table");
    table.find("tbody tr").each(function () {
        $(this).find(":checkbox").first().prop("checked", checked);
    });
});

$("#btnAddOnlineURL").click(function () {
    // already has empty row
    var hasEmpty = false;
    $("#tblOnlineURLs").find(":text").each(function () {
        if ($.trim($(this).val()) == "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        var tr = createURLRow(true, "");
        $("#tblOnlineURLs tbody").append(tr);
    }
});

$("#btnDeleteOnlineURL").click(function () {
    $("#tblOnlineURLs tbody tr").each(function () {
        var rule = $(this).find(":text").val();
        if ($(this).find(":checkbox").first().is(":checked")) {
            $(this).remove();
        }
    });
    $("#tblOnlineURLs thead :checkbox").prop("checked", false);
});

/* Download in background */
$("#btnDownload").click(function () {
    sendMessage("isDownloading", {}, function (response) {
        if (!response) {
            $("#downloadState").text(DOWNLOADING);
            sendMessage("download", {});
        } else {
            $("#downloadState").text(DOWNLOADING);
        }
    });
});

$("#btnAddCustomRule").click(function () {
    var hasEmpty = false;
    $("#tblCustomRules tbody tr").each(function () {
        var origin = $(this).find(":text").first().val();
        var target = $(this).find(":text").last().val();
        if (origin == "" && target == "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        var tr = createRuleRow(true, "", "");
        $("#tblCustomRules tbody").append(tr);
    }
});

$("#btnDeleteCustomRule").click(function () {
    $("#tblCustomRules tbody tr").each(function () {
        if ($(this).find(":checkbox").first().is(":checked")) {
            $(this).remove();
        }
    });
    $("#tblCustomRules thead :checkbox").prop("checked", false);
});

$("#btnReset").click(function () {
    displayAll();
});

/* Save options */
$("#btnSave").click(function () {
    /* reload storage and save options */
    load("storage", function (item) {
        if (item && item.storage) {
            storage = item.storage;
        }
        storage.updateInterval = parseInt($("#onlineInterval").val() * 60);
        if (storage.updateInterval < 1 ) {
            storage.updateInterval = 1;
        }
        storage.enable = $("#chbEnable").is(":checked");
        /* online urls */
        var oldURLs = storage.onlineURLs;
        if (!oldURLs) {
            oldURLs = [];
        }
        storage.onlineURLs = [];
        $("#tblOnlineURLs tbody tr").each(function () {
            var enable = $(this).find(":checkbox").last().is(":checked");
            var url = $.trim($(this).find(":text").val());
            if (url != "") {
                var isOld = false;
                for (var i = 0; i < oldURLs.length; i++) {
                    if (oldURLs[i].url == url) {
                        isOld = true;
                        storage.onlineURLs.push(oldURLs[i]);
                        break;
                    }
                }
                if (!isOld) {
                    storage.onlineURLs.push({
                        "enable":enable,
                        "url": url
                    });
                }
            }
        });
        /* custom rule */
        storage.customRules = [];
        $("#tblCustomRules tbody tr").each(function () {
            var enable = $(this).find(":checkbox").last().is(":checked");
            var origin = $(this).find(":text").first().val();
            var target = $(this).find(":text").last().val();
            if (origin == "" && target == "") {
                return;
            }
            storage.customRules.push({
                "enable": enable,
                "origin": origin,
                "target": target
            });
        });
        /* save */
        save({"storage": storage}, function () {
            displayAll();
        });
    });
});

displayAll();
