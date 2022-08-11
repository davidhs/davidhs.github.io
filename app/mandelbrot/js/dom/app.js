import Qtree from "../common/qtree.js";
import ImagePart from "../common/imagepart.js";
import Mouse from "../common/mouse.js";
import { assert } from "../common/utils.js";
// TODO: fix this
//import { Config, MessageFromMasterToSlave, MessageFromSlaveToMaster, Region } from "../common/types";

const WEB_WORKER_PATH = "js/webworker/worker.js";
const DEFAULT_NUMBER_OF_WORKS = 8;


/**
 * 
 * @param {number} canvas_width 
 * @param {number} canvas_height 
 * @param {string} pathcode 
 * @returns {Region}
 */
function getRegion(canvas_width, canvas_height, pathcode) {
  let x = 0;
  let y = 0;
  let w = canvas_width;
  let h = canvas_height;

  for (let i = 0; i < pathcode.length; i += 1) {
    const c = pathcode.charAt(i);

    switch (c) {
      case "1":
        w = Math.ceil(w / 2);
        h = Math.ceil(h / 2);
        break;
      case "2":
        x += Math.ceil(w / 2);
        w = Math.floor(w / 2);
        h = Math.ceil(h / 2);
        break;
      case "3":
        y += Math.ceil(h / 2);
        w = Math.ceil(w / 2);
        h = Math.floor(h / 2);
        break;
      case "4":
        x += Math.ceil(w / 2);
        y += Math.ceil(h / 2);
        w = Math.floor(w / 2);
        h = Math.floor(h / 2);
        break;
      default:
        throw new Error();
    }
  }

  return { x, y, w, h };
}


export default class App {
  /** @type {Config} */
   _cfg;
   /** @type {Array<Worker>} */
   _workers;
   /** @type {HTMLCanvasElement} */
   _canvas;
   /** @type {CanvasRenderingContext2D} */
   _ctx;
   /** @type {Qtree} */
   _qtree;
   /** @type {Array<ImagePart>} */
   _imageParts;
   /** @type {ImageData} */
   _imageData;
   /** @type {ImageData} */
   _imageDataBuffer;
   /** @type {Array<boolean>} */
   _isWorkerAvailable;
   /** @type {Mouse} */
   _mouse;
   /** @type {boolean} */
   _canvasNeedsToUpdate;
   /** @type {number} */
   _dx;
   /** @type {number} */
   _dy;
   /** @type {number} */
   _dw;
   /** @type {number} */
   _dh;
   /** @type {HTMLCanvasElement} */
   _back_canvas;
  /** @type {CanvasRenderingContext2D} */
  _back_ctx;

  /**
   * 
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this._back_canvas = document.createElement("canvas");
    {
      const back_ctx = this._back_canvas.getContext("2d");
      assert(back_ctx !== null);
      this._back_ctx = back_ctx;
    }

    this._dx = 0;
    this._dy = 0;
    this._dw = 0;
    this._dh = 0;


    
    this._workers = [];
    
    this._qtree = new Qtree();
    // 1 -> progress too slow (not enough regions)
    // 2 -> could be a little bit fast (not enough regions)
    // 3 -> maybe a bit more?
    // 4 -> good
    // 5 -> slower than 4
    // 6 -> too slow, too much overhead (too many regions)
    this._qtree.splitSubTree(4); // 2x2 (4)


    this._imageParts = [];
    
    this._canvasNeedsToUpdate = true;

    
    this._isWorkerAvailable = [];
    this._mouse = new Mouse();

    {
      /** @type {Config} */
      const cfg = {
        id: Date.now(),
        cw: window.innerWidth,
        ch: window.innerHeight,
        re: -0.5,
        im: +0.0,
        z: 4,
        max_iter: 30000,
      };

      this._cfg = cfg;
    }

    this._canvas = canvas;
    this._canvas.width = this._cfg.cw;
    this._canvas.height = this._cfg.ch;
    {
      const ctx = this._canvas.getContext("2d");
      assert(ctx !== null);
      this._ctx = ctx;
    }

    {
      const cw = Math.ceil(this._cfg.cw);
      const ch = Math.ceil(this._cfg.ch);
  
      for (let i = 0; i < DEFAULT_NUMBER_OF_WORKS; i += 1) {
        this._imageParts.push(new ImagePart(cw, ch, 4));
      }
    }

    for (let i = 0; i < DEFAULT_NUMBER_OF_WORKS; i += 1) {
      this._workers.push(new Worker(WEB_WORKER_PATH, { type: "module" }));
      this._isWorkerAvailable.push(true);
    }


    this._imageDataBuffer = this._ctx.createImageData(this._cfg.cw, this._cfg.ch);

    this._imageData = this._ctx.getImageData(
      0,
      0,
      this._cfg.cw,
      this._cfg.ch
    );

    ////////////////////////////////
    // Add window resize listener //
    ////////////////////////////////

    window.addEventListener("resize", () => {
      this._cfg.cw = window.innerWidth;
      this._cfg.ch = window.innerHeight;
  
      this._canvasNeedsToUpdate = true;
      this.refresh();
    }, false);

    ///////////////////////////////////
    // Add event listeners to canvas //
    ///////////////////////////////////

    this._canvas.addEventListener("mousedown", (e) => {
      this._mouse.consume(e);
    });

    this._canvas.addEventListener("mousemove", (e) => {
      const mouse = this._mouse;
      const cfg = this._cfg;

      mouse.consume(e);

      if (mouse.mbdr) {
        const canvas_dx = mouse.px - mouse.cx;
        const canvas_dy = mouse.py - mouse.cy;

        const re_old = cfg.re;
        const im_old = cfg.im;

        // -----------------------------------------------------------------------

        const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy);

        const re_new = re_old + re_delta;
        const im_new = im_old + im_delta;

        // -----------------------------------------------------------------------

        const cw = cfg.cw;
        const ch = cfg.ch;
  
        const f = 1.0; // old_zoom / new_zoom;
        
        const dw = f * cw;
        const dh = f * ch;
  
        const [pan_x, pan_y] = this.mandelbrotDeltaToCanvasDelta(re_old - re_new, im_old - im_new);
  
        const dx = pan_x + (cw - dw) / 2;
        const dy = pan_y + (ch - dh) / 2;
  
  
        this._dw = dw;
        this._dh = dh;
  
        this._dx = dx;
        this._dy = dy;

        // -----------------------------------------------------------------------

        this._cfg.re = re_new;
        this._cfg.im = im_new;

        this.refresh();
      }
    });

    this._canvas.addEventListener("mouseup", (e) => {
      this._mouse.consume(e);
    });

    this._canvas.addEventListener("wheel", (e) => {
      this._mouse.consume(e);

      // Compute new zoom

      const old_zoom = this._cfg.z;

      const magnitude = 0.2;
      const sign = this._mouse.wdy > 0 ? -1.0 : 1.0;

      const factor = 1 - sign * magnitude;

      const new_zoom = old_zoom * factor;

      // -----------------------------------------------------------------------
      // Move

      const re_old = this._cfg.re;
      const im_old = this._cfg.im;

      const canvas_x_old = this._mouse.x;
      const canvas_y_old = this._mouse.y;

      const canvas_width = this._cfg.cw;
      const canvas_height = this._cfg.ch;

      // Distance from center of canvas
      const canvas_dx = canvas_x_old - canvas_width / 2;
      const canvas_dy = canvas_y_old - canvas_height / 2;

      // Center canvas to mouse pointer
      const [re_center, im_center] = this.canvasToMandelbrot(canvas_x_old, canvas_y_old);

      // Apply (re, im)
      this._cfg.re = re_center;
      this._cfg.im = im_center;

      // Apply zoom
      this._cfg.z = new_zoom;

      // Move canvas
      const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(-canvas_dx, -canvas_dy);

      const re_new = re_center + re_delta;
      const im_new = im_center + im_delta;

      // -----------------------------------------------------------------------

      const cw = this._cfg.cw;
      const ch = this._cfg.ch;

      const f = old_zoom / new_zoom;
      
      const dw = f * cw;
      const dh = f * ch;

      const [pan_x, pan_y] = this.mandelbrotDeltaToCanvasDelta(re_old - re_new, im_old - im_new);

      const dx = pan_x + (cw - dw) / 2;
      const dy = pan_y + (ch - dh) / 2;


      this._dw = dw;
      this._dh = dh;

      this._dx = dx;
      this._dy = dy;

      // -----------------------------------------------------------------------

      this._cfg.re = re_new;
      this._cfg.im = im_new;

      this.refresh();

      e.preventDefault();
    });

    this._canvas.addEventListener("dblclick", (e) => {
      this._mouse.consume(e);

      const canvas_x = this._mouse.x;
      const canvas_y = this._mouse.y;

      const [re, im] = this.canvasToMandelbrot(canvas_x, canvas_y);

      this._cfg.re = re;
      this._cfg.im = im;

      this.refresh();
    });

    this.refresh();
  }

  /**
   * TODO: prefix with _
   * 
   * @param {number} canvas_dx 
   * @param {number} canvas_dy 
   * @returns 
   */
  canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy) {
    const canvas_width = this._cfg.cw;
    const canvas_height = this._cfg.ch;

    const canvas_minimum_dimension = Math.min(canvas_width, canvas_height);
    const aspect_ratio_scale = 1.0 / canvas_minimum_dimension;

    const zoom = this._cfg.z;

    const re_delta = canvas_dx * (+ zoom * aspect_ratio_scale);
    const im_delta = canvas_dy * (- zoom * aspect_ratio_scale);

    return [re_delta, im_delta];
  }

  /**
   * TODO: prefix with _
   * 
   * @param {number} re_delta 
   * @param {number} im_delta 
   * @returns 
   */
  mandelbrotDeltaToCanvasDelta(re_delta, im_delta) {
    const canvas_width = this._cfg.cw;
    const canvas_height = this._cfg.ch;

    const canvas_minimum_dimension = Math.min(canvas_width, canvas_height);
    const aspect_ratio_scale = 1.0 / canvas_minimum_dimension;

    const zoom = this._cfg.z;

    const canvas_dx = +1.0 * re_delta / (zoom * aspect_ratio_scale);
    const canvas_dy = -1.0 * im_delta / (zoom * aspect_ratio_scale);

    return [canvas_dx, canvas_dy];
  }


  /**
   * TODO: prefix with _
   * 
   * @param {number} canvas_x 
   * @param {number} canvas_y 
   * @returns 
   */
  canvasToMandelbrot(canvas_x, canvas_y) {
    const canvas_width = this._cfg.cw;
    const canvas_height = this._cfg.ch;

    const re_old = this._cfg.re;
    const im_old = this._cfg.im;

    const canvas_dx = canvas_x - canvas_width / 2;
    const canvas_dy = canvas_y - canvas_height / 2;

    const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy);

    const re_new = re_old + re_delta;
    const im_new = im_old + im_delta;

    return [re_new, im_new];
  }

  /**
   * TODO: prefix with _
   * 
   * @param {number} re 
   * @param {number} im 
   * @returns 
   */
  mandelbrotToCanvas(re, im) {
    // TODO: I'm not 100% sure this code works correctly.
    const canvas_x_old = this._mouse.cx;
    const canvas_y_old = this._mouse.cy;

    const re_canvas = this._cfg.re;
    const im_canvas = this._cfg.im;

    const re_delta = im - im_canvas;
    const im_delta = re - re_canvas;

    const [canvas_dx, canvas_dy] = this.mandelbrotDeltaToCanvasDelta(re_delta, im_delta);

    const canvas_x_new = canvas_x_old + canvas_dx;
    const canvas_y_new = canvas_y_old + canvas_dy;

    return [canvas_x_new, canvas_y_new];
  }


  /**
   * I guess any time you make any change, you need to call this function
   * to rerender.
   * 
   * TODO: prefix with _
   */
  refresh() {
    // Canvas width / height we want
    const cw = this._cfg.cw;
    const ch = this._cfg.ch;

    if (this._canvasNeedsToUpdate) {
      this._canvasNeedsToUpdate = false;

      this._canvas.width = cw;
      this._canvas.height = ch;
      
      // Is this OK?
      this._dw = cw;
      this._dh = ch;

      const ctx = this._canvas.getContext("2d");

      assert(ctx !== null);

      this._ctx = ctx;

      for (let i = 0; i < this._imageData.data.length; i += 1) {
        this._imageDataBuffer.data[i] = this._imageData.data[i];
      }

      this._imageData = this._ctx.getImageData(0, 0, cw, ch);

      this._back_canvas.width = cw;
      this._back_canvas.height = ch;

      const back_ctx = this._back_canvas.getContext("2d");
      assert(back_ctx !== null);
      this._back_ctx = back_ctx;
    }

    // Move and scale the previous image

    this._back_ctx.clearRect(0, 0, cw, ch);

    // Draw to back canvas
    this._back_ctx.drawImage(
      this._canvas, 
      0, 0, cw, ch, 
      this._dx, this._dy, this._dw, this._dh
    );

    // Clear front canvas
    this._ctx.clearRect(0, 0, cw, ch);

    // Draw from back canvas to front canvas.
    this._ctx.drawImage(this._back_canvas, 0, 0);

    this._imageData = this._ctx.getImageData(0, 0, cw, ch);
    // this.ctx.putImageData(this.imageData, 0, 0);

    this._cfg.id = Date.now();
    this.stopCurrentWork();
    this._qtree.free();
    this.makeAllAvailableWorkersWork();
  }

  /**
   * TODO: prefix with _
   */
  makeAllAvailableWorkersWork() {
    for (let i = 0; i < this._workers.length; i += 1) {
      if (this._isWorkerAvailable[i]) {
        this.requestJob(i);
      }
    }
  }

  /**
   * TODO: prefix with _
   * 
   * @param {number} workerIndex 
   * @returns 
   */
  requestJob(workerIndex) {
    if (!this._isWorkerAvailable[workerIndex]) {
      return;
    }

    const node = this._qtree.getAvailableLeaf();

    if (node !== null) {
      this._isWorkerAvailable[workerIndex] = false;
      this.scheduleJob(workerIndex, node);
    }
  }

  /**
   * TODO: prefix with _
   * 
   * @param {MessageEvent} e 
   */
  workerCallback(e) {
    /** @type {MessageFromSlaveToMaster} */
    const msg = e.data;

    const workerIndex = msg.wi;

    // Mark worker as available.
    this._isWorkerAvailable[workerIndex] = true;

    const arr = new Uint8ClampedArray(msg.imgPart);

    if (msg.done && msg.id === this._cfg.id) {
      const region = getRegion(this._cfg.cw, this._cfg.ch, msg.part);

      for (let y = 0; y < region.h; y += 1) {
        for (let x = 0; x < region.w; x += 1) {
          const canvas_index = x + region.x + (y + region.y) * this._cfg.cw;
          const region_index = x + y * region.w;

          for (let ch = 0; ch < 4; ch += 1) {
            this._imageData.data[4 * canvas_index + ch] = arr[4 * region_index + ch];
          }
        }
      }

      this._ctx.putImageData(this._imageData, 0, 0);
    }

    this._imageParts[workerIndex].arr = arr;
    this.requestJob(workerIndex);

    // Check if there is more work to do!
    this.makeAllAvailableWorkersWork();
  }

  /**
   * TODO: prefix with _
   */
  stopCurrentWork() {
    for (let i = 0; i < this._workers.length; i += 1) {
      const worker = this._workers[i];

      /** @type {MessageFromMasterToSlave} */
      const message = {
        type: "stop",
      };

      worker.postMessage(message);
    }
  }

  /**
   * TODO: prefix with _
   * 
   * @param {number} workerIndex 
   * @param {Qtree} node 
   */
  scheduleJob(workerIndex, node) {
    const region = getRegion(this._cfg.cw, this._cfg.ch, node.getPath());
    const imagePart = this._imageParts[workerIndex];

    /** @type {MessageFromMasterToSlave} */
    const message = {
      type: "work",

      cfg: this._cfg,
      region: region,
      wi: workerIndex,
      part: node.getPath(),
      imagePart: {
        arr: imagePart.arr,
        buffer: imagePart.arr.buffer,
        data: imagePart.getAdditionalData()
      },
    };

    const worker = this._workers[workerIndex];

    worker.onmessage = (e) => { this.workerCallback(e); };
    worker.postMessage(message, [message.imagePart.buffer]);
  }

}
