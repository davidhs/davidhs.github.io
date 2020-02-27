var App = (function () {
    function App() {
        this.init();
    }
    App.prototype.init = function () {
        var _this = this;
        this.VERBOSE = false;
        this.updated = false;
        this.initialized = false;
        this.cfg = {
            width: 0,
            height: 0,
            scene: {
                point: {
                    re: 0,
                    im: 0
                },
                zoom: 1,
                rendering: {
                    threshold: 15000,
                    ss: {
                        hor: {
                            min: -0.5,
                            max: 0.5,
                            splits: 3
                        },
                        ver: {
                            min: -0.5,
                            max: 0.5,
                            splits: 3
                        }
                    }
                }
            }
        };
        this.timestamp = App.getTimestamp();
        this.workers = [];
        this.workersAvailability = [];
        this.workerScriptPath = "js/worker.js";
        this.defaultNumberOfWorkers = 8;
        this.canvas = null;
        this.ctx = null;
        this.qtree = new Qtree();
        this.setWidth(window.innerWidth);
        this.setHeight(window.innerHeight);
        this.qtree.splitSubTree(4);
        var w = Math.ceil(this.getWidth());
        var h = Math.ceil(this.getHeight());
        this.imageParts = [];
        for (var i = 0; i < this.defaultNumberOfWorkers; i += 1) {
            var imagePart = new ImagePart(w, h, 4);
            this.imageParts.push(imagePart);
        }
        for (var i = 0; i < this.defaultNumberOfWorkers; i++) {
            this.workers[i] = new Worker(this.workerScriptPath);
            this.workersAvailability.push(true);
        }
        var self = this;
        window.addEventListener('resize', function () {
            self.resizeCanvas();
        }, false);
        this.canvas = document.getElementById('myCanvas');
        this.canvasDown = false;
        this.mouse = {
            origin: {
                x: 0,
                y: 0
            },
            previous: {
                x: 0,
                y: 0
            }
        };
        this.canvas.addEventListener("mousedown", function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            _this.mouse.origin.x = x;
            _this.mouse.origin.y = y;
            _this.mouse.previous.x = x;
            _this.mouse.previous.y = y;
            _this.canvasDown = true;
        });
        this.canvas.addEventListener('mousemove', function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            if (_this.canvasDown === true) {
                _this.refresh();
                console.log(_this.cfg.scene.point.re + ", " + _this.cfg.scene.point.im);
                var ox = _this.mouse.previous.x;
                var oy = _this.mouse.previous.y;
                var re = _this.cfg.scene.zoom * 2 * (ox - x) / _this.getWidth();
                var im = _this.cfg.scene.zoom * 2 * (oy - y) / _this.getHeight();
                _this.cfg.scene.point.im += im;
                _this.cfg.scene.point.re += re;
                _this.mouse.previous.x = x;
                _this.mouse.previous.y = y;
            }
        });
        this.canvas.addEventListener('mouseup', function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            _this.canvasDown = false;
        });
        this.canvas.addEventListener('mousewheel', function (e) {
            var dy = e.wheelDeltaY;
            var z = _this.cfg.scene.zoom;
            var factor = 1;
            var magnitude = 0.1;
            if (dy > 0) {
                factor = 1 - magnitude;
            }
            else {
                factor = 1 + magnitude;
            }
            z *= factor;
            _this.cfg.scene.zoom = z;
            _this.refresh();
        });
        this.canvas.width = this.getWidth();
        this.canvas.height = this.getHeight();
        this.ctx = this.canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.getWidth(), this.getHeight());
        this.initialized = true;
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
                    console.log("You fucked up!");
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
        this.timestamp = (new Date()).getTime();
    };
    App.prototype.getLatestTimestamp = function () {
        return this.timestamp;
    };
    App.getTimestamp = function () {
        return (new Date()).getTime();
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
    App.prototype.refresh = function () {
        this.canvas.width = this.getWidth();
        this.canvas.height = this.getHeight();
        this.ctx = this.canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.getWidth(), this.getHeight());
        this.setLatestTimestamp();
        this.updated = true;
        this.qtree.forAll(function (self) {
            self.flag = false;
        });
        for (var i = 0; i < this.workers.length; i += 1) {
            if (this.workersAvailability[i]) {
                this.requestJob(i);
            }
        }
    };
    App.prototype.start = function () {
        if (!this.initialized) {
            this.init();
        }
        for (var i = 0; i < this.workers.length; i += 1) {
            this.requestJob(i);
        }
    };
    App.prototype.requestJob = function (workerIndex) {
        var node = this.qtree;
        var running = true;
        var count = 0;
        var threshold = 10000;
        if (node.isLeaf() || node.getFlag()) {
            running = false;
        }
        while (running && count < threshold) {
            var n = node.children.length;
            count += 1;
            var idxList = [0, 1, 2, 3];
            Utils.shuffle(idxList);
            for (var i = 0; i < n; i += 1) {
                var child = node.children[idxList[i]];
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
            console.log("Something is not right");
        }
        if (!running && !node.flag) {
            node.setFlag(true);
            this.workersAvailability[workerIndex] = false;
            this.scheduleJob(workerIndex, node);
        }
        else {
            if (this.VERBOSE) {
                console.log("No jobs for you");
            }
            this.updated = false;
            return null;
        }
    };
    App.prototype.workerCallback = function (e) {
        var message = e.data;
        if (this.VERBOSE) {
            console.log("Displaying [" + message.part + "]...");
        }
        var workerIndex = message.workerIndex;
        this.workersAvailability[workerIndex] = true;
        var arr = new Uint8ClampedArray(message.imgPart);
        var timestamp = message.timestamp;
        if (this.getLatestTimestamp() === timestamp) {
            var canvasWidth = this.getWidth();
            var channels = 4;
            var region = this.getRegion(message.part);
            for (var y = 0; y < region.h; y += 1) {
                for (var x_1 = 0; x_1 < region.w; x_1 += 1) {
                    var idxCanvas = 4 * ((x_1 + region.x) + (y + region.y) * canvasWidth);
                    var idxData = 4 * (x_1 + y * region.w);
                    for (var ch = 0; ch < channels; ch += 1) {
                        this.imageData.data[idxCanvas + ch] = arr[idxData + ch];
                    }
                }
            }
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.imageParts[workerIndex].arr = arr;
        this.requestJob(workerIndex);
    };
    App.prototype.scheduleJob = function (workerIndex, node) {
        var region = this.getRegion(node.path);
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
        var transferList = [
            message.imagePart.buffer
        ];
        var self = this;
        App.startJob(this.workers[workerIndex], message, transferList, function (e) {
            self.workerCallback(e);
        });
    };
    App.startJob = function (worker, message, transferList, callback) {
        worker.onmessage = callback;
        worker.postMessage(message, transferList);
    };
    App.prototype.resizeCanvas = function () {
        this.setWidth(window.innerWidth);
        this.setHeight(window.innerHeight);
        this.updated = true;
        this.refresh();
    };
    return App;
}());
(function () {
    var app = new App();
    app.start();
}());
