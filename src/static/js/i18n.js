/**
 * i18n support
 *
 * Replace text or attribute of DOM element with i18n message.
 * See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization
 *
 */

var lang = browser.i18n.getUILanguage();
var manifest = browser.runtime.getManifest();

var _MSG_PREFIX = "__MSG_";
var _MSG_SURFIX = "__";
var _MSG_CONTANT_PREFIX = "@@";
var _I18N_CONTANT = {
    "ui_locale": lang,
    "extension_id": browser.runtime.id
};


function getI18NMessage(msgId) {
    var msg = msgId;
    if (msg.startsWith(_MSG_PREFIX) && msg.endsWith(_MSG_SURFIX)) {
        msgId = msg.slice(_MSG_PREFIX.length);
        msgId = msgId.slice(0, msgId.length - _MSG_SURFIX.length);
        if (msgId.startsWith(_MSG_CONTANT_PREFIX) && _I18N_CONTANT[value]) {
            if (_I18N_CONTANT[value]) {
                msg = _I18N_CONTANT[msgId];
            }
        }
        else {
            msg = browser.i18n.getMessage(msgId);
        }
    }
    return msg;
}


$(document).ready(function () {
    /* Elements with class "i18n" need to be handled. */
    $(".i18n").each(function () {
        /* check attributes */
        for (var i=0; i<this.attributes.length; i++) {
            var attr = this.attributes[i];
            if (attr.specified) {
                var value = getI18NMessage(attr.value);
                attr.value = value;
            }
        }
        /* text */
        if (this.tagName === "SPAN") {
            var text = $(this).text();
            if (text) {
                text = getI18NMessage(text);
                $(this).text(text);
            }
        }
    })
});
