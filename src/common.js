/* common prototype */

Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            return i;
        }
    }
    return -1;
};

Array.prototype.indexOfAll = function (val) {
    var indexArray = [];
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            indexArray.push(i);
        }
    }
    return indexArray;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Array.prototype.removeAt = function(index) {
    this.splice(index, 1);
};

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
