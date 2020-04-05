/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { clamp, feq } from "../common/utils.js";
import * as Palette from "../common/palettes.js";
let is_working = false;
let stop_current_work = false;
let arr;
function* edgePixels(region) {
    // Edge checking
    const { x, y, w, h } = region;
    const x1 = x;
    const x2 = x + w;
    const y1 = y;
    const y2 = x + h;
    // Top -> Right -> Bottom -> Left (-> top)
    // Top
    {
        const y = y1;
        for (let x = x1; x < x2; x += 1) {
            yield [x, y];
        }
    }
    // Right
    {
        const x = x2 - 1;
        for (let y = y1 + 1; y < y2; y += 1) {
            yield [x, y];
        }
    }
    // Bottom
    {
        const y = y2 - 1;
        for (let x = x2 - 2; x >= x1; x -= 1) {
            yield [x, y];
        }
    }
    // Left
    {
        const x = x1;
        for (let y = y2 - 2; y >= y1; y -= 1) {
            yield [x, y];
        }
    }
}
function* pixelsRegion(cfg, region) {
    const { cw, ch, z } = cfg;
    let idx4 = 0;
    const x1 = region.x;
    const x2 = region.x + region.w;
    const y1 = region.y;
    const y2 = region.y + region.h;
    const z0 = 1.0 / Math.min(cw, ch);
    for (let y = y1; y < y2; y += 1) {
        const im = cfg.im + -z * z0 * (y - ch / 2.0);
        for (let x = x1; x < x2; x += 1, idx4 += 4) {
            const re = cfg.re + +z * z0 * (x - cw / 2.0);
            yield {
                re: re,
                im: im,
                idx: idx4
            };
        }
    }
}
function* processMaker(inMsg) {
    // Constants
    // const BAILOUT_RADIUS = 2147483647;
    const bailout_radius = 2 ** 20;
    const { cfg, region, part } = inMsg;
    arr = new Uint8ClampedArray(inMsg.imagePart.buffer); // data
    /** What is the max. iteration we're willing to tolerate. */
    const max_iterations = cfg.max_iter;
    /////////////////////////////////////
    // Render region of Mandelbrot set //
    /////////////////////////////////////
    const rgba = [0, 0, 0, 1.0];
    // Reset alpha channel of array
    // Edge checking
    for (const [x, y] of edgePixels(region)) {
    }
    // Border checking
    {
    }
    // Flood Mandelbrot
    {
    }
    // Color rest
    // TODO: maybe put the count limit such that it's proportional to region
    // size?
    let pixelCount = 0;
    const pixelCountYield = 2000;
    for (const { re: re0, im: im0, idx: idx4 } of pixelsRegion(cfg, region)) {
        pixelCount += 1;
        if (pixelCount % pixelCountYield === 0) {
            yield true;
        }
        let re = re0;
        let im = im0;
        /** What iteration we are on (fractional)? */
        let iterations = 0;
        /////////////////////////////
        // Cardoid / bulb checking //
        /////////////////////////////
        {
            const x = re;
            const y = im;
            const y_sq = y * y;
            const _p1 = x - (1.0 / 4.0);
            const p = Math.sqrt(_p1 * _p1 + y_sq);
            // Check if we're in the cardioid.
            if (x <= p - 2.0 * p * p + (1.0 / 4.0)) {
                iterations = max_iterations; // Do early rejection.
            }
            const x_inc = x + 1;
            // Check if we're inside period-2 bulb.
            if (x_inc * x_inc + y_sq <= (1.0 / 16.0)) {
                iterations = max_iterations; // Do early rejection.
            }
        }
        //////////////////////////////////////////
        // Check if we're in the Mandelbrot set //
        //////////////////////////////////////////
        /** re * re */
        let re_sq = re * re;
        /** im * im */
        let im_sq = im * im;
        let re_old = 0;
        let im_old = 0;
        let period = 0;
        const period_limit = 100;
        // Implementation of an optimized escape time algorithm.
        while (re_sq + im_sq <= bailout_radius && iterations < max_iterations) {
            im = 2 * re * im + im0;
            re = re_sq - im_sq + re0;
            re_sq = re * re;
            im_sq = im * im;
            iterations += 1;
            if (feq(re, re_old, Number.EPSILON) && feq(im, im_old, Number.EPSILON)) {
                // We're inside the Mandelbrot set
                iterations = max_iterations;
                break;
            }
            period += 1;
            if (period > period_limit) {
                period = 0;
                re_old = re;
                im_old = im;
            }
        }
        /**
         * A boolean whether we escaped, i.e. verified we're not part of the
         * mandelbrot set.
         */
        const escaped = iterations < max_iterations;
        if (iterations < max_iterations) {
            // const nu = Math.log2(Math.log2(re_sq + im_sq)) - 1.0;
            // iterations = iterations + 1 - nu;
            const log_zn = Math.log(re * re + im * im) / Math.log(2);
            const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
            iterations = iterations + 1 - nu;
        }
        // NOTE: iterations may be negative.
        // assert(Number.isFinite(iterations));
        Palette.softrainbow(escaped, iterations, rgba);
        arr[idx4 + 0] = clamp(Math.floor(256 * rgba[0]), 0, 255);
        arr[idx4 + 1] = clamp(Math.floor(256 * rgba[1]), 0, 255);
        arr[idx4 + 2] = clamp(Math.floor(256 * rgba[2]), 0, 255);
        arr[idx4 + 3] = clamp(Math.floor(256 * rgba[3]), 0, 255);
    }
    const outMsg = {
        id: inMsg.cfg.id,
        done: true,
        part: part,
        imgPart: arr.buffer,
        wi: inMsg.wi,
        re: cfg.re,
        im: cfg.im,
        z: cfg.z,
    };
    postMessage(outMsg, [outMsg.imgPart]);
    return false;
}
;
function doWork(inMsg) {
    const process = processMaker(inMsg);
    is_working = true;
    while (process.next().value) {
        if (stop_current_work) {
            break;
        }
    }
    is_working = false;
    if (stop_current_work) {
        stop_current_work = false;
        const { cfg, part } = inMsg;
        const outMsg = {
            id: inMsg.cfg.id,
            done: false,
            part: part,
            imgPart: arr.buffer,
            wi: inMsg.wi,
            re: cfg.re,
            im: cfg.im,
            z: cfg.z,
        };
        postMessage(outMsg, [outMsg.imgPart]);
    }
}
function doStop() {
    if (is_working) {
        stop_current_work = true;
    }
}
function messageHandler(e) {
    const inMsg = e.data;
    if (inMsg.type === "work") {
        doWork(inMsg);
    }
    else if (inMsg.type === "stop") {
        doStop();
    }
}
onmessage = messageHandler;
