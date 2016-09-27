/**
 * Javascript of popup
 */

/* Send message to background */
function sendMessage(method, args, callback) {
    if (arguments.length == 2){
        browser.runtime.sendMessage({
            method: method,
            args: args
        });
    } else if (arguments.length == 3) {
        browser.runtime.sendMessage({
            method: method,
            args: args
        }, callback);
    }
}

var storage = new Storage();

/* Display all */
function displayAll() {
    browser.storage.local.get(
        "storage",
        function (item) {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            } else {
                storage = item.storage;
                console.log(storage);
                $("#chbEnable").attr('checked', storage.enable);
                $("#updateInterval").html(storage.updateInterval);
                var updatedAt = new moment(storage.updatedAt);
                $("#updatedAt").html(updatedAt.format("YYYY-MM-DD HH:mm:ss"));
            }
        }
    );
}

browser.storage.onChanged.addListener(function (changes, area) {
    if (area == "local") {
        displayAll();
    }
});

$("#chbEnable").click(function () {
    storage.enable = $('#chbEnable').is(':checked');
    save(storage);
});

$("#btnOptions").click(function () {
    browser.runtime.openOptionsPage();
    window.close();
});

displayAll();
