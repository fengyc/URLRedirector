/**
 * Javascript for options page.
 */

var DOWNLOADING = "正在下载在线规则...";
DOWNLOADING = getI18nMessage("downloading");
var storage = null;
var RESOURCE_TYPE_URL = "https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/ResourceType";
var ADDON_URL = "https://addons.mozilla.org/firefox/addon/urlredirector/";
var SYNC_NOT_SUPPORTED = "当前版本浏览器不支持同步存储";
SYNC_NOT_SUPPORTED = getI18nMessage("syncNotSupported");
var DOWNLOADING_CLOUD = "正在下载...";
DOWNLOADING_CLOUD = getI18nMessage("downloading_cloud");
var UPLOADING_CLOUD = "正在上传...";
UPLOADING_CLOUD = getI18nMessage("uploading_cloud");
var SUCCESS = "完成";
SUCCESS = getI18nMessage("success");
var FAIL = "失败";
FAIL = getI18nMessage("fail");


function blockUI(message) {
    $("#cloudMessage").text(message);
    $("#modalCloud").modal("show");
}

function unblockUI() {
    $("#modalCloud").modal("hide");
}

var OPTION_TAB_URL = window.location.href;

function activeOptionsTab() {
    var querying = browser.tabs.query({
        url: OPTION_TAB_URL
    }, function (tabs) {
        if (tabs && tabs.length > 0) {
            browser.tabs.update(tabs[0].id, {active: true})
        }
    });
    if (querying) {
        querying.then(function (tabs) {
            if (tabs && tabs.length > 0) {
                browser.tabs.update(tabs[0].id, {active: true})
            }
        });
    }
}

function showCloudMessage(message) {
    $("#spanCloudMessage").show();
    $("#spanCloudMessage").text(message);
    $("#spanCloudMessage").fadeOut(8000);
}

/* Cloud upload */
$("#lnkCloudUpload").click(function () {
    var type = $("#sltCloud").val();
    var cloudDriver = null;
    if (type=="onedrive") {
        cloudDriver = onedrive;

    }
    if (cloudDriver) {
        blockUI(UPLOADING_CLOUD);
        var content = JSON.stringify(storage, null, 2);
        var uploading = cloudDriver.upload("storage", content);
        uploading.then(
            function () {
                showCloudMessage(SUCCESS);
                activeOptionsTab();
                unblockUI();
            },
            function () {
                showCloudMessage(FAIL);
                activeOptionsTab();
                unblockUI();
            }
        );
    }
});

/* Cloud download */
$("#lnkCloudDownload").click(function () {
    var type = $("#sltCloud").val();
    var cloudDriver = null;
    if (type=="onedrive") {
        cloudDriver = onedrive;

    }
    if (cloudDriver) {
        blockUI(DOWNLOADING_CLOUD);
        var downloading = cloudDriver.download("storage");
        downloading.then(
            function (data) {
                if (data) {
                    var obj = null;
                    try {
                        obj = JSON.parse(data);
                    } finally {
                        // do nothing
                    }
                    if (obj) {
                        save({"storage": obj});
                    }
                }
                showCloudMessage(SUCCESS);
                unblockUI();
            },
            function () {
                showCloudMessage(FAIL);
                unblockUI();
            }
        );
    }
});

/* Move a row up or down */
function moveUpOrDown(tr, isUp) {
    var $tr = $(tr);
    var idx = $(tr).index();
    var $table = $tr.closest("table");
    var arr = null;
    var tmp = null;
    if ($table.is($("#tblOnlineURLs"))) {
        arr = storage.onlineURLs;
    }
    else if ($table.is($("#tblCustomRules"))) {
        arr = storage.customRules;
    }
    if (isUp) {
        var $prev = $tr.prev();
        if ($prev) {
            $prev.before($tr);
            tmp = arr[idx - 1];
            arr[idx - 1] = arr[idx];
            arr[idx] = tmp;
        }
    } else {
        var $next = $tr.next();
        if ($next) {
            $next.after($tr);
            tmp = arr[idx + 1];
            arr[idx + 1] = arr[idx];
            arr[idx] = tmp;
        }
    }
}

/* Move up */
function moveUp(tr) {
    return moveUpOrDown(tr, true);
}

/* Move down */
function moveDown(tr) {
    return moveUpOrDown(tr, false);
}


/* Create a url row */
function createURLRow(onlineURL) {
    // https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion
    $("#tblOnlineURLs tbody").append(
        $("<tr>").append(
            $("<td>").append($("<input>", {type: "checkbox"}).addClass("checkbox")),
            $("<td>").append($("<input>", {type: "text"}).addClass("form-control").change(function () {
                var ele = this;
                var url = $.trim($(this).val());
                var hasSame = false;
                $(this).closest("tbody").find("input[type='text']").each(function () {
                    var another = $.trim($(this).val());
                    if (ele != this && url == another) {
                        // Same online urls
                        hasSame = true;
                        return false;
                    }
                });
                if (!hasSame) {
                    $(this).data("old", url);
                    var idx = $(this).closest("tr").index();
                    storage.onlineURLs[idx].url = $(this).val();
                } else {
                    // Don't change url if already has a same url.
                    $(this).val($(this).data("old"));
                }
            }).val(onlineURL.url).data("old", onlineURL.url)),
            $("<td>").width("60px").append($("<a>").addClass("btn btn-xs btn-default").click(function () {
                var idx = $(this).closest("tr").index();
                showOnlineURLModal(storage.onlineURLs[idx]);
            }).append(
                $("<i>").addClass("glyphicon glyphicon-eye-open")
            )),
            $("<td>").append(
                $("<input>", {type: "checkbox", title: getI18nMessage("autoUpdate")}).addClass("checkbox middle").prop("checked", onlineURL.auto).change(function () {
                    var idx = $(this).closest("tr").index();
                    storage.onlineURLs[idx].auto = $(this).is(":checked");
                })
            ),
            $("<td>").append(
                $("<input>", {type: "checkbox", title: getI18nMessage("enable")}).addClass("checkbox middle").prop("checked", onlineURL.enable).change(function () {
                    var idx = $(this).closest("tr").index();
                    storage.onlineURLs[idx].enable = $(this).is(":checked");
                })
            ),
            $("<td>").append(
                $("<button>").addClass("btn btn-xs btn-info").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-up")
                ).click(function () {
                    moveUp($(this).closest("tr"));
                }),
                $("<button>").addClass("btn btn-xs btn-info").css("margin-left", "2px").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-down")
                ).click(function () {
                    moveDown($(this).closest("tr"));
                })
            )
        )
    );
}

/* Create a rule row */
function createRuleRow(rule) {
    $("#tblCustomRules tbody").append(
        $("<tr>").append(
            $("<td>").append($("<input>", {type: "checkbox"})),
            $("<td>").append($("<span>").text(rule.description)),
            $("<td>").append($("<span>").text(rule.origin)),
            $("<td>").append($("<span>").text(rule.target)),
            $("<td>").append(
                $("<input>", {type: "checkbox", title: getI18nMessage("enable")}).prop("checked", rule.enable).change(function () {
                    var idx = $(this).closest("tr").index();
                    storage.customRules[idx].enable = $(this).is(":checked");
                }
            )),
            $("<td>").append(
                $("<button>").addClass("btn btn-xs btn-info").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-up")
                ).click(function () {
                    moveUp($(this).closest("tr"));
                }),
                $("<button>").addClass("btn btn-xs btn-info").css("margin-left", "2px").append(
                    $("<span>").addClass("glyphicon glyphicon-chevron-down")
                ).click(function () {
                    moveDown($(this).closest("tr"));
                })
            )
        ).dblclick(function () {
            var $tr = $(this);
            var trIdx = $tr.index();
            editingRule = storage.customRules[trIdx];
            showEditCustomRuleModal(editingRule);
        })
    );
}

/* Enable or disable */
$("#chbEnable").change(function () {
    storage.enable = $("#chbEnable").is(":checked");
});

/* Enable or diable sync */
$("#chbSync").change(function () {
    storage.sync = $("#chbSync").prop("checked");
});

/* Download online url interval */
$("#onlineInterval").change(function () {
    storage.updateInterval = parseInt($("#onlineInterval").val() * 60);
    if (storage.updateInterval < 1 ) {
        storage.updateInterval = 1;
    }
});

/* Reset button */
$("#btnReset").click(function () {
    reload();
});

/* Save options */
$("#btnSave").click(function () {
    /* remove empty online url */
    var tmp = storage.onlineURLs;
    storage.onlineURLs = [];
    for (var i=0; i<tmp.length; i++) {
        var onlineURL = tmp[i];
        if (onlineURL.url && onlineURL.url != "") {
            storage.onlineURLs.push(onlineURL);
        }
    }
    /* remove empty custom rule */
    tmp = storage.customRules;
    storage.customRules = [];
    for (var i=0; i<tmp.length; i++) {
        var rule = tmp[i];
        if (rule.origin != "" && rule.target != "") {
            storage.customRules.push(rule)
        }
    }
    /* save */
    save({"storage": storage});
});

/* Display All */
function displayAll() {
    /* Reset the check-all checkbox */
    var checkAll = $("table thead").find(":checkbox");
    checkAll.prop("checked", false);

    /* Check downloading */
    sendMessage("isDownloading", {}, function (response) {
        if (!response) {
            $("#downloadState").text("");
        } else {
            $("#downloadState").text(DOWNLOADING);
        }
    });

    var manifest = browser.runtime.getManifest();
    $("#version").text(manifest.version);
    $("#homepage").attr("href", manifest.homepage_url);
    $("#addonPage").attr("href", ADDON_URL);
    $("#resourceType").attr("href", RESOURCE_TYPE_URL);

    if (storage.updateInterval) {
        var intervalMinutes = Math.round(storage.updateInterval / 60);
        $("#onlineInterval").val(intervalMinutes);
    }
    if (storage.updatedAt) {
        var updatedAt = new Date(storage.updatedAt);
        $("#lblUpdatedAt").text(updatedAt.toLocaleString())
    }
    if (storage.enable !== undefined) {
        $("#chbEnable").prop("checked", storage.enable);
    }
    /* Check support of browser.storage.sync */
    if (!browser.storage.sync) {
        $("#lblSync").prop("disabled", true);
        $("#lblSync").addClass("text-muted");
        $("#lblSync").attr("title", SYNC_NOT_SUPPORTED);
        $("#chbSync").prop("disabled", true);
        $("#chbSync").prop("checked", false);
    }
    else if (storage.sync !== undefined ) {
        $("#chbSync").prop("checked", storage.sync);
    }
    /* online urls */
    var body = $("#tblOnlineURLs tbody");
    body.empty();
    if (storage.onlineURLs) {
        for (var i = 0; i < storage.onlineURLs.length; i++) {
            var onlineURL = storage.onlineURLs[i];
            createURLRow(onlineURL);
        }
    }
    /* custom rules */
    body = $("#tblCustomRules tbody");
    body.empty();
    if (storage.customRules) {
        for (var i = 0; i < storage.customRules.length; i++) {
            var rule = storage.customRules[i];
            createRuleRow(rule);
        }
    }
}

/* Check all and uncheck all */
$("table thead :checkbox").click(function () {
    var checked = $(this).is(":checked");
    var table = $(this).closest("table");
    table.find("tbody tr").each(function () {
        $(this).find(":checkbox").first().prop("checked", checked);
    });
});

/* Add online url */
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
        var onlineURL = new OnlineURL();
        onlineURL.enable = true;
        onlineURL.auto = true;
        storage.onlineURLs.push(onlineURL);
        createURLRow(onlineURL);
    }
});

/* Delete online url */
$("#btnDeleteOnlineURL").click(function () {
    $("#tblOnlineURLs tbody tr").each(function () {
        var rule = $(this).find(":text").val();
        if ($(this).find(":checkbox").first().is(":checked")) {
            storage.onlineURLs.removeAt($(this).closest("tr").index());
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

var editingOnlineURL = null;
var editingOnlineURLIdx = 0;

/* Show online url modal */
function showOnlineURLModal(onlineURL) {
    editingOnlineURL = onlineURL;
    for (var i=0; i<storage.onlineURLs.length; i++){
        if (editingOnlineURL == storage.onlineURLs[i]){
            editingOnlineURLIdx = i;
            break;
        }
    }
    $("#linkOnlineURL").attr("href", onlineURL.url);
    var $tbody = $("#modalViewOnlineURL tbody");
    $tbody.empty();
    if (onlineURL.rules && onlineURL.rules.length > 0) {
        for (var i=0; i<onlineURL.rules.length; i++) {
            var rule = onlineURL.rules[i];
            $tbody.append(
                $("<tr>").append(
                    $("<td>").append(
                        $("<input>", {type: "checkbox"}).addClass("checkbox").prop("checked", rule.enable).change(function () {
                            var idx = $(this).closest("tr").index();
                            editingOnlineURL.rules[idx].enable = $(this).prop("checked");
                            /* Disable auto update */
                            var $tr = $("#tblOnlineURLs tbody tr").eq(editingOnlineURLIdx);
                            $tr.find(":checkbox").eq(1).prop("checked", false);
                            editingOnlineURL.auto = false;
                        })
                    ),
                    $("<td>").append(
                        $("<span>").text(rule.origin),
                        $("<br>"),
                        $("<span>").text(rule.target)
                    )
                )
            );
        }
    }
    $("#modalViewOnlineURL").modal("show");
}

var editingRule = null;

/* Add custom rule */
$("#btnAddCustomRule").click(function () {
    var hasEmpty = false;
    $("#tblCustomRules tbody tr").each(function () {
        var origin = $(this).find("span").get(1).innerText;
        var target = $(this).find("span").get(2).innerText;
        if (origin == "" && target == "") {
            hasEmpty = true;
            return false;
        }
    });
    if (!hasEmpty) {
        var rule = {
            enable: true
        };
        editingRule = null;
        showEditCustomRuleModal(rule);
    }
});

/* Edit a custom rule */
$("#btnEditCustomRule").click(function () {
    var selectedIndex = -1;
    $("#tblCustomRules tbody tr").each(function (i) {
        var $selected = $(this).find("input[type='checkbox']").first();
        if ($selected.is(":checked")) {
            selectedIndex = i;
            return false;
        }
    });
    if (selectedIndex >= 0) {
        var rule = storage.customRules[selectedIndex];
        editingRule = rule;
        showEditCustomRuleModal(rule);
    }
});

/* Delete custom rule */
$("#btnDeleteCustomRule").click(function () {
    $("#tblCustomRules tbody tr").each(function () {
        if ($(this).find(":checkbox").first().is(":checked")) {
            storage.customRules.removeAt($(this).closest("tr").index());
            $(this).remove();
        }
    });
    $("#tblCustomRules thead :checkbox").prop("checked", false);
});

/* Show Edit custom rule modal */
function showEditCustomRuleModal(rule) {
    $("#cbDecode").prop("checked", false);
    $("#divMethods input[type='checkbox']").prop('checked', false);
    $("#divTypes input[type='checkbox']").prop('checked', false);
    if (rule) {
        $("#txtDescription").val(rule.description);
        $("#txtOrigin").val(rule.origin);
        $("#txtTarget").val(rule.target);
        $("#txtExclude").val(rule.exclude);
        $("#cbDecode").prop("checked", rule.decode);
        $("#txtExample").val(rule.example);
        $("#txtTestResult").val("");
        if (rule.methods && rule.methods.length > 0) {
            $("#cbMethodAll").prop("checked", false);
            for (var i=0; i<rule.methods.length; i++) {
                $("#cbMethod_"+rule.methods[i]).prop("checked", true);
            }
            $("#divMethods").collapse("show");
        } else {
            $("#cbMethodAll").prop("checked", true);
            $("#divMethods").collapse("hide");
        }

        if (rule.types && rule.types.length > 0) {
            $("#cbTypeAll").prop("checked", false);
            for (var i=0; i<rule.types.length; i++) {
                $("#cbType_"+rule.types[i]).prop("checked", true);
            }
            $("#divTypes").collapse("show");
        } else {
            $("#cbTypeAll").prop("checked", true);
            $("#divTypes").collapse("hide");
        }
    } else {
        $("#txtDescription").val("");
        $("#txtOrigin").val("");
        $("#txtTarget").val("");
        $("#txtExclude").val("");
        $("#cbDecode").prop("checked", false);
        $("#txtTestOrigin").val("");
        $("#txtTestResult").val("");
        $("#cbTypeAll").prop("checked", true);
        $("#cbMethodAll").prop("checked", true);
    }
    $("#modalEditUserRule").modal("show");
}

/* Remove input text */
$("button.remove").click(function () {
    var $input = $(this).closest("div").find(":text").first();
    $input.val("");
});

/* Test rule */
$("#btnTest").click(function () {
    var testRule = new Rule();
    testRule.origin = $("#txtOrigin").val();
    testRule.exclude = $("#txtExclude").val();
    testRule.target = $("#txtTarget").val();
    testRule.decode = $("#cbDecode").prop("checked");
    testRule.enable = true;
    var testOrigin = $("#txtExample").val();
    var newURL = testRule.redirect(testOrigin, testRule.decode);
    $("#txtTestResult").val(newURL);
});

/* types */
$("#cbTypeAll").change(function () {
    if ($(this).is(":checked")) {
        $("#divTypes").collapse("hide");
        $("#divTypes input[type='checkbox']").prop("checked", false);
    } else {
        $("#divTypes").collapse("show");
        $("#divTypes input[type='checkbox']").prop("checked", false);
    }
});

/* methods */
$("#cbMethodAll").change(function () {
    if ($(this).is(":checked")) {
        $("#divMethods").collapse("hide");
        $("#divMethods input[type='checkbox']").prop("checked", false);
    } else {
        $("#divMethods").collapse("show");
        $("#divMethods input[type='checkbox']").prop("checked", false);
    }
});

/* confirm */
$("#btnConfirmCustomRule").click(function () {
    if ($("#txtOrigin").val() == "") {
        $("#txtOrigin").get(0).focus();
        return;
    }
    if ($("#txtTarget").val() == "") {
        $("#txtTarget").get(0).focus();
        return;
    }
    if (!editingRule) {
        editingRule = new Rule();
        editingRule.enable = true;
        storage.customRules.push(editingRule);
    }
    editingRule.description = $("#txtDescription").val();
    editingRule.origin = $("#txtOrigin").val();
    editingRule.target = $("#txtTarget").val();
    editingRule.exclude = $("#txtExclude").val();
    editingRule.example = $("#txtExample").val();
    editingRule.decode = $("#cbDecode").prop("checked");
    editingRule.methods = [];
    if (!$("#cbMethodAll").is(":checked")) {
        $("#divMethods input[type='checkbox']").each(function () {
            if ($(this).is(":checked")) {
                var method = $(this).data("method");
                editingRule.methods.push(method)
            }
        })
    }
    editingRule.types = [];
    if (!$("#cbTypeAll").is(":checked")) {
        $("#divTypes input[type='checkbox']").each(function () {
            if ($(this).is(":checked")) {
                var type = $(this).data("type");
                editingRule.types.push(type)
            }
        })
    }
    /* update display */
    displayAll();
    $("#modalEditUserRule").modal("hide");
});

/* View user rule of JSON format */
$("#btnViewCustomeRule").click(function () {
    var userRules = {
        "version": "1.0",
        "rules": storage.customRules
    };
    var json_content = JSON.stringify(userRules, null, 2);
    $("#modalViewUserRule textarea").text(json_content);
    $("#modalViewUserRule").modal("show");
});

/* Initialize */
function reload() {
    load("storage", function (item) {
        storage = new Storage();
        if (item && item.storage) {
            storage.fromObject(item.storage);
        }
        displayAll();
    });
}

/* Listen for storage changed event */
browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        reload();
    }
});

reload();

/* Fix the header when it hits top of the screen */
$(document).ready(function () {
    var div = $('.sticky-header');
    var start = $(div).offset().top;
    $.event.add(window, 'scroll', function () {
        var p = $(window).scrollTop();
        $(div).css({
            'position': (p>start)?'fixed':'static',
            'top': (p>start)?'0px':'',
            'width': $(div).parent().css('width')
        });
        $('#tblCustomRules').css('margin-top', (p>start)?$(div).height():'');
    });
});
