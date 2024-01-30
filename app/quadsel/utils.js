
/**
 * @param {unknown} condition 
 * @param {string=} message 
 * @param {(() => void)=} callback 
 * @returns {asserts condition}
 */
function assert(condition, message, callback) {
    if (!condition) {
        if (callback) {
            callback();
        }
        throw new Error(message);
    }
}

/**
 * 
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 */
function clamp(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}


/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 */
function clampInt(value, min, max) {
    return Math.round(clamp(value, min, max));
}

export { 
    assert,
    clamp,
    clampInt
};
