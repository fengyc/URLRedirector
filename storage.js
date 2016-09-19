/**
 * Storage of redirect rules.
 */

function Storage(){
    this.cache = [];
    this.updatedAt = null;

    this.saveRuleURLs = function(urls) {
        browser.storage.local.set(
            {"rule-urls": urls}
        );
    };

    this.getRuleURLs = function(urls) {
        urls = browser.storage.local.get()
    };

    this.getCustomRules = function() {
        rules = browser.storage.local.get(
            "custom"
        );
    };

    this.saveCustomRules = function(rules) {
        browser.storage.local.set(
            {"custom": rules}
        );
    };
}