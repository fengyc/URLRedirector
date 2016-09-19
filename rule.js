/**
 * Rule
 */

function Rule(origin, target, enable) {
    this.regExp = origin;
    this.target = target;
    if (arguments>=3) {
        this.enable = enable;
    } else {
        this.enable = true;
    }

    this.redirect = function(url) {
        var re = RegExp(this.regExp);
        if (re.match(url)) {
            return url.replace(re, target)
        }
        return null;
    }
}

function OnlineRules(url, enable) {
    this.url = url;
    if (arguments >= 2){
        this.enable = enable;
    } else {
        this.enable = true;
    }
    this.updatedAt = null;
    this.rules = [];

    this.update = function() {}

}