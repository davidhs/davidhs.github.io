import { shuffle, assert } from "./utils.js";

export default class Qtree {
  /**
   * TODO: prefix with _
   * @type {string}
   */
   path;
  /**
   * TODO: prefix with _
   * @type {Qtree[]}
   */
   children;
  /**
   * TODO: prefix with _
   * @type {boolean}
   */
   claimed;
  /**
   * TODO: prefix with _
   * @type {number}
   */
   splits;
  /**
   * TODO: prefix with _
   * @type {number}
   */
   childrenClaimed;
  /**
   * TODO: prefix with _
   * @type {Qtree | null}
   */
   parent;

  /**
   * 
   * @param {Qtree?} parent 
   * @param {string?} path 
   */
  constructor(parent = null, path = "") {
    this.parent = parent;
    this.children = [];
    this.path = path;
    this.claimed = false;
    this.splits = 0;
    this.childrenClaimed = 0;
  }

  /**
   * 
   * @returns {Qtree | null}
   */
   getAvailableLeaf() {
    if (this.claimed) {
      return null;
    } else {
      if (this.isLeaf()) {
        this.claimed = true;

        if (this.parent !== null) {
          this.parent.incrementCount();
        }

        return this;
      } else {
        const n = this.children.length;

        const index_list = [...Array(n).keys()];
        shuffle(index_list);

        for (let i = 0; i < n; i += 1) {
          const index = index_list[i];

          const child = this.children[index];

          if (child.claimed) continue;

          const leaf = child.getAvailableLeaf();

          assert(leaf !== null);

          return leaf;
        }

        return null;
      }
    }
  }

  /**
   * TODO: prepend with _
   */
  incrementCount() {
    this.childrenClaimed += 1;

    assert(this.childrenClaimed >= 0 && this.childrenClaimed <= this.children.length);

    if (this.childrenClaimed === this.children.length) {
      this.claimed = true;

      if (this.parent !== null) {
        this.parent.incrementCount();
      }
    }
  }

  /**
   * @returns {void}
   */
   free() {
    const n = this.children.length;

    this.claimed = false;
    this.childrenClaimed = 0;

    for (let i = 0; i < n; i += 1) {
      const child = this.children[i];

      child.free();
    }
  }

  /**
   * 
   * @returns {string}
   */
   getPath() {
    return this.path;
  }

  /**
   * 
   * @returns {number}
   */
   getDepth() {
    return this.splits;
  }

  /**
   * TODO: maybe implement an iterator for the children?
   * 
   * @returns {Qtree[]}
   */
   getChildren() {
    return this.children;
  }

   isLeaf() {
    return this.children.length === 0;
  }

  /**
   * Preorder: do self then children.
   * 
   * @param {(self: Qtree) => void} fn 
   * 
   * @returns {void}
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
   * @param {(self: Qtree) => void} fn 
   * @returns {void}
   */
   forPostPreorder(fn) {
    if (!this.isLeaf()) {
      for (let i = 0; i < this.children.length; i += 1) {
        this.children[i].forPostPreorder(fn);
      }
    }

    fn(this);
  }

  /**
   * TODO: prepend _
   * 
   * @returns {void}
   */
   splitSelf() {
    if (this.children.length === 0) {
      this.splits += 1;
      for (let i = 0; i < 4; i += 1) {
        this.children.push(new Qtree(this, this.path + (i + 1)));
      }
    }
  }

  /**
   * @returns {void}
   */
   _splitSubTree() {
    if (this.children.length === 0) {
      this.splitSelf();
    } else {
      for (let i = 0; i < 4; i += 1) {
        this.children[i]._splitSubTree();
      }
    }
  }

  /**
   * 
   * @param {number=} times 
   * 
   * @returns {void}
   */
   splitSubTree(times) {
    times = typeof times !== "undefined" ? times : 1;

    for (let i = 0; i < times; i += 1) {
      this._splitSubTree();
    }
  }
}
