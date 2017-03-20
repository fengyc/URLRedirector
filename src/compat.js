/*!
 * Browser compatibility.
 */

/* Fix chrome */
if (typeof browser == "undefined" && chrome) {
    var browser = chrome;
}
