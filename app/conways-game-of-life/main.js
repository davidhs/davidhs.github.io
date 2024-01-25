import {
    create_animator,
    bresenhams_line_algorithm,
    unsafe_transmute,
    unwrap,
} from "./utils.js";

let canvas_width = 2 ** 6;
let canvas_height = 2 ** 6;

const canvas_scaling = 8;



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
    
    grids[grid_index][y][x] = true;
    
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
        
        bresenhams_line_algorithm(mouse_xp, mouse_yp, x, y, (x, y) => {
            grids[grid_index][y][x] = true;
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

let is_updating = false;

document.onkeydown = (e) => {
    if (e.key === "t") {
        is_updating = !is_updating;
    }
};


const ctx = unwrap(canvas.getContext("2d"));


const image_data = ctx.getImageData(0, 0, canvas_width, canvas_height);

const { data } = image_data;


let grid_index = 0;
/** @type {boolean[][][]} */
const grids = [];


for (let i = 0; i < 2; i++) {
    const grid = [];
    
    for (let y = 0; y < canvas_height; y++) {
        /** @type {boolean[]} */
        const col = [];
        
        for (let x = 0; x < canvas_width; x++) {
            col.push(false);
        }
        
        grid.push(col);
    }
    
    grids.push(grid);
}


// Alive if: 2 - 3 life neighbor 

/**
 * @param {number} x 
 * @param {number} y 
 */
function nr_of_live_neighbor(x, y) {
    let live_neighbors = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx < 0 || nx >= canvas_width || ny < 0 || ny >= canvas_height) continue;
            
            if (grids[grid_index][ny][nx]) live_neighbors += 1;
        }
    }
    
    return live_neighbors;
}

/** @param {number} dt */
function update(dt) {
    if (!is_updating) return;
    
    const alternative_grid_index = (grid_index + 1) % 2;
    
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            const live_neighbors = nr_of_live_neighbor(x, y);
            
            const live = grids[grid_index][y][x];
            
            if (live) {
                if (live_neighbors < 2 || live_neighbors > 3) grids[alternative_grid_index][y][x] = false;
                else grids[alternative_grid_index][y][x] = true;
            } else {
                if (live_neighbors === 3) grids[alternative_grid_index][y][x] = true
            }
        }
    }
    
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            grids[grid_index][y][x] = false;
        }
    }
    
    grid_index = (grid_index + 1) % 2;
}

/** @param {number} dt */
function render(dt) {
    // Compute and draw
    for (let y = 0; y < canvas_height; y++) {
        for (let x = 0; x < canvas_width; x++) {
            const i = 4 * (y * canvas_width + x);
            
            if (grids[grid_index][y][x]) {
                data[i + 0] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
            else {
                data[i + 0] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
            }   
        }
    }
    
    ctx.putImageData(image_data, 0, 0);
}


const animator = create_animator((dt) => {
    // Re-apply brush if applicable.
    if (left_mouse_button_down) {
        grids[grid_index][mouse_yp][mouse_xp] = true;
    }
    
    update(dt);
    render(dt);
});
