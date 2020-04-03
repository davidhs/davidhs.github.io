import Qtree from "../common/qtree.js";
import ImagePart from "../common/imagepart.js";
import Mouse from "../common/mouse.js";
import { assert, shuffle } from "../common/utils.js";
var WEB_WORKER_PATH = "js/webworker/worker.js";
var App = /** @class */ (function () {
    function App(canvas) {
        var _this = this;
        // TypeScript, get off my back!
        this.canvas = canvas;
        {
            var ctx = this.canvas.getContext("2d");
            assert(ctx !== null);
            this.ctx = ctx;
        }
        this.workers = [];
        this.workerScriptPath = WEB_WORKER_PATH;
        this.defaultNumberOfWorkers = 8;
        this.qtree = new Qtree();
        this.imageParts = [];
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.imageDataBuffer = this.ctx.createImageData(1, 1);
        this.canvasNeedsToUpdate = true;
        this.imageData = this.ctx.getImageData(0, 0, 1, 1);
        this.updated = false;
        this.workersAvailability = [];
        this.timestamp = App.getTimestamp();
        this.mouse = new Mouse();
        this.cfg = {
            width: 0,
            height: 0,
            scene: {
                theta: 0,
                point: {
                    re: -0.5,
                    im: 0 // imaginary value (y)
                },
                zoom: 4,
                rendering: {
                    threshold: 15000,
                    // Supersampling
                    ss: {
                        hor: {
                            min: -0.5,
                            max: 0.5,
                            splits: 3 // I can do the splits, no problem!
                        },
                        ver: {
                            min: -0.5,
                            max: 0.5,
                            splits: 3
                        }
                    }
                }
            },
            _precomputed: {
                z0: -1,
                sx0: -1,
                sy0: -1,
                cos: -1,
                sin: -1
            }
        };
        this.updated = false;
        this.timestamp = App.getTimestamp();
        this.workers = [];
        this.workersAvailability = [];
        this.workerScriptPath = WEB_WORKER_PATH;
        this.defaultNumberOfWorkers = 8;
        this.qtree = new Qtree();
        this.setWidth(window.innerWidth);
        this.setHeight(window.innerHeight);
        this.qtree.splitSubTree(4); // 2x2 (4)
        var w = Math.ceil(this.getWidth());
        var h = Math.ceil(this.getHeight());
        this.imageParts = [];
        for (var i = 0; i < this.defaultNumberOfWorkers; i += 1) {
            var imagePart = new ImagePart(w, h, 4);
            this.imageParts.push(imagePart);
        }
        for (var i = 0; i < this.defaultNumberOfWorkers; i++) {
            this.workers[i] = new Worker(this.workerScriptPath, { type: "module" });
            this.workersAvailability.push(true);
        }
        var self = this;
        window.addEventListener("resize", function () {
            self.resizeCanvas();
        }, false);
        this.canvas.addEventListener("mousedown", function (e) {
            _this.mouse.consume(e);
        });
        this.canvas.addEventListener("mousemove", function (e) {
            _this.mouse.consume(e);
            if (_this.mouse.mbdr) {
                _this.refresh();
                var x = _this.mouse.x;
                var y = _this.mouse.y;
                var px = _this.mouse.px;
                var py = _this.mouse.py;
                var ox = px;
                var oy = py;
                var L = Math.min(_this.cfg.width, _this.cfg.height);
                var z0 = 1 / L;
                var z = _this.cfg.scene.zoom;
                var sdx = ox - x;
                var sdy = oy - y;
                var wx0 = _this.cfg.scene.point.re;
                var wy0 = _this.cfg.scene.point.im;
                var wdx = +z * z0 * sdx;
                var wdy = -z * z0 * sdy;
                var sin = 0;
                var cos = 1;
                var wrdx = cos * wdx - sin * wdy;
                var wrdy = sin * wdx + cos * wdy;
                var wx = wx0 + wrdx;
                var wy = wy0 + wrdy;
                _this.cfg.scene.point.re = wx;
                _this.cfg.scene.point.im = wy;
            }
        });
        this.canvas.addEventListener("mouseup", function (e) {
            _this.mouse.consume(e);
        });
        this.canvas.addEventListener("wheel", function (e) {
            _this.mouse.consume(e);
            var dy = _this.mouse.wdy;
            var z = _this.cfg.scene.zoom;
            var factor = 1;
            var magnitude = 0.2;
            var toggle = false;
            var sign = toggle ? 1.0 : -1.0;
            if (dy > 0) {
                factor = 1 - sign * magnitude;
            }
            else {
                factor = 1 + sign * magnitude;
            }
            z *= factor;
            _this.cfg.scene.zoom = z;
            _this.refresh();
        });
        this.canvas.addEventListener("dblclick", function (e) {
            _this.mouse.consume(e);
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var L = Math.min(_this.cfg.width, _this.cfg.height);
            var z0 = 1 / L;
            var z = _this.cfg.scene.zoom;
            var sdx = x - _this.cfg.width / 2;
            var sdy = y - _this.cfg.height / 2;
            var wx0 = _this.cfg.scene.point.re;
            var wy0 = _this.cfg.scene.point.im;
            var wdx = +z * z0 * sdx;
            var wdy = -z * z0 * sdy;
            var sin = 0;
            var cos = 1;
            var wrdx = cos * wdx - sin * wdy;
            var wrdy = sin * wdx + cos * wdy;
            var wx = wx0 + wrdx;
            var wy = wy0 + wrdy;
            _this.cfg.scene.point.re = wx;
            _this.cfg.scene.point.im = wy;
            _this.refresh();
        });
        this.canvas.width = this.getWidth();
        this.canvas.height = this.getHeight();
        // NOTE: this doesn't look super cool.
        this.ctx = this.canvas.getContext("2d");
        this.imageDataBuffer = this.ctx.createImageData(this.getWidth(), this.getHeight());
        this.imageData = this.ctx.getImageData(0, 0, this.getWidth(), this.getHeight());
    }
    App.prototype.precomputeGlobalConfig = function () {
        var cfg = this.cfg;
        var width = cfg.width, height = cfg.height, theta = cfg.scene.theta;
        cfg._precomputed.z0 = 1.0 / Math.min(width, height);
        cfg._precomputed.sx0 = width / 2.0;
        cfg._precomputed.sy0 = height / 2.0;
        cfg._precomputed.cos = Math.cos(theta);
        cfg._precomputed.sin = Math.sin(theta);
    };
    App.prototype.isUpdated = function () {
        return this.updated;
    };
    App.prototype.getRegion = function (code) {
        var x = 0;
        var y = 0;
        var w = this.getWidth();
        var h = this.getHeight();
        for (var i = 0; i < code.length; i += 1) {
            var c = code.charAt(i);
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
    };
    App.prototype.setLatestTimestamp = function () {
        this.timestamp = new Date().getTime();
    };
    App.prototype.getLatestTimestamp = function () {
        return this.timestamp;
    };
    App.getTimestamp = function () {
        return new Date().getTime();
    };
    App.prototype.getWidth = function () {
        return this.cfg.width;
    };
    App.prototype.getHeight = function () {
        return this.cfg.height;
    };
    App.prototype.setWidth = function (width) {
        this.cfg.width = width;
    };
    App.prototype.setHeight = function (height) {
        this.cfg.height = height;
    };
    /**
     * I guess any time you make any change, you need to call this function
     * to rerender.
     */
    App.prototype.refresh = function () {
        // TODO: handle resize (?)
        if (this.canvasNeedsToUpdate) {
            var width = this.getWidth();
            var height = this.getHeight();
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext("2d");
            this.canvasNeedsToUpdate = false;
            for (var i = 0; i < this.imageData.data.length; i += 1) {
                this.imageDataBuffer.data[i] = this.imageData.data[i];
            }
            this.imageData = this.ctx.getImageData(0, 0, width, height);
            this.imageData = this.ctx.getImageData(0, 0, width, height);
        }
        this.setLatestTimestamp();
        this.updated = true;
        // What we're going to do when we need to redraw the canvas
        {
            var CHOICE = 1;
            if (CHOICE === 1) {
                // Clear the canvas
                this.ctx.putImageData(this.imageData, 0, 0);
            }
            else if (CHOICE === 2) {
                // Don't clear the canvas
            }
        }
        this.qtree.forAllPreorder(function (self) { self.setFlag(false); });
        for (var i = 0; i < this.workers.length; i += 1) {
            if (this.workersAvailability[i]) {
                this.requestJob(i);
            }
        }
    };
    App.prototype.start = function () {
        this.precomputeGlobalConfig();
        for (var i = 0; i < this.workers.length; i += 1) {
            this.requestJob(i);
        }
    };
    App.prototype.requestJob = function (workerIndex) {
        // Searches quad tree for a job
        var node = this.qtree;
        var running = true;
        var count = 0;
        var threshold = 10000;
        if (node.isLeaf() || node.getFlag()) {
            running = false;
        }
        while (running && count < threshold) {
            var n = node.getChildren().length;
            count += 1;
            var idxList = [0, 1, 2, 3];
            shuffle(idxList);
            for (var i = 0; i < n; i += 1) {
                var child = node.getChildren()[idxList[i]];
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
            this.updated = false;
        }
    };
    App.prototype.workerCallback = function (e) {
        var msg = e.data;
        // TODO: the data received might be stale since the user might have moved 
        // the viewport and zoomed in or zoomed out.  Should we try to scale up or
        // scale down the area and redraw it?
        // TODO: if the data is stale that is being received, maybe discard it
        // or move it??
        var workerIndex = msg.workerIndex;
        // Mark worker as available.
        this.workersAvailability[workerIndex] = true;
        var arr = new Uint8ClampedArray(msg.imgPart);
        /////////////////////////////
        // Draw region onto canvas //
        /////////////////////////////
        // Canvas
        var c_re = this.cfg.scene.point.re;
        var c_im = this.cfg.scene.point.im;
        var c_zoom = this.cfg.scene.zoom;
        // Region
        var r_re = msg.re;
        var r_im = msg.im;
        var r_zoom = msg.zoom;
        // TODO: reposition and rescale region.
        if (true || this.getLatestTimestamp() === msg.timestamp) {
            /** Width of canvas. */
            var w = this.getWidth();
            /** How many color channels to iterate through. */
            var channels = 4;
            var region = this.getRegion(msg.part);
            for (var y = 0; y < region.h; y += 1) {
                for (var x = 0; x < region.w; x += 1) {
                    var ic = x + region.x + (y + region.y) * w;
                    var id = x + y * region.w;
                    // Multiply for all 4 color channels.
                    /* Canvas index */
                    var _ic = 4 * ic;
                    /* Data (region) index */
                    var _id = 4 * id;
                    for (var ch = 0; ch < channels; ch += 1) {
                        this.imageData.data[_ic + ch] = arr[_id + ch];
                    }
                }
            }
            // Paint
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.imageParts[workerIndex].arr = arr;
        this.requestJob(workerIndex);
    };
    App.prototype.scheduleJob = function (workerIndex, node) {
        var region = this.getRegion(node.getPath());
        var imagePart = this.imageParts[workerIndex];
        var message = {
            cfg: this.cfg,
            region: region,
            workerIndex: workerIndex,
            part: node.getPath(),
            imagePart: {
                arr: imagePart.arr,
                buffer: imagePart.arr.buffer,
                data: imagePart.getAdditionalData()
            },
            timestamp: this.getLatestTimestamp()
        };
        var transferList = [message.imagePart.buffer];
        var self = this;
        App.startJob(this.workers[workerIndex], message, transferList, function (e) {
            self.workerCallback(e);
        });
    };
    App.startJob = function (worker, message, transferList, callback) {
        // Message is an object with things that will be COPIED (minus those that
        // will be moved)
        // transferList is a list containing things that will be MOVED
        // This is what the worker sends back.
        worker.onmessage = callback;
        // This is what you want the worker to do.
        worker.postMessage(message, transferList);
    };
    App.prototype.resizeCanvas = function () {
        this.setWidth(window.innerWidth);
        this.setHeight(window.innerHeight);
        this.updated = true;
        this.canvasNeedsToUpdate = true;
        this.precomputeGlobalConfig();
        this.refresh();
    };
    return App;
}());
export default App;
