/**
 * Asserts that the variable `conditional` is truthy, otherwise an (assertion) error is thrown.
 * 
 * @param {unknown} condition A condition that is expected to be truthy.
 * @param {(string | () => void)=} message_or_function A message that is displayed or a function that is called if the assertion is violated.
 * @throws If the assertion is violated.
 * @returns {asserts condition}
 */
function assert(condition, message_or_function = "") {
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
function unwrap(x) {
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
function unsafe_transmute(x) {
	return x;
}

/** @type {HTMLBodyElement} */
const dom_body = document.body;

let hue = 360 * Math.random();
const hue_direction = Math.random() > 0.5 ? 1 : -1;
const hue_change = hue_direction * 0.1;

let pt = 0;


/**
 * @param {number} t 
 */
function animate(t) {
	// Time in milliseconds before previous frame
	const dt = t - pt;
	
	pt = t;
	
	if (pt !== 0) {
		hue = (hue + hue_change * dt * 0.05) % 360;
		dom_body.style.backgroundColor = `hsl(${Math.floor(hue)}, 100%, 50%)`;
	}
	
	requestAnimationFrame(animate);
}

animate(0);
