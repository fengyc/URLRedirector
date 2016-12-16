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


function getI18NMessage(msg) {
    var remains = msg;
    msg = "";
    while (remains) {
        var posStart = remains.indexOf(_MSG_PREFIX);
        if (posStart < 0) {
            msg += remains;
            break
        }
        var posEnd = remains.indexOf(_MSG_SURFIX, posStart + _MSG_PREFIX.length + 1);
        if (posEnd < 0) {
            msg += remains;
            break
        }
        var msgId = remains.slice(posStart + _MSG_PREFIX.length, posEnd);
        msg += remains.slice(0, posStart);
        if (msgId.startsWith(_MSG_CONTANT_PREFIX) && _I18N_CONTANT[value]) {
            if (_I18N_CONTANT[value]) {
                msg += _I18N_CONTANT[msgId];
            }
        }
        else {
            msg += browser.i18n.getMessage(msgId);
        }
        remains = remains.slice(posEnd + _MSG_SURFIX.length);
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
        if (this.tagName === "SPAN" || this.tagName === "OPTION") {
            var text = $(this).text();
            if (text) {
                text = getI18NMessage(text);
                $(this).text(text);
            }
        }
    })
});
