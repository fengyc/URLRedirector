/**
 * WebRequest Handlers of URLRedirector.
 *
 * A handler must handle web request details and return the result.
 */


/**
 * Handler.
 * @constructor
 */
function Handler() {
    this.rules = [];
}

Handler.prototype = {
    name: null,
    supportedEvents: [],
    clear: function () {
        this.rules = [];
    },
    register: function (rule) {
        if (this.name == rule.handler ) {
            for (var i=0;i<this.supportedEvents.length;i++) {
                if (rule.event == this.supportedEvents[i]) {
                    this.rules.append(rule);
                    return true;
                }
            }
        }
        return false;
    },
    handle: function (details) {
        throw "Not implemented";
    }
};


/**
 * Cancel web request.
 * @constructor
 */
function Cancel() {}

Cancel.prototype = new Handler();
Cancel.prototype.name = "cancel";
Cancel.prototype.supportedEvents = ["onBeforeRequest", "onHeaderReceived"];

Cancel.prototype.handle = function (details) {
    for (var i=0; i<this.rules.length; i++ ) {
        var rule = this.rules[i];
        if (rule.enable) {

        }
    }
    return {
        cancel: true
    }
};


/**
 * Skip other handlers and continue
 * @constructor
 */
function Continue() {}

Continue.prototype = new Handler();



/**
 * Redirect handler.
 * @constructor
 */
function Redirect() {}

Redirect.prototype = new Handler();
Redirect.prototype.name = "redirect";
Redirect.prototype.supportedEvents = ["onBeforeRequest", "onHeaderReceived"];

Redirect.prototype.handle = function (details) {

};




