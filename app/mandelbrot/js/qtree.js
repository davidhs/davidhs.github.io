var Qtree = (function () {
    function Qtree(path, parent) {
        this.parent = (typeof parent !== 'undefined') ? parent : null;
        this.children = [];
        this.data = {};
        this.path = (typeof path !== 'undefined') ? path : "";
        this.flag = false;
    }
    Qtree.prototype.getPath = function () {
        return this.path;
    };
    Qtree.prototype.setData = function (data) {
        this.data = data;
    };
    Qtree.prototype.getFlag = function () {
        return this.flag;
    };
    Qtree.prototype.setFlag = function (flag) {
        this.flag = flag;
        if (this.parent) {
            this.parent.checkFlagStatus();
        }
    };
    Qtree.prototype.checkFlagStatus = function () {
        var sum = 0;
        if (this.children.length === 4) {
            for (var i = 0; i < this.children.length; i += 1) {
                var child = this.children[i];
                if (child.getFlag() === true) {
                    sum += 1;
                }
            }
            if (sum === 4) {
                this.setFlag(true);
                if (this.parent) {
                    this.parent.checkFlagStatus();
                }
            }
        }
    };
    Qtree.prototype.isLeaf = function () {
        return this.children.length === 0;
    };
    Qtree.prototype.forAll = function (func) {
        func(this);
        if (!this.isLeaf()) {
            for (var i = 0; i < this.children.length; i += 1) {
                this.children[i].forAll(func);
            }
        }
    };
    Qtree.prototype.splitSelf = function () {
        if (this.children.length === 0) {
            for (var i = 0; i < 4; i += 1) {
                this.children.push(new Qtree(this.path + (i + 1), this));
            }
        }
    };
    Qtree.prototype._splitSubTree = function () {
        if (this.children.length === 0) {
            this.splitSelf();
        }
        else {
            for (var i = 0; i < 4; i += 1) {
                this.children[i]._splitSubTree();
            }
        }
    };
    Qtree.prototype.splitSubTree = function (times) {
        times = (typeof times !== 'undefined') ? times : 1;
        for (var i = 0; i < times; i += 1) {
            this._splitSubTree();
        }
    };
    return Qtree;
}());
