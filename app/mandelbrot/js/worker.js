importScripts("utils.js");
importScripts("imagepart.js");
var WorkerHandler = (function () {
    function WorkerHandler() {
        this.init();
    }
    WorkerHandler.prototype.init = function () {
        this.DEBUG = false;
        this.VERBOSE = false;
        this.seg = {
            x: 0,
            y: 1,
            _x: 2,
            _y: 3,
            _x0: 4,
            _y0: 5,
            unbounded: 6,
            iterations: 7,
            escaped: 8
        };
        this.seg.size = Utils.getObjectSize(this.seg);
    };
    WorkerHandler.prototype.receiveMessage = function (e) {
        var msg = e.data;
        this.cfg = msg.cfg;
        this.region = msg.region;
        this.workerIndex = msg.workerIndex;
        this.part = msg.part;
        this.ss = this.cfg.scene.ss;
        this.imagePart = new ImagePart(msg.imagePart.data.width, msg.imagePart.data.height, msg.imagePart.data.channels, new Uint8ClampedArray(msg.imagePart.buffer));
        this.timestamp = msg.timestamp;
        this.size = this.region.w * this.region.h;
        this.stepBuild();
    };
    WorkerHandler.sendMessage = function (message, transferList) {
        postMessage(message, transferList);
    };
    WorkerHandler.prototype.stepBuild = function () {
        if (this.VERBOSE) {
            console.log("Constructing [" + this.part + "]...");
        }
        this.mdata = new Float64Array(this.seg.size * this.size);
        var _x0, _y0, _x, _y;
        var s1, s2;
        var temp;
        var ratio = this.cfg.height / this.cfg.width;
        if (this.VERBOSE) {
            console.log("Ratio: " + ratio);
        }
        var c = 0;
        var x = this.region.x;
        var y = this.region.y;
        var total_unbounded = [];
        var total_unbounded_count = 0;
        var tidx = 0;
        for (var j = 0; j < this.size; j++) {
            var initx0 = 0;
            var inity0 = 0;
            var normalizedX = x / this.cfg.width;
            var normalizedY = y / this.cfg.height;
            var warpedX = 2 * normalizedX - 1;
            var warpedY = 2 * normalizedY - 1;
            initx0 = this.cfg.scene.point.re + 2 * this.cfg.scene.zoom * warpedX;
            inity0 = -(this.cfg.scene.point.im + 2 * this.cfg.scene.zoom * warpedY);
            this.mdata[c + this.seg._x] = initx0;
            this.mdata[c + this.seg._y] = inity0;
            this.mdata[c + this.seg._x0] = initx0;
            this.mdata[c + this.seg._y0] = inity0;
            this.mdata[c + this.seg.escaped] = 0;
            this.mdata[c + this.seg.iterations] = 0;
            this.mdata[c + this.seg.unbounded] = 0;
            c += this.seg.size;
            x += 1;
            if (x >= this.region.x + this.region.w) {
                x = this.region.x;
                y += 1;
            }
        }
        c = 0;
        var no_new_unbounded = 0;
        var change;
        var change_list = [];
        var ll2 = Math.log(Math.log(2));
        var il2 = 1 / Math.log(2);
        for (var i = 1; i < this.cfg.scene.rendering.threshold; i++) {
            c = 0;
            total_unbounded.push(0);
            change = 0;
            for (var j = 0; j < this.size; j++) {
                if (this.mdata[c + this.seg.escaped] === 0) {
                    _x0 = this.mdata[c + this.seg._x0];
                    _y0 = this.mdata[c + this.seg._y0];
                    _x = this.mdata[c + this.seg._x];
                    _y = this.mdata[c + this.seg._y];
                    temp = _x;
                    s1 = _x * _x;
                    s2 = _y * _y;
                    _x = (s1 - s2) + _x0;
                    _y = (2 * temp * _y) + _y0;
                    if (s1 + s2 > 2147483647) {
                        no_new_unbounded = 0;
                        change++;
                        var nu = il2 * (Math.log(Math.log(s1 + s2)) - ll2);
                        this.mdata[c + this.seg.iterations] = this.mdata[c + this.seg.iterations] + 1 - nu;
                        this.mdata[c + this.seg.escaped] = 1;
                        total_unbounded[tidx] = total_unbounded[tidx] + 1;
                        total_unbounded_count++;
                        this.mdata[c + this.seg.unbounded] = 1;
                    }
                    this.mdata[c + this.seg._x] = _x;
                    this.mdata[c + this.seg._y] = _y;
                    this.mdata[c + this.seg.iterations] = this.mdata[c + this.seg.iterations] + 1;
                }
                c += this.seg.size;
            }
            change_list.push(change);
            change = 0;
            no_new_unbounded++;
            if (no_new_unbounded > 100 && total_unbounded_count > 10) {
                if (this.DEBUG)
                    console.log("Part " + this.part + " broken at: " + i);
                break;
            }
            tidx++;
        }
        if (this.DEBUG) {
            console.log(["Broken graph " + this.part, total_unbounded]);
            console.log(["Change " + this.part, change_list]);
        }
        if (this.DEBUG && false) {
            if (this.part === "2") {
                var toprint = "\n";
                for (var i = 0; i < total_unbounded.length; i++) {
                    toprint += total_unbounded[i] + "\n";
                }
                toprint += "\n";
                console.log(toprint);
            }
        }
        if (this.DEBUG && false) {
            var readable = [];
            c = 0;
            for (var i = 0; i < this.size; i++) {
                readable.push({
                    x: this.mdata[this.seg.size * i + this.seg.x],
                    y: this.mdata[this.seg.size * i + this.seg.y],
                    _x: this.mdata[this.seg.size * i + this.seg._x],
                    _y: this.mdata[this.seg.size * i + this.seg._y],
                    _x0: this.mdata[this.seg.size * i + this.seg._x0],
                    _y0: this.mdata[this.seg.size * i + this.seg._y0],
                    unbounded: this.mdata[this.seg.size * i + this.seg.unbounded],
                    iterations: this.mdata[this.seg.size * i + this.seg.iterations],
                    escaped: this.mdata[this.seg.size * i + this.seg.escaped]
                });
                c += this.seg.size;
            }
            console.log(["DONE[" + this.part + "]", readable]);
        }
        this.paint();
    };
    WorkerHandler.prototype.paint = function () {
        if (this.VERBOSE) {
            console.log("Painting [" + this.part + "]...");
        }
        var r, g, b, a;
        a = 255;
        for (var i = 0; i < this.size; i++) {
            var unbounded = this.mdata[i * this.seg.size + this.seg.unbounded];
            var iterations = this.mdata[i * this.seg.size + this.seg.iterations];
            var hue = Math.log(iterations);
            var saturation = 1;
            var luminance = 0.5 * unbounded;
            hue = Math.abs(hue) > 1 ? hue % 1 : hue;
            saturation = Math.abs(saturation) > 1 ? saturation % 1 : saturation;
            luminance = Math.abs(luminance) > 1 ? luminance % 1 : luminance;
            var rgb = Utils.hslToRgb(hue, saturation, luminance);
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];
            this.imagePart.arr[i * 4] = r;
            this.imagePart.arr[i * 4 + 1] = g;
            this.imagePart.arr[i * 4 + 2] = b;
            this.imagePart.arr[i * 4 + 3] = a;
        }
        this.finish();
    };
    WorkerHandler.prototype.finish = function () {
        if (this.VERBOSE) {
            console.log("Finishing [" + this.part + "]...");
        }
        var result = {
            part: this.part,
            imgPart: this.imagePart.arr.buffer,
            workerIndex: this.workerIndex,
            timestamp: this.timestamp
        };
        WorkerHandler.sendMessage(result, [result.imgPart]);
    };
    return WorkerHandler;
}());
var x = new WorkerHandler();
onmessage = function (e) {
    x.receiveMessage(e);
};
