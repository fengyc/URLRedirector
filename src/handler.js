/**
 * WebRequest Handlers of URLRedirector.
 *
 * See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest
 * Events should be one of the followings:
 *    - onBeforeRequest
 *    - onBeforeSendHeaders
 *    - onSendHeaders
 *    - onHeadersReceived
 *    - onBeforeRedirect
 *    - onAuthRequired
 *    - onResponseStarted
 *    - onComplected
 * A handler must handle web request details and return the result.
 */


/**
 * Handler.
 * @constructor
 */
function Handler() {
  this.rules = [];
}

Handler.prototype.name = null;
Handler.prototype.supportedEvents = [];

/**
 * Clear rules.
 */
Handler.prototype.clear = function () {
  this.rules = [];
};

/**
 * Register a rule.
 * @param rule
 * @returns {boolean}
 */
Handler.prototype.register = function (rule) {
  if (this.name == rule.handler) {
    for (var i = 0; i < this.supportedEvents.length; i++) {
      if (rule.event == this.supportedEvents[i]) {
        this.rules.append(rule);
        return true;
      }
    }
  }
  return false;
};

/**
 * Do handle.
 * @param details
 */
Handler.prototype.handle = function (details) {
  throw "Not implemented";
};


function _match(rule, details) {
  if (rule.enable) {
    for (var i in rule) {
      var prop = rule[i];
      if (typeof prop == "string" ) {

      }
    }
  }
  return false;
}


/**
 * Cancel web request.
 * @constructor
 */
function Cancel() {
}

Cancel.prototype = new Handler();
Cancel.prototype.name = "cancel";
Cancel.prototype.supportedEvents = [
  "onBeforeRequest",
  "onBeforeSendHeaders",
  "onAuthRequired"
];

Cancel.prototype.handle = function (details) {
  return {
    cancel: true
  }
};

Cancel.prototype.handle = function (details) {
  for (var i in this.rules) {
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
function Skip() {
}

Skip.prototype = new Handler();
Skip.prototype.name = "skip";
Skip.prototype.supportedEvents = [
  "onBeforeRequest",
  "onBeforeSendHeaders",
  "onSendHeaders",
  "onHeadersReceived",
  "onBeforeRedirect",
  "onAuthRequired",
  "onResponseStarted",
  "onComplected"
];

Skip.prototype.handle = function (details) {
  return null;
};

/**
 * Redirect handler.
 * @constructor
 */
function Redirect() {
}

Redirect.prototype = new Handler();
Redirect.prototype.name = "redirect";
Redirect.prototype.supportedEvents = [
  "onBeforeRequest",
  "onHeaderReceived",
  "onAuthRequired"
];

Redirect.prototype.handle = function (details) {
  return {
    redirectUrl: ""
  }
};




