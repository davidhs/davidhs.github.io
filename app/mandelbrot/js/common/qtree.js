export default class Qtree {
    constructor(path, parent) {
        this.parent = typeof parent !== "undefined" ? parent : null;
        this.children = [];
        this.data = {};
        this.path = typeof path !== "undefined" ? path : "";
        this.flag = false;
        this.splits = 0;
    }
    getPath() {
        return this.path;
    }
    getDepth() {
        return this.splits;
    }
    setData(data) {
        this.data = data;
    }
    getFlag() {
        return this.flag;
    }
    setFlag(flag) {
        this.flag = flag;
        if (this.parent !== null) {
            this.parent.checkFlagStatus();
        }
    }
    /**
     * TODO: maybe implement an iterator for the children?
     */
    getChildren() {
        return this.children;
    }
    checkFlagStatus() {
        let sum = 0;
        if (this.children.length === 4) {
            for (let i = 0; i < this.children.length; i += 1) {
                let child = this.children[i];
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
    }
    isLeaf() {
        return this.children.length === 0;
    }
    /**
     * Preorder: do self then children.
     *
     * @param fn
     */
    forAllPreorder(fn) {
        fn(this);
        if (!this.isLeaf()) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].forAllPreorder(fn);
            }
        }
    }
    /**
     * Postorder: do children then self.
     *
     * @param fn
     */
    forPostPreorder(fn) {
        if (!this.isLeaf()) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].forPostPreorder(fn);
            }
        }
        fn(this);
    }
    splitSelf() {
        if (this.children.length === 0) {
            this.splits += 1;
            for (let i = 0; i < 4; i += 1) {
                this.children.push(new Qtree(this.path + (i + 1), this));
            }
        }
    }
    _splitSubTree() {
        if (this.children.length === 0) {
            this.splitSelf();
        }
        else {
            for (let i = 0; i < 4; i += 1) {
                this.children[i]._splitSubTree();
            }
        }
    }
    splitSubTree(times) {
        times = typeof times !== "undefined" ? times : 1;
        for (let i = 0; i < times; i += 1) {
            this._splitSubTree();
        }
    }
}
