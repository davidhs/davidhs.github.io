/// <reference lib="esnext" />
/// <reference lib="dom" />
import Qtree from "../common/qtree.js";
import ImagePart from "../common/imagepart.js";
import Mouse from "../common/mouse.js";
import { assert, shuffle } from "../common/utils.js";
const WEB_WORKER_PATH = "js/webworker/worker.js";
export default class App {
    constructor(canvas) {
        const ctx = canvas.getContext("2d");
        assert(ctx !== null);
        const workers = [];
        const mouse = new Mouse();
        const cfg = {
            cw: 0,
            ch: 0,
            re: -0.5,
            im: +0.0,
            z: 4,
            max_iter: 15000,
        };
        const workerScriptPath = WEB_WORKER_PATH;
        const qtree = new Qtree();
        const defaultNumberOfWorkers = 8;
        const imageParts = [];
        const workersAvailability = [];
        this.canvas = canvas;
        this.ctx = ctx;
        this.workers = workers;
        this.workerScriptPath = workerScriptPath;
        this.defaultNumberOfWorkers = defaultNumberOfWorkers;
        this.qtree = qtree;
        this.imageParts = imageParts;
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.imageDataBuffer = this.ctx.createImageData(1, 1);
        this.canvasNeedsToUpdate = true;
        this.imageData = this.ctx.getImageData(0, 0, 1, 1);
        this.workersAvailability = workersAvailability;
        this.mouse = mouse;
        this.cfg = cfg;
        cfg.cw = window.innerWidth;
        cfg.ch = window.innerHeight;
        qtree.splitSubTree(4); // 2x2 (4)
        let w = Math.ceil(cfg.cw);
        let h = Math.ceil(cfg.ch);
        for (let i = 0; i < defaultNumberOfWorkers; i += 1) {
            let imagePart = new ImagePart(w, h, 4);
            imageParts.push(imagePart);
        }
        for (let i = 0; i < defaultNumberOfWorkers; i++) {
            workers[i] = new Worker(workerScriptPath, { type: "module" });
            workersAvailability.push(true);
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
                this.refresh();
                const x = this.mouse.x;
                const y = this.mouse.y;
                const px = this.mouse.px;
                const py = this.mouse.py;
                let ox = px;
                let oy = py;
                let L = Math.min(this.cfg.cw, this.cfg.ch);
                let z0 = 1 / L;
                let z = this.cfg.z;
                let sdx = ox - x;
                let sdy = oy - y;
                let wx0 = this.cfg.re;
                let wy0 = this.cfg.im;
                let wdx = +z * z0 * sdx;
                let wdy = -z * z0 * sdy;
                let wx = wx0 + wdx;
                let wy = wy0 + wdy;
                this.cfg.re = wx;
                this.cfg.im = wy;
            }
        });
        canvas.addEventListener("mouseup", (e) => {
            this.mouse.consume(e);
        });
        canvas.addEventListener("wheel", (e) => {
            this.mouse.consume(e);
            let dy = this.mouse.wdy;
            let z = this.cfg.z;
            let factor = 1;
            let magnitude = 0.2;
            const toggle = false;
            const sign = toggle ? 1.0 : -1.0;
            if (dy > 0) {
                factor = 1 - sign * magnitude;
            }
            else {
                factor = 1 + sign * magnitude;
            }
            z *= factor;
            this.cfg.z = z;
            this.refresh();
        });
        canvas.addEventListener("dblclick", (e) => {
            this.mouse.consume(e);
            let rect = this.canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let L = Math.min(this.cfg.cw, this.cfg.ch);
            let z0 = 1 / L;
            let z = this.cfg.z;
            let sdx = x - this.cfg.cw / 2;
            let sdy = y - this.cfg.ch / 2;
            let wx0 = this.cfg.re;
            let wy0 = this.cfg.im;
            let wdx = +z * z0 * sdx;
            let wdy = -z * z0 * sdy;
            let sin = 0;
            let cos = 1;
            let wrdx = cos * wdx - sin * wdy;
            let wrdy = sin * wdx + cos * wdy;
            let wx = wx0 + wrdx;
            let wy = wy0 + wrdy;
            this.cfg.re = wx;
            this.cfg.im = wy;
            this.refresh();
        });
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
        return {
            x: x,
            y: y,
            w: w,
            h: h
        };
    }
    /**
     * I guess any time you make any change, you need to call this function
     * to rerender.
     */
    refresh() {
        // TODO: handle resize (?)
        if (this.canvasNeedsToUpdate) {
            const cw = this.cfg.cw;
            const ch = this.cfg.ch;
            this.canvas.width = cw;
            this.canvas.height = ch;
            const ctx = this.canvas.getContext("2d");
            assert(ctx !== null);
            this.ctx = ctx;
            this.canvasNeedsToUpdate = false;
            for (let i = 0; i < this.imageData.data.length; i += 1) {
                this.imageDataBuffer.data[i] = this.imageData.data[i];
            }
            this.imageData = this.ctx.getImageData(0, 0, cw, ch);
            this.imageData = this.ctx.getImageData(0, 0, cw, ch);
        }
        // What we're going to do when we need to redraw the canvas
        this.ctx.putImageData(this.imageData, 0, 0);
        this.qtree.forAllPreorder(self => { self.setFlag(false); });
        for (let i = 0; i < this.workers.length; i += 1) {
            if (this.workersAvailability[i]) {
                this.requestJob(i);
            }
        }
    }
    start() {
        for (let i = 0; i < this.workers.length; i += 1) {
            this.requestJob(i);
        }
    }
    requestJob(workerIndex) {
        // Searches quad tree for a job
        let node = this.qtree;
        let running = true;
        let count = 0;
        let threshold = 10000;
        if (node.isLeaf() || node.getFlag()) {
            running = false;
        }
        while (running && count < threshold) {
            let n = node.getChildren().length;
            count += 1;
            let idxList = [0, 1, 2, 3];
            shuffle(idxList);
            for (let i = 0; i < n; i += 1) {
                let child = node.getChildren()[idxList[i]];
                if (!child.getFlag()) {
                    node = child;
                    if (child.isLeaf()) {
                        running = false;
                    }
                    break;
                }
            }
        }
        if (count >= threshold - 1) {
            throw new Error("Something is not right");
        }
        if (!running && !node.getFlag()) {
            node.setFlag(true); // claim this region
            this.workersAvailability[workerIndex] = false;
            this.scheduleJob(workerIndex, node);
        }
        else {
            // No more jobs for you
        }
    }
    workerCallback(e) {
        const msg = e.data;
        // TODO: the data received might be stale since the user might have moved 
        // the viewport and zoomed in or zoomed out.  Should we try to scale up or
        // scale down the area and redraw it?
        // TODO: if the data is stale that is being received, maybe discard it
        // or move it??
        const workerIndex = msg.wi;
        // Mark worker as available.
        this.workersAvailability[workerIndex] = true;
        const arr = new Uint8ClampedArray(msg.imgPart);
        /////////////////////////////
        // Draw region onto canvas //
        /////////////////////////////
        // TODO: reposition and rescale region.
        /** Width of canvas. */
        const w = this.cfg.cw;
        /** How many color channels to iterate through. */
        const channels = 4;
        const region = this.getRegion(msg.part);
        for (let y = 0; y < region.h; y += 1) {
            for (let x = 0; x < region.w; x += 1) {
                const ic = x + region.x + (y + region.y) * w;
                const id = x + y * region.w;
                // Multiply for all 4 color channels.
                /* Canvas index */
                const _ic = 4 * ic;
                /* Data (region) index */
                const _id = 4 * id;
                for (let ch = 0; ch < channels; ch += 1) {
                    this.imageData.data[_ic + ch] = arr[_id + ch];
                }
            }
        }
        // Paint
        this.ctx.putImageData(this.imageData, 0, 0);
        this.imageParts[workerIndex].arr = arr;
        this.requestJob(workerIndex);
    }
    scheduleJob(workerIndex, node) {
        let region = this.getRegion(node.getPath());
        let imagePart = this.imageParts[workerIndex];
        const message = {
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
        let transferList = [message.imagePart.buffer];
        let self = this;
        App.startJob(this.workers[workerIndex], message, transferList, function (e) {
            self.workerCallback(e);
        });
    }
    static startJob(worker, message, transferList, callback) {
        // Message is an object with things that will be COPIED (minus those that
        // will be moved)
        // transferList is a list containing things that will be MOVED
        // This is what the worker sends back.
        worker.onmessage = callback;
        // This is what you want the worker to do.
        worker.postMessage(message, transferList);
    }
    resizeCanvas() {
        this.cfg.cw = window.innerWidth;
        this.cfg.ch = window.innerHeight;
        this.canvasNeedsToUpdate = true;
        this.refresh();
    }
}
