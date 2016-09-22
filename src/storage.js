/**
 * Storage of redirect rules.
 */

function Storage(){
    this.enable = true;
    this.onlineURLs = [];
    this.updateInterval = 3600;
    this.updatedAt = Data();
    this.customRules = [];

    this.getEnabled = function() {
        browser.storage.local.get(
            "enabled",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    if (item != null) {
                        this.customRules = item;
                    }
                }
            }
        );
    };

    this.saveOnlineURLs = function(urls) {
        browser.storage.local.set(
            {"online_urls": urls},
            function () {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                }
            }
        );
    };

    this.getOnlineURLs = function(urls) {
        urls = browser.storage.local.get(
            "online_urls",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    if (item != null) {
                        this.onlineURLs = item;
                    }
                }
            }
        );
    };

    this.getUpdateInterval = function() {
        browser.storage.local.get(
            "update_interval",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    if (item != null) {
                        this.updateInterval = item;
                    }
                }
            }
        );
    };

    this.saveUpdateInterval = function(interval) {
        browser.storage.local.set(
            {"update_interval": interval},
            function () {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                }
            }
        );
    };

    this.getCustomRules = function() {
        rules = browser.storage.local.get(
            "custom_ruls",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    if (item != null)
                    this.customRules = item;
                }
            }
        );
    };

    this.saveCustomRules = function(rules) {
        browser.storage.local.set(
            {"custom_rules": rules},
            function () {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                }
            }
        );
    };

    this.reload = function () {
        this.getEnabled();
        this.getOnlineURLs();
        this.getCustomRules();
    };

    this.reload();
}