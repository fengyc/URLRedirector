/**
 * Models of URLRedirector.
 */

/* A rule */
function Rule() {
    this.description = null;        // Rule description
    this.origin = null;             // Origin url pattern
    this.exclude = null;            // Exclude url pattern
    this.methods = [];              // Http methods
    this.types = [];                // Resource types
    this.target = null;             // Target url pattern
    this.example = null;            // An Test example
    this.enable = false;            // Enable or not
    this.event = "onBeforeRequest"; // Event
    this.handler = "redirect";      // Handler
    this.args = {};                 // Other handler args
    this.process = null;            // Process match, urlEncode / urlDecode / base64Encode / base64Decode
}

/**
 * Get a property of rule.
 *
 * @param name Name of the property
 */
Rule.prototype.get = function (name) {
    if (this.hasOwnProperty(name)) {
        return this[name];
    }
    if (this.args.hasOwnProperty(name)) {
        return this.args[name];
    }
    return undefined;
};

/**
 * Create a rule object from a plain object.
 *
 * @param obj Plain object
 */
Rule.prototype.fromObject = function (obj) {
    for (var i in obj){
        if (this.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
    if (this.origin) {
        this._originRe = new RegExp(this.origin, "g");
    }
    if (this.exclude) {
        this._excludeRe = new RegExp(this.exclude, "g");
    }
};

/* Redirect of a rule */
Rule.prototype.redirect = function (url, method, type) {
    if (this.enable && this._originRe) {
        this._originRe.lastIndex = 0;
        if (this._originRe.test(url)) {
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
            if (this._excludeRe) {
                this._excludeRe.lastIndex = 0;
                if (this._excludeRe.test(url)) {
                    return null;
                }
            }
            /* Process match or not */
            if (this.process) {
                this._originRe.lastIndex = 0;
                var matches = this._originRe.exec(url);
                var newURL = this.target;
                if (matches) {
                    for (var i = 1; i < matches.length; i++) {
                        var m = matches[i] || "";
                        try {
                            if (this.process == "urlEncode") {
                                m = encodeURIComponent(m);
                            }
                            else if (this.process == "urlDecode") {
                                m = decodeURIComponent(m);
                            }
                            else if (this.process == "base64Encode") {
                                m = btoa(m);
                            }
                            else if (this.process == "base64Decode") {
                                m = atob(m);
                            }
                        } catch (err) {
                            // Something error, could not process
                            // console.warn("Could not process " + this.process + " " + m);
                            return null;
                        }
                        newURL = newURL.replace(new RegExp("\\$" + i, "g"), m);
                    }
                    return newURL;
                }
            } else {
                /* Return a new url */
                this._originRe.lastIndex = 0;
                var newURL = url.replace(this._originRe, this.target);
                return newURL;
            }
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
