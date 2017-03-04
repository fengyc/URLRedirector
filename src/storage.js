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
    _load(keys, function (item) {
        if (item && item.storage) {
            if (item.storage.sync && browser.storage.sync) {
                _load(keys, callback, browser.storage.sync)
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
