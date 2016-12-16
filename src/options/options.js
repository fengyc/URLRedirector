/**
 * Javascript for options page.
 */

var DOWNLOADING = browser.i18n.getMessage("downloading");
var VIEW = browser.i18n.getMessage("view");
var storage = {};


function createURLRow(enable, value) {
    // https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion
    $("#tblOnlineURLs tbody").append(
        $("<tr>").append(
            $("<td>").append($("<input>", {type: "checkbox"}).addClass("checkbox")),
            $("<td>").append($("<input>", {type: "text"}).addClass("form-control").change(function () {
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
            }).val(value).data("old", value)),
            $("<td>").width("60px").append($("<a>").addClass("btn btn-xs btn-info").click(function () {
                var url = $(this).closest("tr").find(":text").val();
                if ($.trim(url)) {
                    browser.tabs.create({url: url});
                }
            }).text(VIEW)),
            $("<td>").append(
                $("<input>", {type: "checkbox"}).addClass("checkbox middle").prop("checked", enable)
            ),
            $("<td>").append(
                $("<button>").addClass("btn btn-xs btn-info").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-up")
                ).click(function () {
                    var tr = $(this).closest("tr");
                    var prev_tr = tr.prev();
                    if (prev_tr) {
                        prev_tr.before(tr);
                    }
                }),
                $("<button>").addClass("btn btn-xs btn-info").css("margin-left", "2px").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-down")
                ).click(function () {
                    var tr = $(this).closest("tr");
                    var next = tr.next();
                    if (next) {
                        next.after(tr);
                    }
                })
            )
        )
    );
}

function createRuleRow(enable, origin, target) {
    $("#tblCustomRules tbody").append(
        $("<tr>").append(
            $("<td>").append($("<input>", {type: "checkbox"}).addClass("checkbox")),
            $("<td>").append($("<input>", {type: "text"}).addClass("form-control").val(origin)),
            $("<td>").append($("<input>", {type: "text"}).addClass("form-control").val(target)),
            $("<td>").append($("<input>", {type: "checkbox"}).addClass("checkbox").prop("checked", enable)),
            $("<td>").append(
                $("<button>").addClass("btn btn-xs btn-info").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-up")
                ).click(function () {
                    var tr = $(this).closest("tr");
                    var prev_tr = tr.prev();
                    if (prev_tr) {
                        prev_tr.before(tr);
                    }
                }),
                $("<button>").addClass("btn btn-xs btn-info").css("margin-left", "2px").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-down")
                ).click(function () {
                    var tr = $(this).closest("tr");
                    var next = tr.next();
                    if (next) {
                        next.after(tr);
                    }
                })
            )
        )
    );
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
        if (storage.updatedAt) {
            var updatedAt = new Date(storage.updatedAt);
            $("#lblUpdatedAt").text(updatedAt.toLocaleString())
        }
        if (storage.enable !== undefined) {
            $("#chbEnable").attr("checked", storage.enable);
        }
        /* online urls */
        var body = $("#tblOnlineURLs tbody");
        body.empty();
        if (storage.onlineURLs) {
            for (var i = 0; i < storage.onlineURLs.length; i++) {
                var onlineURL = storage.onlineURLs[i];
                createURLRow(onlineURL.enable, onlineURL.url);
            }
        }
        /* custom rules */
        body = $("#tblCustomRules tbody");
        body.empty();
        if (storage.customRules) {
            for (var i = 0; i < storage.customRules.length; i++) {
                var rule = storage.customRules[i];
                createRuleRow(rule.enable, rule.origin, rule.target);
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
        createURLRow(true, "");
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
        createRuleRow(true, "", "");
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
                        oldURLs[i]["enable"] = enable;
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

/* i18n */
document.title = browser.i18n.getMessage('optionsTitle');
