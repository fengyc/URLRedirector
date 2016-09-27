/* common prototype */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                return i;
            }
        }
        return -1;
    };
}

if (!Array.prototype.indexOfAll) {
    Array.prototype.indexOfAll = function (val) {
        var indexArray = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                indexArray.push(i);
            }
        }
        return indexArray;
    };
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
}

if (!Array.prototype.removeAt) {
    Array.prototype.removeAt = function (index) {
        this.splice(index, 1);
    };
}

if (!Array.prototype.insert) {
    Array.prototype.insert = function (index, item) {
        this.splice(index, 0, item);
    };
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}