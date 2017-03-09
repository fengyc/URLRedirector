/**
 * Storage function of URLRedirector.
 */

/* Low level load */
function _load(keys, callback, area) {
    if (!area) {
        area = browser.storage.local;
    }
    area.get(
        keys,
        function (item) {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            }
            if (callback) {
                callback(item);
            }
        }
    );
}

/* Low level save */
function _save(obj, callback, area) {
    if (!area) {
        area = browser.storage.local;
    }
    area.set(
        obj,
        function () {
            if (browser.runtime.lastError) {
                console.error(browser.runtime.lastError);
            }
            if (callback) {
                callback();
            }
        }
    );
}

function load(keys, callback) {
    // Load storage.local and check if sync is enable, then try to load
    // storage.sync, if failed fail back to storage.local
    _load(keys, function (item) {
        if (item && item.storage) {
            if (item.storage.sync && browser.storage.sync) {
                _load(keys, function (itemSync) {
                    if (itemSync == undefined || itemSync == null ||
                        itemSync.storage == undefined || itemSync.storage == null) {
                        callback(item);
                    } else {
                        callback(itemSync);
                    }
                }, browser.storage.sync)
            } else {
                callback(item);
            }
        } else {
            /* The first time to load storage, try to load storage.sync */
            if (browser.storage.sync) {
                _load(keys, function (item) {
                    callback(item);
                }, browser.storage.sync)
            } else {
                callback(item);
            }
        }
    }, browser.storage.local);
}

function save(obj, callback) {
    if (obj.storage.sync && browser.storage.sync) {
        _save(obj, function () {
            _save(obj, callback, browser.storage.local);
        }, browser.storage.sync)
    } else {
        _save(obj, callback, browser.storage.local);
    }
}
