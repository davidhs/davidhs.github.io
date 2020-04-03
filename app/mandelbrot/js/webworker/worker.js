import * as Utils from "../common/utils.js";
// Constants
var INV_NAT_LOG_2 = 1.0 / Math.log(2.0);
var ESCAPE_THRESHOLD = 2147483647;
var ONE_FOURTH = 1.0 / 4.0;
var ONE_SIXTEENTH = 1.0 / 16.0;
onmessage = function (e) {
    var msg = e.data;
    var cfg = msg.cfg;
    var region = msg.region;
    var workerIndex = msg.workerIndex;
    var part = msg.part;
    var arr = new Uint8ClampedArray(msg.imagePart.buffer); // data
    var timestamp = msg.timestamp;
    var threshold = cfg.scene.rendering.threshold;
    var zoom = cfg.scene.zoom;
    var wx0 = cfg.scene.point.re;
    var wy0 = cfg.scene.point.im;
    /////////////////////////////////////
    // Render region of Mandelbrot set //
    /////////////////////////////////////
    var z0 = cfg._precomputed.z0;
    var z = zoom;
    var sx0 = cfg._precomputed.sx0;
    var sy0 = cfg._precomputed.sy0;
    var cos = cfg._precomputed.cos;
    var sin = cfg._precomputed.sin;
    var x1 = region.x;
    // TODO: this could be moved into the master thread, since each region is
    // mostly of equal size, but I'm not 100% sure, so I'm going to leave this
    // in here.
    var x2 = region.x + region.w;
    var y1 = region.y;
    var y2 = region.y + region.h;
    var rgb = [0, 0, 0];
    var idx4 = 0;
    for (var y = y1; y < y2; y += 1) {
        var sdy = y - sy0;
        var wdy = -z * z0 * sdy;
        for (var x = x1; x < x2; x += 1, idx4 += 4) {
            var sdx = x - sx0;
            var wdx = z * z0 * sdx;
            var wrdx = cos * wdx - sin * wdy;
            var wrdy = sin * wdx + cos * wdy;
            var wx = wx0 + wrdx;
            var wy = wy0 + wrdy;
            var re0 = wx;
            var im0 = wy;
            /////////////////////
            // Comoplex number //
            /////////////////////
            /** Real part of the complex number. */
            var re = wx;
            /** Imaginary part of the complex number. */
            var im = wy;
            /** Threshold iterator */
            var t = 0;
            /////////////////////////////
            // Cardoid / bulb checking //
            /////////////////////////////
            {
                var x_1 = re;
                var y_1 = im;
                var y_sq = y_1 * y_1;
                var _p1 = x_1 - ONE_FOURTH;
                var p = Math.sqrt(_p1 * _p1 + y_sq);
                // Check if we're in the cardioid.
                if (x_1 <= p - 2.0 * p * p + ONE_FOURTH) {
                    t = threshold; // Do early rejection.
                }
                var x_inc = x_1 + 1;
                // Check if we're inside period-2 bulb.
                if (x_inc * x_inc + y_sq <= ONE_SIXTEENTH) {
                    t = threshold; // Do early rejection.
                }
            }
            //////////////////////////////////////////
            // Check if we're in the Mandelbrot set //
            //////////////////////////////////////////
            var s1 = 0;
            var s2 = 0;
            /** Escaped */
            var escaped = false;
            // Implementation of an optimized escape time algorithm.
            for (; t < threshold && !escaped;) {
                s1 = re * re;
                s2 = im * im;
                im = 2 * re * im + im0;
                re = s1 - s2 + re0;
                escaped = s1 + s2 > ESCAPE_THRESHOLD;
                t += 1;
            }
            //////////////////////////////
            // Determine color of pixel //
            //////////////////////////////
            if (false) {
                var nu = INV_NAT_LOG_2 * Math.log(Math.log(s1 + s2));
                var cv = Math.log(t + 1 - nu);
                var hue = cv;
                hue = 0;
                var saturation = 1;
                var luminance = escaped ? 0.5 : 0;
                luminance = escaped ? 1 - (Math.sin(cv) + 1) / 2 : 0;
                hue = Math.abs(hue) > 1 ? hue % 1 : hue;
                saturation = Math.abs(saturation) > 1 ? saturation % 1 : saturation;
                luminance = Math.abs(luminance) > 1 ? luminance % 1 : luminance;
                Utils.hslToRgbRW(hue, saturation, luminance, rgb);
            }
            else if (false) {
                // TODO: I don't know what unbounded here means.
                var unbounded = ESCAPE_THRESHOLD;
                var iterations = t;
                var hue = Math.log(iterations);
                var saturation = 1;
                var luminance = 0.5 * unbounded;
                hue = Math.abs(hue) > 1 ? hue % 1 : hue;
                saturation = Math.abs(saturation) > 1 ? saturation % 1 : saturation;
                luminance = Math.abs(luminance) > 1 ? luminance % 1 : luminance;
                Utils.hslToRgbRW(hue, saturation, luminance, rgb);
            }
            else if (true) {
                var nu = INV_NAT_LOG_2 * Math.log(Math.log(s1 + s2));
                var cv = Math.log(t + 1 - nu);
                var hue = cv;
                var saturation = 1;
                var luminance = escaped ? 0.5 : 0;
                hue = Math.abs(hue) > 1 ? hue % 1 : hue;
                saturation = Math.abs(saturation) > 1 ? saturation % 1 : saturation;
                luminance = Math.abs(luminance) > 1 ? luminance % 1 : luminance;
                Utils.hslToRgbRW(hue, saturation, luminance, rgb);
            }
            else {
                throw new Error("Whoops!");
            }
            ////////////////////
            // Color in pixel //
            ////////////////////
            arr[idx4] = rgb[0];
            arr[idx4 + 1] = rgb[1];
            arr[idx4 + 2] = rgb[2];
            arr[idx4 + 3] = 255;
        }
    }
    var result = {
        part: part,
        imgPart: arr.buffer,
        workerIndex: workerIndex,
        timestamp: timestamp,
        // Position
        re: cfg.scene.point.re,
        im: cfg.scene.point.im,
        zoom: cfg.scene.zoom
    };
    postMessage(result, [result.imgPart]);
};
