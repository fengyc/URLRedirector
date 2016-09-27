/**
 * Storage of redirect rules.
 */

function _logError() {
    if (browser.runtime.lastError) {
        console.error(browser.runtime.lastError);
    }
}

var _local = browser.storage.local;

function Storage() {
    this.enable = true;
    this.onlineURLs = [];
    this.updateInterval = 60;
    this.updatedAt = new Date();
    this.customRules = [];
}

function save(storage) {
    _local.set(
        {"storage": storage},
        _logError
    );
}

function reload(storage) {
    _local.get(
        "storage",
        function (item) {
            _logError();
            if (item) {
                for (var key in item.storage) {
                    storage[key] = item.storage[key];
                }
                console.log(storage);
            }
        }
    );
}
