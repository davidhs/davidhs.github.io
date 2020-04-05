import { shuffle, assert } from "./utils.js";
export default class Qtree {
    constructor(parent = null, path = "") {
        this.#parent = parent;
        this.#children = [];
        this.#path = path;
        this.#claimed = false;
        this.#splits = 0;
        this.#childrenClaimed = 0;
    }
    #path;
    #children;
    #claimed;
    #splits;
    #childrenClaimed;
    #parent;
    getAvailableLeaf() {
        if (this.#claimed) {
            return null;
        }
        else {
            if (this.isLeaf()) {
                this.#claimed = true;
                if (this.#parent !== null) {
                    this.#parent.incrementCount();
                }
                return this;
            }
            else {
                const n = this.#children.length;
                const index_list = [...Array(n).keys()];
                shuffle(index_list);
                for (let i = 0; i < n; i += 1) {
                    const index = index_list[i];
                    const child = this.#children[index];
                    if (child.#claimed)
                        continue;
                    const leaf = child.getAvailableLeaf();
                    assert(leaf !== null);
                    return leaf;
                }
                return null;
            }
        }
    }
    incrementCount() {
        this.#childrenClaimed += 1;
        assert(this.#childrenClaimed >= 0 && this.#childrenClaimed <= this.#children.length);
        if (this.#childrenClaimed === this.#children.length) {
            this.#claimed = true;
            if (this.#parent !== null) {
                this.#parent.incrementCount();
            }
        }
    }
    free() {
        const n = this.#children.length;
        this.#claimed = false;
        this.#childrenClaimed = 0;
        for (let i = 0; i < n; i += 1) {
            const child = this.#children[i];
            child.free();
        }
    }
    getPath() {
        return this.#path;
    }
    getDepth() {
        return this.#splits;
    }
    /**
     * TODO: maybe implement an iterator for the children?
     */
    getChildren() {
        return this.#children;
    }
    isLeaf() {
        return this.#children.length === 0;
    }
    /**
     * Preorder: do self then children.
     *
     * @param fn
     */
    forAllPreorder(fn) {
        fn(this);
        if (!this.isLeaf()) {
            for (let i = 0; i < this.#children.length; i += 1) {
                this.#children[i].forAllPreorder(fn);
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
            for (let i = 0; i < this.#children.length; i += 1) {
                this.#children[i].forPostPreorder(fn);
            }
        }
        fn(this);
    }
    splitSelf() {
        if (this.#children.length === 0) {
            this.#splits += 1;
            for (let i = 0; i < 4; i += 1) {
                this.#children.push(new Qtree(this, this.#path + (i + 1)));
            }
        }
    }
    _splitSubTree() {
        if (this.#children.length === 0) {
            this.splitSelf();
        }
        else {
            for (let i = 0; i < 4; i += 1) {
                this.#children[i]._splitSubTree();
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
