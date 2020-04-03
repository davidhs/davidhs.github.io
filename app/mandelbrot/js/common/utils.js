export function assert(condition, message) {
    if (message === void 0) { message = "Assertion failed!"; }
    if (!condition) {
        throw new Error(message);
    }
}
export function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {Number}  r       The red color value
 * @param   {Number}  g       The green color value
 * @param   {Number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var _t1 = (max + min) / 2;
    var h = _t1;
    var s = _t1;
    var l = _t1;
    if (max === min) {
        h = s = 0; // achromatic
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
}
/**
 *
 * @param imageData
 * @param x
 * @param y
 * @param r
 * @param g
 * @param b
 * @param a
 */
export function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}
export function getSSArray(x_min, x_max, y_min, y_max, x_splits, y_splits) {
    var i;
    var x = [];
    var y = [];
    if (x_splits < 2) {
        x.push(0);
    }
    else {
        // Normalize
        x_splits = Math.round(x_splits);
        var dx = (x_max - x_min) / x_splits;
        // First element
        x.push(dx / 2 + x_min);
        for (i = 1; i < x_splits; i++) {
            x.push(x[i - 1] + dx);
        }
    }
    if (y_splits < 2) {
        y.push(0);
    }
    else {
        // Normalize
        y_splits = Math.round(y_splits);
        var dy = (y_max - y_min) / y_splits;
        // First element
        y.push(dy / 2 + y_min);
        for (var i_1 = 1; i_1 < y_splits; i_1++) {
            y.push(y[i_1 - 1] + dy);
        }
    }
    ////////
    // TODO do I need to do this? Does the compiler realise this? this is const
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
}
export function getObjectSize(obj) {
    var key, count = 0;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            count++;
        }
    }
    return count;
}
export function hue2rgb(p, q, t) {
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
}
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {Number}  h       The hue
 * @param   {Number}  s       The saturation
 * @param   {Number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
export function hslToRgb(h, s, l) {
    var r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
export function hslToRgbRW(h, s, l, arr) {
    var r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    arr[0] = Math.round(r * 255);
    arr[1] = Math.round(g * 255);
    arr[2] = Math.round(b * 255);
}
