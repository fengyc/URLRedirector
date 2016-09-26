/**
 * Javascript of popup
 */


/* Send message to background */
function sendMessage(method, args, callback) {
    if (arguments.length == 2){
        browser.runtime.sendMessage({
            method: method,
            args: args
        });
    } else if (arguments.length == 3) {
        browser.runtime.sendMessage({
            method: method,
            args: args
        }, callback);
    }
}


/* Get enable */
function displayEnable() {
    sendMessage('getEnable', {}, function(response){
        if (response != null) {
            $("#chbEnable").attr('checked', response);
        }
    })
}
//setInterval(displayEnable, 3000);


/* Get updated time */
function displayUpdatedAt() {
    sendMessage('getUpdatedAt', {}, function(response) {
        if (response) {
            $("#spanUpdate").html("更新时间:" + response);
        }
    });
}
//setInterval(displayUpdatedAt, 3000);


/* Handle events */
$("#chbEnable").click(function () {
    if($('#chbEnable').is(':checked')) {
        sendMessage("toggleEnable", {enabled:true});
    } else {
        sendMessage("toggleEnable", {enabled:false});
    }
});

$("#btnOption").click(function () {
    // go to options page
});


/* Init */
function init() {
    displayEnable();
    displayUpdatedAt();
}
init();