/**
 * Javascript of popup
 */

var storage = null;

/* Display all */
function displayAll() {
    $("#chbEnable").prop('checked', storage.enable);
    if (storage.updatedAt) {
        var updatedAt = new Date(storage.updatedAt);
        $("#updatedAt").text(updatedAt.toLocaleTimeString());
    }
}

function reload() {
    load("storage", function (item) {
        storage = new Storage();
        if (item && item.storage) {
            storage.fromObject(item.storage);
        } else {
            console.warn("Could not load options storage.");
        }
        displayAll();
    })
}

/* Auto reload after storage change */
browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        reload();
    }
});

$("#chbEnable").click(function () {
    load("storage", function (item) {
        storage = new Storage();
        if (item && item.storage) {
            storage.fromObject(item.storage);
            storage.enable = $("#chbEnable").is(":checked");
            save({storage: storage});
        }
    });
});

$("#btnOptions").click(function () {
    browser.runtime.openOptionsPage();
    window.close();
});

reload();
