export default class Quadtree {
  /**
   * TODO: prefix with _
   * @type {Quadtree | null}
   */
  parent;
  /**
   * TODO: prefix with _
   * @type {Quadtree[]}
   */
  children;

  /**
   * 
   * @param {Quadtree?} parent 
   */
  constructor(parent = null) {
    this.parent = parent;
    this.children = [];
  }
}
