var Utils = (function () {
    function Utils() {
    }
    Utils.shuffle = function (array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };
    Utils.rgbToHsl = function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, l];
    };
    Utils.setPixel = function (imageData, x, y, r, g, b, a) {
        var index = (x + y * imageData.width) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    };
    Utils.getSSArray = function (x_min, x_max, y_min, y_max, x_splits, y_splits) {
        var i;
        var x = [];
        var y = [];
        if (x_splits < 2) {
            x.push(0);
        }
        else {
            x_splits = Math.round(x_splits);
            var dx = (x_max - x_min) / x_splits;
            x.push(dx / 2 + x_min);
            for (i = 1; i < x_splits; i++) {
                x.push(x[i - 1] + dx);
            }
        }
        if (y_splits < 2) {
            y.push(0);
        }
        else {
            y_splits = Math.round(y_splits);
            var dy = (y_max - y_min) / y_splits;
            y.push(dy / 2 + y_min);
            for (var i_1 = 1; i_1 < y_splits; i_1++) {
                y.push(y[i_1 - 1] + dy);
            }
        }
        var LENGTH = x.length * y.length;
        var index = [];
        for (i = 0; i < LENGTH; i++) {
            index.push({
                x: x[i % x.length],
                y: y[Math.floor(i / x.length) % y.length]
            });
        }
        return {
            index: index,
            x: x,
            y: y
        };
    };
    Utils.getObjectSize = function (obj) {
        var key, count = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    };
    Utils.hue2rgb = function (p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    Utils.hslToRgb = function (h, s, l) {
        var r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = Utils.hue2rgb(p, q, h + 1 / 3);
            g = Utils.hue2rgb(p, q, h);
            b = Utils.hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    return Utils;
}());
