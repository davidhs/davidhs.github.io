import { FourGon } from './four-gon.js';
import { assert } from './utils.js';
import { GridMap } from './grid-map.js';

import {
    clearRect,
    getPixel,
    setPixel,
    drawLine
} from './gutil.js';
import { Vector } from './vector.js';
import { LineSegment } from './line-segment.js';

// ----------------------------------------------------------------------------

// NOTE: problem, zoom speed is different from Firefox and Google Chrome.

// zoom speed
const zoom_speed = 0.001;

// ----------------------------------------------------------------------------

let init = false;

var dom_file = document.getElementById('file');

dom_file.addEventListener('change', (evt) => {

    var file = dom_file.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {

        
        g_image.target.src = reader.result;

        g_image.target.onload = () => {

init = true;

            console.log(g_image.target);


            g_canvas0 = getImageAsCanvas(g_image.target);
            g_ctx0 = g_canvas0.getContext('2d');
            g_ctx0.imageSmoothingEnabled = false;

            setup();


            render();
        };





    }
    if (file) {
        reader.readAsDataURL(file);
    }

}, true);


/** Map from image to canvas 1. */
const grid_map = new GridMap();


let g_canvas0;
let g_ctx0;


var g_canvas1 = document.getElementById("canvas1");
var g_ctx1 = g_canvas1.getContext("2d");
g_ctx1.imageSmoothingEnabled = false;

var g_canvas2 = document.getElementById("canvas2");
var g_ctx2 = g_canvas2.getContext("2d");
g_ctx2.imageSmoothingEnabled = false;


var g_canvas3 = document.getElementById("canvas3");
var g_ctx3 = g_canvas3.getContext("2d");
g_ctx3.imageSmoothingEnabled = false;

var g_image = {};

g_image.target = new Image();

var g_mouse = {
    wheel: {
        y: 1
    },
    down: false
};


/**
 * 
 * @param {Image} image 
 */
function getImageAsCanvas(image) {

    const canvas = document.createElement('canvas');

    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    return canvas;
}


var g_fg = new FourGon();

g_canvas1.addEventListener('wheel', (evt) => {
    evt.preventDefault();
});


window.addEventListener('wheel', (evt) => {
    g_mouse.wheel.y += evt.deltaY;
    render();
});


window.addEventListener('mouseup', (evt) => {
    g_fg.letGo();
    g_mouse.down = false;
    render();
});


window.addEventListener('mousedown', (evt) => {

    if (g_mouse.down) return;

    var rect = g_canvas1.getBoundingClientRect();

    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;

    var c1 = x >= 0 && x <= g_canvas1.width;
    var c2 = y >= 0 && y <= g_canvas1.height;

    if (!(c1 && c2)) return;

    g_fg.grab(x, y);

    g_mouse.down = true;

    render();
});


window.addEventListener('mousemove', evt => {
    var rect = g_canvas1.getBoundingClientRect();

    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;

    if (g_mouse.down && g_fg.lock) {
        g_fg.drag(x, y);
    }

    g_mouse.x = x;
    g_mouse.y = y;

    render();
});


function render() {

    if (!init) {
        return;
    }

    render_canvas_1();
    render_canvas_2();
    // render_canvas_3();

    //render_canvas_3_new();

    render_canvas_3_new_new();
}

function setup() {

    const image = g_image.target;
    const canvas = g_canvas1;

    // 10 pixel padding
    const padding = 10;

    // Create mapping from rectangle
    //
    //   (g_image.target.width, g_image.target.height)
    //
    // to
    //
    //   (g_canvas1.width, g_canvas1.height)

    // Aspect ratio of image.
    const image_ar = image.width / image.height;

    // Aspect ratio of canvas.
    const canvas_ar = canvas.width / canvas.height;

    const effective_canvas_width = canvas.width - 2 * padding;
    const effective_canvas_height = canvas.height - 2 * padding;

    // The scale to be
    let s = 1;

    const x1 = 0;
    const y1 = 0;

    let x2 = 0;
    let y2 = 0;

    if (image_ar >= canvas_ar) {
        // Black bars up and down.
        // The width of the image is the limiting factor.

        s = effective_canvas_width / image.width;

        const h = s * image.height;

        const dy = (effective_canvas_height - h) / 2;

        x2 = padding;
        y2 = padding + dy;

    } else {
        // Black bars to the side.
        // The height of the image is the limiting factor.

        s = effective_canvas_height / image.height;

        const w = s * image.width;

        const dx = (effective_canvas_width - w) / 2;

        x2 = padding + dx;
        y2 = padding;
    }

    grid_map.setScale(s);

    grid_map.setGrid1X(x1);
    grid_map.setGrid1Y(y1);

    grid_map.setGrid2X(x2);
    grid_map.setGrid2Y(y2);
}




function render_canvas_1() {

    if (!init) {
        return;
    }

    clearRect(g_ctx1);

    // Source

    const sx = 0;
    const sy = 0;

    const sw = g_image.target.width;
    const sh = g_image.target.height;

    // Destination

    const dx = grid_map.get12X(sx);
    const dy = grid_map.get12Y(sy);

    const dw = grid_map.get12X(sx + sw) - grid_map.get12X(sx);
    const dh = grid_map.get12Y(sy + sh) - grid_map.get12Y(sy);

    g_ctx1.drawImage(
        g_image.target,
        sx, sy, sw, sh,
        dx, dy, dw, dh
    );

    // Render quadrilateral selection points onto the canvas.
    g_fg.render(g_ctx1);
}


function render_canvas_2() {

    // The aspect ratio is slightly wrong

    if (!init) {
        return;
    }

    clearRect(g_ctx2);

    const mx = g_mouse.x;
    const my = g_mouse.y;

    const c1 = mx >= 0 && mx <= g_canvas1.width;
    const c2 = my >= 0 && my <= g_canvas1.height;

    const zoom = Math.exp(zoom_speed * g_mouse.wheel.y);

    if (c1 && c2) {

        let changing = true;


        const tw = zoom * g_canvas1.width;
        const th = zoom * g_canvas1.height;

        const sx = mx - tw / 2;
        const sy = my - th / 2;
        const sw = tw;
        const sh = th;

        const dx = 0;
        const dy = 0;
        const dw = g_canvas2.width;
        const dh = g_canvas2.height;


        if (changing) {
            g_ctx2.drawImage(
                g_canvas1,
                sx, sy, sw, sh,
                dx, dy, dw, dh
            );
        } else {
            g_ctx2.drawImage(
                g_image.target,
                sx, sy, sw, sh,
                dx, dy, dw, dh
            );
        }

        g_ctx2.strokeStyle = "#f00";

        {
            const x1 = ~~(g_canvas2.width / 2) + 0.5;
            const y1 = 0;

            const x2 = ~~(g_canvas2.width / 2) + 0.5;
            const y2 = g_canvas2.height;

            drawLine(g_ctx2, x1, y1, x2, y2);
        }

        {
            const x1 = 0;
            const y1 = ~~(g_canvas2.height / 2) + 0.5;

            const x2 = g_canvas2.width;
            const y2 = ~~(g_canvas2.height / 2) + 0.5;

            drawLine(g_ctx2, x1, y1, x2, y2);
        }
    }
}


function render_canvas_3() {

    if (!init) {
        return;
    }

    clearRect(g_ctx3);

    var imgd1 = g_ctx1.getImageData(0, 0, g_canvas1.width, g_canvas1.height);
    var pix1 = imgd1.data;

    var imgd3 = g_ctx3.getImageData(0, 0, g_canvas3.width, g_canvas3.height);
    var pix3 = imgd3.data;

    var p = g_fg.points;

    // Horizontal

    var v01 = {
        x: p[1].x - p[0].x,
        y: p[1].y - p[0].y
    };

    var v32 = {
        x: p[2].x - p[3].x,
        y: p[2].y - p[3].y
    };

    // Vertical
    var v03 = {
        x: p[3].x - p[0].x,
        y: p[3].y - p[0].y
    };
    var v12 = {
        x: p[2].x - p[1].x,
        y: p[2].y - p[1].y
    };


    const m = g_canvas3.height;
    const n = g_canvas3.width;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {

            var sx = j / n;
            var sy = i / m;

            var v1 = {
                x: p[0].x + v01.x * sx,
                y: p[0].y + v01.y * sy
            };
            var v2 = {
                x: p[3].x + v32.x * sx,
                y: p[3].y + v32.y * sy
            };

            var h1 = {
                x: p[0].x + v03.x * sx,
                y: p[0].y + v03.y * sy
            };
            var h2 = {
                x: p[1].x + v12.x * sx,
                y: p[1].y + v12.y * sy
            };

            var dx1 = h2.x - h1.x;
            var dx2 = v2.x - v1.x;

            if (dx1 === 0 || dx2 === 0) continue;

            var a1 = (h2.y - h1.y) / dx1;
            var a2 = (v2.y - v1.y) / dx2;

            var b1 = h2.y - a1 * h2.x;
            var b2 = v2.y - a2 * v2.x;

            var tx = (b1 - b2) / (a2 - a1);
            var ty = a1 * tx + b1;

            tx = ~~(tx);
            ty = ~~(ty);

            var pixel = getPixel(pix1, tx, ty, g_canvas1.width);

            var r = pixel[0];
            var g = pixel[1];
            var b = pixel[2];

            setPixel(pix3, j, i, g_canvas3.width, r, g, b);
        }
    }

    // imgd3.data = pix3;

    g_ctx3.putImageData(imgd3, 0, 0);

}




function render_canvas_3_new() {

    if (!init) {
        return;
    }

    clearRect(g_ctx3);

    const imgd1 = g_ctx1.getImageData(0, 0, g_canvas1.width, g_canvas1.height);
    const pix1 = imgd1.data;

    const imgd3 = g_ctx3.getImageData(0, 0, g_canvas3.width, g_canvas3.height);
    const pix3 = imgd3.data;

    const p = g_fg.points;

    const A = [p[0].x, p[0].y];
    const B = [p[1].x, p[1].y];
    const C = [p[2].x, p[2].y];
    const D = [p[3].x, p[3].y];

    const AB = [
        B[0] - A[0],
        B[1] - A[1]
    ];

    const BC = [
        C[0] - B[0],
        C[1] - B[1]
    ];

    const CD = [
        D[0] - C[0],
        D[1] - C[1]
    ];

    const DA = [
        A[0] - D[0],
        A[1] - D[1]
    ];

    const samples = 32; // + 1

    for (let i = 0; i <= samples; i += 1) {

        const t = i / samples;

        for (let j = 0; j <= samples; j += 1) {

            const r = j / samples;

            const A_prime = [
                A[0] + t * AB[0],
                A[1] + t * AB[1]
            ];

            const B_prime = [
                B[0] + r * BC[0],
                B[1] + r * BC[1]
            ];

            const C_prime = [
                C[0] + t * CD[0],
                C[1] + t * CD[1]
            ];

            const D_prime = [
                D[0] + r * DA[0],
                D[1] + r * DA[1]
            ];

            const A_primeC_prime = [
                C_prime[0] - A_prime[0],
                C_prime[1] - A_prime[1]
            ];

            const B_primeD_prime = [
                D_prime[0] - B_prime[0],
                D_prime[1] - B_prime[1]
            ];

            const p_x = A_primeC_prime[0];
            const p_y = A_primeC_prime[1];

            const q_x = B_primeD_prime[0];
            const q_y = B_primeD_prime[1];

            const a_x = A_prime[0];
            const a_y = A_prime[1];

            const b_x = B_prime[0];
            const b_y = B_prime[1];

            setPixel(
                pix1,
                g_mouse.x - 10, g_mouse.y - 10,
                g_canvas1.width,
                127, 127, 127
            );

            const PQ = [
                [p_x, q_x],
                [p_y, q_y]
            ];

            const pq_det = PQ[0][0] * PQ[1][1] - PQ[0][1] * PQ[1][0];

            if (pq_det === 0) {
                continue;
            }

            const pq_det_inv = 1 / pq_det;


            const PQ_inv = [
                [q_y * pq_det_inv, -q_x * pq_det_inv],
                [-p_y * pq_det_inv, p_x * pq_det_inv]
            ];


            const gamma = [
                b_x - a_x,
                b_y - a_y
            ];



            const tau = [
                PQ_inv[0][0] * gamma[0] + PQ_inv[0][1] * gamma[1],
                PQ_inv[1][0] * gamma[0] + PQ_inv[1][1] * gamma[1]
            ];

            const alpha = tau[0];
            const beta = tau[1];

            const S_1 = [
                A_prime[0] + alpha * A_primeC_prime[0],
                A_prime[1] + alpha * A_primeC_prime[1]
            ];

            const S_2 = [
                B_prime[0] + beta * B_primeD_prime[0],
                B_prime[1] + beta * B_primeD_prime[1]
            ];


            if (false) {

                const eps = 0.001;


                if (!(Math.abs(S_1[0] - S_2[0]) < eps)) {
                    throw new Error(`${S_1[0]} should be the same as ${S_2[0]}.`);
                }

                if (!(Math.abs(S_1[1] - S_2[1]) < eps)) {
                    throw new Error(`${S_1[1]} should be the same as ${S_2[1]}.`);
                }


            }

            // assert S_1 === S_2


            const target_x = Math.round(S_2[0]);
            const target_y = Math.round(S_2[1]);

            const target_canvas_width = g_canvas1.width;


            // Sample pixel
            const sample_pixel = getPixel(pix1, target_x, target_y, target_canvas_width);

            // Draw pixel

            {
                const r = sample_pixel[0];
                const g = sample_pixel[1];
                const b = sample_pixel[2];

                const w = g_canvas3.width;
                const h = g_canvas3.height;

                const x = t * w;
                const y = r * h;


                setPixel(pix3, x, y, w, r, g, b);



            }
        }
    }
}


function render_canvas_3_new_new() {

    if (!init) {
        return;
    }

    clearRect(g_ctx3);

    const imgd0 = g_ctx0.getImageData(0, 0, g_canvas0.width, g_canvas0.height);
    const pix0 = imgd0.data;

    const imgd1 = g_ctx1.getImageData(0, 0, g_canvas1.width, g_canvas1.height);
    const pix1 = imgd1.data;

    const imgd3 = g_ctx3.getImageData(0, 0, g_canvas3.width, g_canvas3.height);
    const pix3 = imgd3.data;

    const p = g_fg.points;

    const A = new Vector([p[0].x, p[0].y]);
    const B = new Vector([p[1].x, p[1].y]);
    const C = new Vector([p[2].x, p[2].y]);
    const D = new Vector([p[3].x, p[3].y]);

    const AB = B.minus(A);
    const BC = C.minus(B);
    const CD = D.minus(C);
    const DA = A.minus(D);


    const L_AB = new LineSegment(A, B);
    const L_BC = new LineSegment(B, C);
    const L_CD = new LineSegment(C, D);
    const L_DA = new LineSegment(D, A);


    if (!L_AB.intersects(L_CD)) {

        // AB doesn't intersect CD

        // Samples + 1
        const m = g_canvas3.height - 1;

        const n = g_canvas3.width - 1;


        // Going down
        for (let i = 0; i <= m; i += 1) {

            const r = i / m;

            // Going right
            for (let j = 0; j <= n; j += 1) {

                const s = j / n;


                const P1 = A.plus(AB.scale(r));
                const P2 = D.plus(CD.neg().scale(r));


                const P1P2 = P2.minus(P1);

                const Q = P1.plus(P1P2.scale(s));

                // assert S_1 === S_2







                const target_x = Math.round(grid_map.get21X(Q.get(0)));
                const target_y = Math.round(grid_map.get21Y(Q.get(1)));


                assert(Number.isSafeInteger(target_x), `${target_x} is not a safe integer.`);
                assert(Number.isSafeInteger(target_y), `${target_y} is not a safe integer.`);




                // console.log(target_x, target_y);


                // Sample pixel
                const sample_pixel = getPixel(pix0, target_x, target_y, g_canvas0.width);

                // Draw pixel

                {
                    const c_r = sample_pixel[0];
                    const c_g = sample_pixel[1];
                    const c_b = sample_pixel[2];

                    const w = g_canvas3.width;
                    const h = g_canvas3.height;

                    const x = Math.round(s * w);
                    const y = Math.round(r * h);

                    assert(Number.isSafeInteger(x), `${x} is not a safe integer.`);
                    assert(Number.isSafeInteger(y), `${y} is not a safe integer.`);

                    setPixel(pix3, x, y, w, c_r, c_g, c_b);
                }

            }
        }

        g_ctx3.putImageData(imgd3, 0, 0);

    } else if (!L_BC.intersects(L_DA)) {

        // BC doesn't intersect DA

    } else {
        throw new Error();
    }
}


