// Simulate wave equation using a lattice of springs
// -------------------------------------------------
//
// The wave equation in the one-dimensional case can be derived from Hooke's law (see https://en.wikipedia.org/wiki/Wave_equation#From_Hooke's_law).
// In this program we simulate a lattice of masses connected horizontally, vertically, and diagonally to neighbouring masses with springs.
// 
// 

import {
    animate,
    bresenhams_line_algorithm,
    offset_kernel,
    repeat_application,
    unsafe_transmute,
    unwrap,
} from "./utils.js";

/**
 * @typedef {{ mass: number, y: number, yv: number, yf: number, active: boolean }} Particle
 */


let brush_size = 3;
let brush_strength = 1000;

//let spring_constant = 0.0001;
let spring_constant = 0.01;

let displacement_damping = 0.99;

let spring_mass = 10;


let canvas_width = 2 ** 8;
let canvas_height = 2 ** 8;

const canvas_scaling = 4;

let eraser_on = false;

let is_brush_oscillating = true;
let brush_oscillation_frequency = 0.01;
let brush_time = 0;


// Initialize masses

//       x   x + 1
// y
// y + 1

/** @type {Particle[][]} */
const particles = [];

for (let y = 0; y < canvas_height; y++) {
    /** @type {Particle[]} */
    const column = [];
    
    for (let x = 0; x < canvas_width; x++) {
        /** @type {Particle} */
        const particle = {
            mass: spring_mass,
            // Position
            y: 0,
            // Velocity
            yv: 0,
            // Force
            yf: 0,
            active: true,
        };
        
        column.push(particle);
    }
    
    particles.push(column);
}


// [ ] Add slider for mass


// Displacement damping
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("damping")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("displacement-damping-value")))
    
    function f() {
        const value = parseFloat(slider.value);
    
        displacement_damping = repeat_application((x) => Math.log2(x + 1), value, 10);
        slider_value.innerText = "" + displacement_damping;    
    }
    
    slider.oninput = f;
    f();
}

// Spring stiffness
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("spring-stiffness")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("spring-stiffness-value")))
    
    function f() {
        let value = parseFloat(slider.value);
        
        value = value;
        spring_constant = value / 100000;
        
        slider_value.innerText = "" + value;    
    }
    
    slider.oninput = f;
    f();
}


// Spring Mass
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("spring-mass")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("spring-mass-value")))
    
    function f() {
        let value = parseFloat(slider.value);
        
        spring_mass = value;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = 0; j < particles[i].length; j++) {
                particles[i][j].mass = spring_mass;
            }
        }
        
        slider_value.innerText = "" + value;    
    }
    
    slider.oninput = f;
    f();
}

// Brush size
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("brush-size")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("brush-size-value")))
    
    function f() {
        const value = parseInt(slider.value, 10);
    
        brush_size = value;
        slider_value.innerText = "" + brush_size;
    }
    
    slider.oninput = f;
    f();
}

// Brush strength
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("brush-strength")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("brush-strength-value")))
    
    function f() {
        const value = parseInt(slider.value, 10);
    
        brush_strength = value;
        slider_value.innerText = "" + brush_strength;
    }
    
    slider.oninput = f;
    f();
}

// Eraser
{
    /** @type {HTMLInputElement} */
    const checkbox = unsafe_transmute(unwrap(document.getElementById("eraser")));
    
    function f() {
        eraser_on = checkbox.checked;
    }
    
    checkbox.oninput = f;
    f();
}

// Toggle oscillations
{
    /** @type {HTMLInputElement} */
    const checkbox = unsafe_transmute(unwrap(document.getElementById("oscillating")));
    
    function f() {
        is_brush_oscillating = checkbox.checked;
    }
    
    checkbox.oninput = f;
    f();
}

// Oscillation frequency
{
    /** @type {HTMLInputElement} */
    const slider = unsafe_transmute(unwrap(document.getElementById("oscillation-frequency")));
    /** @type {HTMLSpanElement} */
    const slider_value = unsafe_transmute(unwrap(document.getElementById("oscillation-frequency-value")))
    
    function f() {
        const value = parseInt(slider.value, 10);
    
        brush_oscillation_frequency = value / 10000;
        slider_value.innerText = "" + value;
    }
    
    slider.oninput = f;
    f();
}


/** @type {HTMLCanvasElement} */
const canvas = unsafe_transmute(unwrap(document.getElementById("canvas")));
canvas.width = canvas_width;
canvas.height = canvas_height;


canvas.style.width = `${canvas_scaling * canvas_width}px`;
canvas.style.height = `${canvas_scaling * canvas_height}px`;

let mouse_down = false;
let left_mouse_button_down = false;

let mouse_xp = 0;
let mouse_yp = 0;


canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

canvas.addEventListener("mouseenter", (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvas_x = e.clientX - rect.left;
    const canvas_y = e.clientY - rect.top;
    
    const x = Math.floor(canvas_x / canvas_scaling);
    const y = Math.floor(canvas_y / canvas_scaling);
    
    mouse_xp = x;
    mouse_yp = y;
});

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvas_x = e.clientX - rect.left;
    const canvas_y = e.clientY - rect.top;
    
    const x = Math.floor(canvas_x / canvas_scaling);
    const y = Math.floor(canvas_y / canvas_scaling);
    
    if (e.button === 0) {
        offset_kernel(brush_size, (ox, oy) => {
            applyToParticle(x + ox, y + oy, (p) => {
                if (is_brush_oscillating) p.y = brush_strength * Math.cos(brush_time * brush_oscillation_frequency)
                else p.y = brush_strength;
            });
        });
        
        left_mouse_button_down = true;
    }
    else if (e.button === 2) {
        offset_kernel(brush_size, (ox, oy) => {
            applyToParticle(x + ox, y + oy, (p) => {
                p.active = eraser_on;
            });
        });
    }
    
    mouse_down = true;
    
    mouse_xp = x;
    mouse_yp = y;
});

/**
 * @param {MouseEvent} e 
 */
function mouseMoveListener(e) {
    if (mouse_down) {
        const rect = canvas.getBoundingClientRect();
        const canvas_x = e.clientX - rect.left;
        const canvas_y = e.clientY - rect.top;
        
        const x = Math.floor(canvas_x / canvas_scaling);
        const y = Math.floor(canvas_y / canvas_scaling);
        
        offset_kernel(brush_size, (ox, oy) => {
            bresenhams_line_algorithm(ox + mouse_xp, oy + mouse_yp, ox + x, oy + y, (x, y) => {
                if (e.buttons === 1) {
                    applyToParticle(x, y, (p) => {
                        if (is_brush_oscillating) p.y = brush_strength * Math.cos(brush_time * brush_oscillation_frequency)
                        else p.y = brush_strength;
                    });
                }
                else if (e.buttons === 2) {
                    applyToParticle(x, y, (p) => {
                        p.active = eraser_on;
                    });
                }
            });
        });
        
        mouse_xp = x;
        mouse_yp = y;
    }
}

canvas.addEventListener("mousemove", mouseMoveListener);

canvas.addEventListener("mouseout", mouseMoveListener);

canvas.addEventListener("mouseup", (e) => {
    mouse_down = false;
    left_mouse_button_down = false;
});

document.onkeydown = (e) => {
    if (e.key === "e") {
        // Toggle eraser
        
        /** @type {HTMLInputElement} */
        const checkbox = unsafe_transmute(unwrap(document.getElementById("eraser")));
        
        checkbox.click();e
    }
    
    if (e.key === "c") {
        for (let i = 0; i < particles.length; i++) {
            for (let j = 0; j < particles[i].length; j++) {
                const particle = particles[i][j];
                
                particle.yf = 0;
                particle.y = 0;
                particle.yv = 0;
            }
        }
    }
    
    if (e.key === "t") {
        is_updating = !is_updating;
    }
};


const ctx = unwrap(canvas.getContext("2d"));


const image_data = ctx.getImageData(0, 0, canvas_width, canvas_height);

const { data } = image_data;





/**
 * @param {number} x 
 * @param {number} y 
 * @param {(particle: Particle) => void} callback
 */
function applyToParticle(x, y, callback) {
    if (x < 0 || x >= canvas_width || y < 0 || y >= canvas_height) return;
    const particle = particles[y][x];
    
    callback(particle);
}

/**
 * 
 * @param {number} ax 
 * @param {number} ay 
 * @param {number} ox 
 * @param {number} oy 
 * @param {(particle: Particle, distanceSquared: number) => void} callback 
 */
function applyToOffset(ax, ay, ox, oy, callback) {
    const bx = ax + ox;
    const by = ay + oy;
    
    if (bx < 0 || bx >= canvas_width || by < 0 || by >= canvas_height) return;
    const b = particles[by][bx];
    
    const distance_squared = ox * ox + oy * oy;
    
    callback(b, distance_squared);
}

let is_updating = true;

/**
 * Applies physics simulation update.
 * 
 * @param {number} dt
 */
function update(dt) {
    if (!is_updating) return;
    
    brush_time += dt;
    
    // Compute forces
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            const a = particles[y][x];
            
            if (!a.active) continue;
            
            /**
             * @param {Particle} b 
             * @param {number} distance_squared 
             */
            const computeForce = (b, distance_squared) => {
                if (!b.active) return;
                
                const k = spring_constant;
                
                // Hooke's law. Only apply to y-component.
                a.yf += -k * (a.y - b.y) / distance_squared;
            };
            
            
            applyToOffset(x, y, 0, -1, computeForce);
            applyToOffset(x, y, 1, -1, computeForce);
            applyToOffset(x, y, 1, 0, computeForce);
            applyToOffset(x, y, 1, 1, computeForce);
            applyToOffset(x, y, 0, 1, computeForce);
            applyToOffset(x, y, -1, 1, computeForce);
            applyToOffset(x, y, -1, 0, computeForce);
            applyToOffset(x, y, -1, -1, computeForce);
        }
    }
    
    
    
    // Apply and reset forces. Draw.
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            const p = particles[y][x];
            const i = 4 * (y * canvas_width + x);
            
            if (p.active) {
                const pya = p.yf / p.mass;
                const pyv = p.yv + dt * pya;
                const py = p.y + dt * pyv;
                
                p.yv = pyv;
                p.y = py * displacement_damping;
                
                // Reset force
                p.yf = 0;
            } else {
                p.yf = 0;
                p.yv = 0;
                p.y = 0;
            }
        }
    }
}

/**
 * @param {number} dt 
 */
function render(dt) {
    // Apply and reset forces. Draw.
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            const p = particles[y][x];
            const i = 4 * (y * canvas_width + x);
            
            if (p.active) {
                
                // Draw
                if (p.y > 0) {
                    data[i + 0] = 0;
                    data[i + 1] = p.y;
                    data[i + 2] = 0; // 100 * Math.abs(p.yv);
                    data[i + 3] = 255;
                }
                else {
                    data[i + 0] = -p.y;
                    data[i + 1] = 0;
                    data[i + 2] = 0; // 100 * Math.abs(p.yv);
                    data[i + 3] = 255;
                }
            } else {
                data[i + 0] = 128;
                data[i + 1] = 128;
                data[i + 2] = 128;
                data[i + 3] = 255;
            }
        }
    }
    
    ctx.putImageData(image_data, 0, 0);
}




animate((dt) => {
    // Re-apply brush if applicable.
    if (left_mouse_button_down) {
        offset_kernel(brush_size, (ox, oy) => {
            applyToParticle(mouse_xp + ox, mouse_yp + oy, (p) => {
                if (is_brush_oscillating) p.y = brush_strength * Math.cos(brush_time * brush_oscillation_frequency)
                else p.y = brush_strength;
            });
        });
    }
    
    update(dt);
    render(dt);
});
