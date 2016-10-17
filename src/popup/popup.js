/**
 * Javascript of popup
 */

/* Display all */
function displayAll() {
    load("storage", function (item) {
        if (item && item.storage) {
            storage = item.storage;
        } else {
            storage = {};
        }
        $("#chbEnable").attr('checked', storage.enable);
        $("#updateInterval").html(storage.updateInterval);
        if (storage.updatedAt) {
            var updatedAt = new Date(storage.updatedAt);
            $("#updatedAt").text(updatedAt.toLocaleTimeString());
        }
    });
}

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        displayAll();
    }
});

$("#chbEnable").click(function () {
    load("storage", function (item) {
        if (item && item.storage) {
            storage = item.storage;
        }
        storage.enable = $("#chbEnable").is(":checked");
        save({storage: storage});
    });
});

$("#btnOptions").click(function () {
    browser.runtime.openOptionsPage();
    window.close();
});

setTimeout(function () {
    displayAll();
}, 150);
