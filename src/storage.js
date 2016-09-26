/**
 * Storage of redirect rules.
 */

var _local = browser.storage.local;

function Storage(){
    this.enable = true;
    this.onlineURLs = [];
    this.updateInterval = 3600;
    this.updatedAt = new Date();
    this.customRules = [];

    this._logError = function () {
        if (browser.runtime.lastError) {
            console.log(browser.runtime.lastError);
        }
    };

    this._logErrorAndCache = function(attr) {
        function setItem(item) {
            if (browser.runtime.lastError) {
                console.log(browser.runtime.lastError);
            } else {
                if (attr && item) {
                    this[attr] = item;
                }
            }
        }
        return setItem
    };

    this.getEnable = function() {
        _local.get(
            "enabled",
            this._logErrorAndCache("enable")
        );
    };

    this.saveEnable = function () {
        _local.set(
            {"enabled": this.enabled},
            this._logError
        );
    };

    this.getOnlineURLs = function(urls) {
        urls = _local.get(
            "online_urls",
            this._logErrorAndCache("onlineURLs")
        );
    };

    this.saveOnlineURLs = function() {
        _local.set(
            {"online_urls": this.onlineURLs},
            this._logError
        );
    };

    this.getUpdateInterval = function() {
        _local.get(
            "update_interval",
            this._logErrorAndCache("updateInterval")
        );
    };

    this.saveUpdateInterval = function() {
        _local.set(
            {"update_interval": this.updateInterval},
            this._logError
        );
    };

    this.getCustomRules = function() {
        rules = _local.get(
            "custom_ruls",
            this._logErrorAndCache("customRules")
        );
    };

    this.saveCustomRules = function() {
        _local.set(
            {"custom_rules": this.customRules},
            this._logError
        );
    };

    this.getUpdatedAt = function() {
        _local.get(
            "updated_at",
            this._logErrorAndCache("updatedAt")
        );
    };

    this.saveUpdatedAt = function() {
        _local.set(
            {"updated_at": this.updatedAt},
            this._logError
        );
    };

    this.reload = function () {
        console.log(this);
        this.getEnable();
        this.getOnlineURLs();
        this.getCustomRules();
        this.getUpdateInterval();
        this.getUpdatedAt();
    };
}