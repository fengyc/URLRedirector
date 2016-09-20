/**
 * Storage of redirect rules.
 */

function Storage(){
    this.enable = true;
    this.updatedAt = null;
    this.onlineRules = [];
    this.customRules = [];

    this.getEnabled = function() {
        browser.storage.local.get(
            "enabled",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    this.customRules = item;
                }
            }
        );
    };

    this.saveOnlineRules = function(urls) {
        browser.storage.local.set(
            {"rule-urls": urls}
        );
    };

    this.getOnlineRules = function(urls) {
        urls = browser.storage.local.get()
    };

    this.getCustomRules = function() {
        rules = browser.storage.local.get(
            "custom",
            function (item) {
                if (browser.runtime.lastError) {
                    console.log(browser.runtime.lastError);
                } else {
                    this.customRules = item;
                }
            }
        );
    };

    this.saveCustomRules = function(rules) {
        browser.storage.local.set(
            {"custom": rules},
            function () {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                }
            }
        );
    };

    this.reload = function () {
        this.getCustomRules();
        this.updatedAt = new Date();
    };

    this.reload();
}