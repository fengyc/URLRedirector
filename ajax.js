
function createXmlHttpRequest() {
    if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
}

function AJAX() {
    this.xmlHttpRequest = createXmlHttpRequest();

    this.get = function (url, callback){
        this.xmlHttpRequest.open("GET", url);
        this.xmlHttpRequest.onreadystatechange = callback;
        this.xmlHttpRequest.send(null);
    };

    this.post = function (url, data, callback) {
        this.xmlHttpRequest.open("POST", url);
        this.xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this.xmlHttpRequest.onreadystatechange = callback;
        this.xmlHttpRequest.send(data);
    }
}