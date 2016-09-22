/**
 * Ajax operations.
 */


function downloadRulesFrom(url){
    var rules_json = null;
    jQuery.ajax({
        async: false,
        url: url,
        type: "GET",
        success: function (result, status, xhr) {
            try {
                rules_json = JSON.parse(result);
            } catch (e) {
                console.log(e);
            }
        }
    });
    return rules_json;
}