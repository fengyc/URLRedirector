/**
 * Rule and OnlineURL entities
 */

function Rule(origin, kind, target, enable, params) {
    this.origin = origin;
    this.re = null;
    this.kind = kind;
    this.target = target;
    this.targetFn = null;

    if (arguments>=3) {
        this.enable = enable;
    } else {
        this.enable = true;
    }

    this.redirect = function(url) {
        if (this.re == null) {
            this.re = RegExp(this.origin);
        }
        if (this.re.match(url)) {
            if (kind == 'function') {
                if (this.targetFn == null) {
                    /* use "arguments" to get arguments inside the function */
                    this.targetFn = new Function(this.target)
                }
                return url.replace(this.re, self.targetFn);
            }
            return url.replace(this.re, target)
        }
        return null;
    }
}

function OnlineURL(url, enable) {
    this.url = url;
    this.author = "unknow";
    this.rules = [];
    this.createdAt = null;
    this.updatedAt = null;

    if (arguments >= 2){
        this.enable = enable;
    } else {
        this.enable = true;
    }
}