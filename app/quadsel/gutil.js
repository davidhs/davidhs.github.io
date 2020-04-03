import { clampInt } from './utils.js';

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} color 
 */
function clearRect(ctx, color) {
    const oldFillStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.fillStyle = color || "#000";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = oldFillStyle;
}





/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 */
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 * @param {number} y 
 * @param {number} r 
 */
function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}


/**
 * 
 * @param {Uint8ClampedArray} data 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 */
function getPixel(data, x, y, w) {
    const idx = 4 * ( x + y * w );
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    return [r, g, b];
}


/**
 * 
 * @param {Uint8ClampedArray} data 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 */
function setPixel(data, x, y, w, r, g, b) {
    const idx = 4 * ( Math.round(x) + Math.round(y) * Math.round(w) );
    data[idx] = clampInt(r, 0, 255);
    data[idx + 1] = clampInt(g, 0, 255);
    data[idx + 2] = clampInt(b, 0, 255);
    data[idx + 3] = 255;
}


export {
    clearRect,
    drawLine,
    drawCircle,
    getPixel,
    setPixel
};
