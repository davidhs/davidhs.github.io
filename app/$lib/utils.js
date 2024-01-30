/**
 * @param {unknown} condition 
 * @param {(string | () => void)=} message_or_callback 
 */
export function assert(condition, message_or_callback) {
	if (!condition) {
		if (typeof message_or_callback === "undefined") {
			throw new Error("Assertion failed!");
		}
		else if (typeof message_or_callback === "function") {
			message_or_callback();
			throw new Error("Assertion failed!");
		}
		else {
			throw new Error(`Assertion failed: ${message_or_callback}`);
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
 * @param {number} x 
 * @param {number} min 
 * @param {number} max 
 */
export function clamp(x, min, max) {
	if (x < min) return min;
	if (x > max) return max;
	return x; 
}

/**
 * TODO: Untested
 * 
 * PRECONDITION:
 * 
 * * min < max
 * 
 * @param {number} x 
 * @param {number} min 
 * @param {number} max 
 */
export function wrap(x, min, max) {
	const span = max - min;
	const y = x - min;
	const z = ((y % span) + span) % span;
	const w = z + min;
	return w;
}
