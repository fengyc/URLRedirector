/**
 * Models of URLRedirector.
 */

/* A rule */
function Rule() {
    this.description = null;    // Rule description
    this.origin = null;         // Origin url pattern
    this.exclude = null;        // Exclude url pattern
    this.methods = [];          // Http methods
    this.types = [];            // Resource types
    this.target = null;         // Target url pattern
    this.example = null;        // An Test example
    this.enable = false;        // Enable or not
}

/* From a plain object */
Rule.prototype.fromObject = function (obj) {
    for (var i in obj){
        if (this.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

/* Redirect of a rule */
Rule.prototype.redirect = function (url, method, type) {
    if (this.enable && this.origin) {
        var ruleRe = new RegExp(this.origin);
        if (ruleRe.test(url)) {
            /* Check method */
            if (arguments.length > 1 && method) {
                if (this.methods && this.methods.length > 0) {
                    var methodMatched = false;
                    for (var i = 0; i < this.methods.length; i++) {
                        if (this.methods[i] == method) {
                            methodMatched = true;
                            break;
                        }
                    }
                    if (!methodMatched) {
                        return null;
                    }
                }
            }
            /* Check resource type */
            if (arguments.length > 2 && type) {
                if (this.types && this.types.length > 0) {
                    var typeMatched = false;
                    for (var i = 0; i < this.types.length; i++) {
                        if (this.types[i] == type) {
                            typeMatched = true;
                            break;
                        }
                    }
                    if (!typeMatched) {
                        return null;
                    }
                }
            }
            /* Exclude some rule */
            if (this.exclude && this.exclude != "") {
                var excludeRe = new RegExp(this.exclude);
                if (excludeRe.test(url)) {
                    return null;
                }
            }
            /* Return a new url */
            var newURL = url.replace(ruleRe, this.target);
            return newURL;
        }
    }
    return null;
};


/* An online url */
function OnlineURL() {
    this.description = null;    // Description
    this.url = null;            // URL of the resource
    this.enable = false;        // Enable or not
    this.auto = true;           // Auto download
    this.rules = [];            // Rules
}

/* From a plain object */
OnlineURL.prototype.fromObject = function (obj) {
    for (var i in obj){
        /* Rules */
        if (i == "rules") {
            this.rules = [];
            if (obj[i] && obj[i].length > 0) {
                for (var j=0; j<obj[i].length; j++) {
                    var rule = new Rule();
                    rule.fromObject(obj[i][j]);
                    this.rules.push(rule);
                }
            }
        }
        else if (this.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

/* Redirect of an online url */
OnlineURL.prototype.redirect = function (url, method, type) {
    if (this.enable && this.rules && this.rules.length > 0) {
        for (var i=0; i<this.rules.length; i++){
            var newURL = this.rules[i].redirect(url, method, type);
            if (newURL) {
                return newURL;
            }
        }
    }
    return null;
};


/* Options storage */
function Storage() {
    this.enable = false;            // Enable or not
    this.sync = false;              // Enable sync between browser
    this.updateInterval = 900;      // Default update interval is 15min
    this.updatedAt = null;          // Last update time
    this.onlineURLs = [];           // Online urls
    this.customRules = [];          // User defined rules
}

/* From a plain object */
Storage.prototype.fromObject = function (obj) {
    for (var i in obj) {
        /* Online urls */
        if (i == "onlineURLs") {
            this.onlineURLs = [];
            if (obj[i] && obj[i].length > 0) {
                for (var j=0; j<obj[i].length; j++) {
                    var onlineURL = new OnlineURL();
                    onlineURL.fromObject(obj[i][j]);
                    this.onlineURLs.push(onlineURL);
                }
            }
        }
        /* Custom rules */
        else if (i == "customRules") {
            this.customRules = [];
            if (obj[i] && obj[i].length > 0) {
                for (var j=0; j<obj[i].length; j++) {
                    var customRule = new Rule();
                    customRule.fromObject(obj[i][j]);
                    this.customRules.push(customRule);
                }
            }
        }
        else if (this.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

/* Redirect */
Storage.prototype.redirect = function (url, method, type) {
    if (this.enable) {
        if (this.customRules && this.customRules.length > 0) {
            for (var i=0; i<this.customRules.length; i++) {
                var newURL = this.customRules[i].redirect(url, method, type);
                if (newURL) {
                    return newURL;
                }
            }
        }
        if (this.onlineURLs && this.onlineURLs.length > 0) {
            for (var i=0; i<this.onlineURLs.length; i++) {
                var newURL = this.onlineURLs[i].redirect(url, method, type);
                if (newURL) {
                    return newURL;
                }
            }
        }
    }
    return null;
};
