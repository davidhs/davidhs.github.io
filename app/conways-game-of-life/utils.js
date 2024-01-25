/**
 * Asserts that the variable `conditional` is truthy, otherwise an (assertion) error is thrown.
 * 
 * @param {unknown} condition A condition that is expected to be truthy.
 * @param {(string | (() => void))=} message_or_function A message that is displayed or a function that is called if the assertion is violated.
 * @throws If the assertion is violated.
 * @returns {asserts condition}
 */
export function assert(condition, message_or_function = "") {
	if (!condition) {
		if (message_or_function === undefined || message_or_function === null || typeof message_or_function === "boolean" || typeof message_or_function === "number" || typeof message_or_function === "string") {
			throw new Error(`Assertion failed: ${message_or_function}`);
		} else {
			if (typeof message_or_function === "function") {
				message_or_function();
				throw new Error("Assertion failed!");
			} else {
				console.error("Assertion failed:", message_or_function);
				throw new Error("Assertion failed!");
			}
		}
	}
}


/**
 * @template T
 * @param {undefined | null | T} x
 * @returns {T}
 */
export function unwrap(x) {
	if (x === undefined || x === null) {
		throw new Error(`Unwrap error: x is expected not to be undefined or null, it is: ${x}`);
	}
	
	return x;
}

/**
 * @template T
 * @param {unknown} x 
 * @returns {T}
 */
export function unsafe_transmute(x) {
    // @ts-ignore
	return x;
}

/**
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @param {(x: number, y: number) => void} callback 
 */
export function bresenhams_line_algorithm(x1, y1, x2, y2, callback) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    
    let err = dx - dy;
    
    let x = x1;
    let y = y1;
    
    while (!((x === x2) && (y === y2))) {
        const e2 = 2 * err;
        
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
        
        callback(x, y);
    }
}

/**
 * @param {number} s 
 * @param {(ox: number, oy: number) => void} callback 
 */
export function offset_kernel(s, callback) {
    const a = -Math.floor(s / 2);
    const b = Math.ceil(s / 2);
    
    for (let y = a; y <= b; y++) {
        for (let x = a; x <= b; x++) {
            callback(x, y);
        }
    }
}

/**
 * @param {(dt: number) => void} callback 
 */
export function create_animator(callback) {
    let is_running = false;
    
    let previous_time = 0;
    
    let min_frame_duration = Infinity;
    
    const animator = {
        isRunning: () => {
            is_running = true;
        },
        stop: () => {
            if (!is_running) return;
            is_running = false;
        },
        start: () => {
            if (is_running) return;
            is_running = true;
            
            requestAnimationFrame(animation_iteration);
        },
        toggle: () => {
            if (is_running) animator.stop();
            else animator.start();
        },
    };
    
    
    /** @param {DOMHighResTimeStamp} time */
    function animation_iteration(time) {
        if (!is_running) return;
        
        let dt = time - previous_time;
        previous_time = time;
        
        if (dt < min_frame_duration) min_frame_duration = dt;
        
        dt = clamp(dt, 1, 2 * min_frame_duration);
        
        callback(dt);
        requestAnimationFrame(animation_iteration);
    }
    
    animator.start();
    
    return animator;
}

/**
 * @param {(x: number) => number} f 
 * @param {number} x0 
 * @param {number} n 
 */
export function repeat_application(f, x0, n) {
    let x = x0;
    
    for (let i = 0; i < n; i++) {
        x = f(x);
    }
    
    return x;
}

/**
 * @param {number} x 
 * @param {number} min 
 * @param {number} max 
 */
export function clamp(x, min, max) {
   if (x < min) return min;
   if (x > max) return max;
   return x; 
}
