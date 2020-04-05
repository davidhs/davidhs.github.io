/// <reference lib="esnext" />
/// <reference lib="dom" />
import Qtree from "../common/qtree.js";
import ImagePart from "../common/imagepart.js";
import Mouse from "../common/mouse.js";
import { assert } from "../common/utils.js";
const WEB_WORKER_PATH = "js/webworker/worker.js";
const DEFAULT_NUMBER_OF_WORKS = 8;
/*

      this.#dw = dw;
      this.#dh = dh;

      this.#dx = dx;
      this.#dy = dy;

*/
export default class App {
    constructor(canvas) {
        const ctx = canvas.getContext("2d");
        assert(ctx !== null);
        const workers = [];
        const mouse = new Mouse();
        const cfg = {
            id: Date.now(),
            cw: 0,
            ch: 0,
            re: -0.5,
            im: +0.0,
            z: 4,
            max_iter: 15000,
        };
        this.#old_z = cfg.z;
        this.#new_z = cfg.z;
        const qtree = new Qtree();
        const imageParts = [];
        const isWorkerAvailable = [];
        this.#dx = 0;
        this.#dy = 0;
        this.#dw = 0;
        this.#dh = 0;
        this.canvas = canvas;
        this.ctx = ctx;
        this.workers = workers;
        this.qtree = qtree;
        this.imageParts = imageParts;
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.imageDataBuffer = this.ctx.createImageData(1, 1);
        this.canvasNeedsToUpdate = true;
        this.imageData = this.ctx.getImageData(0, 0, 1, 1);
        this.isWorkerAvailable = isWorkerAvailable;
        this.mouse = mouse;
        this.cfg = cfg;
        cfg.cw = window.innerWidth;
        cfg.ch = window.innerHeight;
        const NR_OF_SPLITS = 4;
        // 1 -> progress too slow (not enough regions)
        // 2 -> could be a little bit fast (not enough regions)
        // 3 -> maybe a bit more?
        // 4 -> 
        // 5 -> slower than 4
        // 6 -> too slow, too much overhead (too many regions)
        qtree.splitSubTree(NR_OF_SPLITS); // 2x2 (4)
        let w = Math.ceil(cfg.cw);
        let h = Math.ceil(cfg.ch);
        for (let i = 0; i < DEFAULT_NUMBER_OF_WORKS; i += 1) {
            let imagePart = new ImagePart(w, h, 4);
            imageParts.push(imagePart);
        }
        for (let i = 0; i < DEFAULT_NUMBER_OF_WORKS; i += 1) {
            workers[i] = new Worker(WEB_WORKER_PATH, { type: "module" });
            isWorkerAvailable.push(true);
        }
        canvas.width = cfg.cw;
        canvas.height = cfg.ch;
        this.imageDataBuffer = ctx.createImageData(cfg.cw, cfg.ch);
        this.imageData = ctx.getImageData(0, 0, cfg.cw, cfg.ch);
        window.addEventListener("resize", () => { this.resizeCanvas(); }, false);
        canvas.addEventListener("mousedown", e => {
            this.mouse.consume(e);
        });
        canvas.addEventListener("mousemove", e => {
            this.mouse.consume(e);
            if (this.mouse.mbdr) {
                const canvas_dx = this.mouse.px - this.mouse.cx;
                const canvas_dy = this.mouse.py - this.mouse.cy;
                const re_old = this.cfg.re;
                const im_old = this.cfg.im;
                // -----------------------------------------------------------------------
                const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy);
                const re_new = re_old + re_delta;
                const im_new = im_old + im_delta;
                // -----------------------------------------------------------------------
                const cw = this.cfg.cw;
                const ch = this.cfg.ch;
                const f = 1.0; // old_zoom / new_zoom;
                const dw = f * cw;
                const dh = f * ch;
                const [pan_x, pan_y] = this.mandelbrotDeltaToCanvasDelta(re_old - re_new, im_old - im_new);
                const dx = pan_x + (cw - dw) / 2;
                const dy = pan_y + (ch - dh) / 2;
                this.#dw = dw;
                this.#dh = dh;
                this.#dx = dx;
                this.#dy = dy;
                // -----------------------------------------------------------------------
                this.cfg.re = re_new;
                this.cfg.im = im_new;
                this.refresh();
            }
        });
        canvas.addEventListener("mouseup", (e) => {
            this.mouse.consume(e);
        });
        canvas.addEventListener("wheel", (e) => {
            this.mouse.consume(e);
            // Compute new zoom
            const old_zoom = this.cfg.z;
            this.#old_z = old_zoom;
            const magnitude = 0.2;
            const sign = this.mouse.wdy > 0 ? -1.0 : 1.0;
            const factor = 1 - sign * magnitude;
            const new_zoom = old_zoom * factor;
            this.#new_z = new_zoom;
            // -----------------------------------------------------------------------
            // Move
            const re_old = this.cfg.re;
            const im_old = this.cfg.im;
            const canvas_x_old = this.mouse.x;
            const canvas_y_old = this.mouse.y;
            const canvas_width = this.cfg.cw;
            const canvas_height = this.cfg.ch;
            // Distance from center of canvas
            const canvas_dx = canvas_x_old - canvas_width / 2;
            const canvas_dy = canvas_y_old - canvas_height / 2;
            // Center canvas to mouse pointer
            const [re_center, im_center] = this.canvasToMandelbrot(canvas_x_old, canvas_y_old);
            // Apply (re, im)
            this.cfg.re = re_center;
            this.cfg.im = im_center;
            // Apply zoom
            this.cfg.z = new_zoom;
            // Move canvas
            const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(-canvas_dx, -canvas_dy);
            const re_new = re_center + re_delta;
            const im_new = im_center + im_delta;
            // -----------------------------------------------------------------------
            const cw = this.cfg.cw;
            const ch = this.cfg.ch;
            const f = old_zoom / new_zoom;
            const dw = f * cw;
            const dh = f * ch;
            const [pan_x, pan_y] = this.mandelbrotDeltaToCanvasDelta(re_old - re_new, im_old - im_new);
            const dx = pan_x + (cw - dw) / 2;
            const dy = pan_y + (ch - dh) / 2;
            this.#dw = dw;
            this.#dh = dh;
            this.#dx = dx;
            this.#dy = dy;
            // -----------------------------------------------------------------------
            this.cfg.re = re_new;
            this.cfg.im = im_new;
            this.refresh();
            e.preventDefault();
        });
        canvas.addEventListener("dblclick", (e) => {
            this.mouse.consume(e);
            const canvas_x = this.mouse.x;
            const canvas_y = this.mouse.y;
            const [re, im] = this.canvasToMandelbrot(canvas_x, canvas_y);
            this.cfg.re = re;
            this.cfg.im = im;
            this.refresh();
        });
        this.refresh();
    }
    #old_z;
    #new_z;
    #dx;
    #dy;
    #dw;
    #dh;
    canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy) {
        const canvas_width = this.cfg.cw;
        const canvas_height = this.cfg.ch;
        const canvas_minimum_dimension = Math.min(canvas_width, canvas_height);
        const aspect_ratio_scale = 1.0 / canvas_minimum_dimension;
        const zoom = this.cfg.z;
        const re_delta = canvas_dx * (+zoom * aspect_ratio_scale);
        const im_delta = canvas_dy * (-zoom * aspect_ratio_scale);
        return [re_delta, im_delta];
    }
    mandelbrotDeltaToCanvasDelta(re_delta, im_delta) {
        const canvas_width = this.cfg.cw;
        const canvas_height = this.cfg.ch;
        const canvas_minimum_dimension = Math.min(canvas_width, canvas_height);
        const aspect_ratio_scale = 1.0 / canvas_minimum_dimension;
        const zoom = this.cfg.z;
        const canvas_dx = +1.0 * re_delta / (zoom * aspect_ratio_scale);
        const canvas_dy = -1.0 * im_delta / (zoom * aspect_ratio_scale);
        return [canvas_dx, canvas_dy];
    }
    canvasToMandelbrot(canvas_x, canvas_y) {
        const canvas_width = this.cfg.cw;
        const canvas_height = this.cfg.ch;
        const re_old = this.cfg.re;
        const im_old = this.cfg.im;
        const canvas_dx = canvas_x - canvas_width / 2;
        const canvas_dy = canvas_y - canvas_height / 2;
        const [re_delta, im_delta] = this.canvasDeltaToMandelbrotDelta(canvas_dx, canvas_dy);
        const re_new = re_old + re_delta;
        const im_new = im_old + im_delta;
        return [re_new, im_new];
    }
    mandelbrotToCanvas(re, im) {
        // TODO: I'm not 100% sure this code works correctly.
        const canvas_x_old = this.mouse.cx;
        const canvas_y_old = this.mouse.cy;
        const re_canvas = this.cfg.re;
        const im_canvas = this.cfg.im;
        const re_delta = im - im_canvas;
        const im_delta = re - re_canvas;
        const [canvas_dx, canvas_dy] = this.mandelbrotDeltaToCanvasDelta(re_delta, im_delta);
        const canvas_x_new = canvas_x_old + canvas_dx;
        const canvas_y_new = canvas_y_old + canvas_dy;
        return [canvas_x_new, canvas_y_new];
    }
    getRegion(code) {
        let x = 0;
        let y = 0;
        let w = this.cfg.cw;
        let h = this.cfg.ch;
        for (let i = 0; i < code.length; i += 1) {
            let c = code.charAt(i);
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
    /**
     * I guess any time you make any change, you need to call this function
     * to rerender.
     */
    refresh() {
        if (this.canvasNeedsToUpdate) {
            this.canvasNeedsToUpdate = false;
            const cw = this.cfg.cw;
            const ch = this.cfg.ch;
            this.canvas.width = cw;
            this.canvas.height = ch;
            // Is this OK?
            this.#dw = cw;
            this.#dh = ch;
            const ctx = this.canvas.getContext("2d");
            assert(ctx !== null);
            this.ctx = ctx;
            for (let i = 0; i < this.imageData.data.length; i += 1) {
                this.imageDataBuffer.data[i] = this.imageData.data[i];
            }
            this.imageData = this.ctx.getImageData(0, 0, cw, ch);
        }
        // Move and scale the previous image
        const cw = this.cfg.cw;
        const ch = this.cfg.ch;
        if (false) {
            // TODO: now this doesn't work correctly
            const pan_x = this.mouse.cx - this.mouse.px;
            const pan_y = this.mouse.cy - this.mouse.py;
            const old_z = this.#old_z;
            const new_z = this.#new_z;
            const sx = 0;
            const sy = 0;
            const sw = cw;
            const sh = ch;
            const f = old_z / new_z; //new_z / old_z;
            const dw = f * cw;
            const dh = f * ch;
            const dx = pan_x + (cw - dw) / 2;
            const dy = pan_y + (ch - dh) / 2;
            this.ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
            // Eat the zoom change
            this.#old_z = this.#new_z;
        }
        else {
            const sx = 0;
            const sy = 0;
            const sw = cw;
            const sh = ch;
            const dx = this.#dx;
            const dy = this.#dy;
            const dw = this.#dw;
            const dh = this.#dh;
            this.ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        this.imageData = this.ctx.getImageData(0, 0, cw, ch);
        this.cfg.id = Date.now();
        this.stopCurrentWork();
        this.qtree.free();
        this.makeAllAvailableWorkersWork();
    }
    makeAllAvailableWorkersWork() {
        for (let i = 0; i < this.workers.length; i += 1) {
            if (this.isWorkerAvailable[i]) {
                this.requestJob(i);
            }
        }
    }
    requestJob(workerIndex) {
        if (!this.isWorkerAvailable[workerIndex]) {
            return;
        }
        const node = this.qtree.getAvailableLeaf();
        if (node !== null) {
            this.isWorkerAvailable[workerIndex] = false;
            this.scheduleJob(workerIndex, node);
        }
    }
    workerCallback(e) {
        const msg = e.data;
        const workerIndex = msg.wi;
        // Mark worker as available.
        this.isWorkerAvailable[workerIndex] = true;
        const arr = new Uint8ClampedArray(msg.imgPart);
        if (msg.done && msg.id === this.cfg.id) {
            const region = this.getRegion(msg.part);
            for (let y = 0; y < region.h; y += 1) {
                for (let x = 0; x < region.w; x += 1) {
                    const canvas_index = x + region.x + (y + region.y) * this.cfg.cw;
                    const region_index = x + y * region.w;
                    for (let ch = 0; ch < 4; ch += 1) {
                        this.imageData.data[4 * canvas_index + ch] = arr[4 * region_index + ch];
                    }
                }
            }
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.imageParts[workerIndex].arr = arr;
        this.requestJob(workerIndex);
        // Check if there is more work to do!
        this.makeAllAvailableWorkersWork();
    }
    stopCurrentWork() {
        for (let i = 0; i < this.workers.length; i += 1) {
            const worker = this.workers[i];
            const message = {
                type: "stop",
            };
            worker.postMessage(message);
        }
    }
    scheduleJob(workerIndex, node) {
        let region = this.getRegion(node.getPath());
        let imagePart = this.imageParts[workerIndex];
        const message = {
            type: "work",
            cfg: this.cfg,
            region: region,
            wi: workerIndex,
            part: node.getPath(),
            imagePart: {
                arr: imagePart.arr,
                buffer: imagePart.arr.buffer,
                data: imagePart.getAdditionalData()
            },
        };
        const worker = this.workers[workerIndex];
        worker.onmessage = (e) => { this.workerCallback(e); };
        worker.postMessage(message, [message.imagePart.buffer]);
    }
    resizeCanvas() {
        this.cfg.cw = window.innerWidth;
        this.cfg.ch = window.innerHeight;
        this.canvasNeedsToUpdate = true;
        this.refresh();
    }
}
