import { assert } from "./utils.js";

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {MouseEvent} e 
 * @returns 
 */
function getMousePosition(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}

export default class Mouse {
  // Current x
  /** @type {number} */
   x;
   /** @type {number} */
   y;

  // Current y;
  /** @type {number} */
   cx;
   /** @type {number} */
   cy;

  // Previous x
  /** @type {number} */
   px;
   /** @type {number} */
   py;

  // Mouse down
  /** @type {number} */
   mdx;
   /** @type {number} */
   mdy;

  // Mouse move
  /** @type {number} */
   mmx;
   /** @type {number} */
   mmy;

  // Mouse up
  /** @type {number} */
   mux;
   /** @type {number} */
   muy;

  // Mouse button down
  /** @type {boolean} */
   mbdo;
   /** @type {boolean} */
   mbdr;

  // Double click
  /** @type {number} */
   dcx;
   /** @type {number} */
   dcy;

   /** @type {number} */
   wdy;

  constructor() {
    this.x = 0;
    this.y = 0;

    this.cx = 0;
    this.cy = 0;

    this.px = 0;
    this.py = 0;

    this.mdx = 0;
    this.mdy = 0;

    this.mux = 0;
    this.muy = 0;

    this.mmx = 0;
    this.mmy = 0;

    this.mbdo = false; // mosue button down
    this.mbdr = false; // mouse button dragged

    this.dcx = 0;
    this.dcy = 0;

    this.wdy = 0; // wheel delta y
  }

  /**
   * TODO: prefix with number
   * 
   * @param {number} x 
   * @param {number} y 
   */
  setXY(x, y) {
    const px = this.x;
    const py = this.y;

    this.x = x;
    this.y = y;

    this.cx = x;
    this.cy = y;

    this.px = px;
    this.py = py;
  }

  /**
   * 
   * @param {MouseEvent | WheelEvent} e 
   * 
   * @returns {void}
   */
  consume(e) {
    const target = e.target;

    assert(target !== null);

    if (e instanceof WheelEvent) {
      if (e.type === "wheel") {
        this.wdy = e.deltaY;
      } else {
        throw new Error(`Unhandled wheel event type: ${e.type}`);
      }
    } else if (e instanceof MouseEvent) {
      // @ts-ignore
      const { x, y } = getMousePosition(e.target, e);

      this.setXY(x, y);

      if (e.type === "mousemove") {
        this.mmx = x;
        this.mmy = y;

        if (this.mbdo) {
          this.mbdr = true;
        }
      } else if (e.type === "mousedown") {
        this.mbdo = true;

        this.mdx = x;
        this.mdy = y;
      } else if (e.type === "mouseup") {
        this.mbdo = false;
        this.mbdr = false;

        this.mux = x;
        this.muy = y;
      } else if (e.type === "dblclick") {
        this.dcx = x;
        this.dcy = y;
      } else {
        throw new Error(`Unhandled mouse event type: ${e.type}`);
      }
    } else {
      console.error("ERROR:", e);
      throw new Error("Unhandled event!");
    }
  }
}
