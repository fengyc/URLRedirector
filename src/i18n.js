/**
 * i18n support
 *
 * Replace text or attribute of DOM element with i18n message.
 * See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization
 *
 * elements with class i18n
 * data-i18n_attr_xxx for element attributes
 * data-i18n_text for element text
 * e.g. <span class="i18n" data-i18n_text=""></span>
 *
 */

function getI18nMessage(msgId) {
    if (browser.i18n && browser.i18n.getMessage) {
        return browser.i18n.getMessage(msgId);
    }
    return undefined;
}


$(document).ready(function () {
    /* Elements with class "i18n" need to be handled. */
    $(".i18n").each(function () {
        /* text */
        if ($(this).data("i18n_text")) {
            var msgId = $(this).data("i18n_text");
            var msg = getI18nMessage(msgId);
            // If a message can't be found, firefox return "\"??" ad logs an error, chrome return ""
            // See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/getMessage
            if (msg && msg != "\"??") {
                $(this).text(msg);
            }
        }
        /* attributes */
        for (var p in $(this).data()){
            if (p.startsWith("i18n_attr_")) {
                var attr = p.slice("i18n_attr_".length);
                if (attr) {
                    var msgId = $(this).data(p);
                    var msg = getI18nMessage(msgId);
                    if (msg && msg != "\"??") {
                        $(this).attr(attr, msg);
                    }
                }
            }
        }
    })
});