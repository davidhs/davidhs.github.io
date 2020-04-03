/**
 * 
 * @param {number} value 
 * @param {number} minValue 
 * @param {number} maxValue 
 */
export function clamp(value, minValue, maxValue) {
  if (value < minValue) {
    return minValue;
  } else if (value > maxValue) {
    return maxValue;
  } else {
    return value;
  }
}

export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function fastSigmoid(x) {
  return (1 + x / (1 + Math.abs(x))) / 2;
}

export function fastLogisticFunction(x, L, k, x_0) {
  // L * fastSigmoid(k * (x - x_0))

  const x_t = k * (x - x_0);

  return L * (1 + x_t / (1 + Math.abs(x_t))) / 2;
}

/**
 * 
 * @param {number} x point on logistic
 * @param {number} L max value (1 sigmoid)
 * @param {number} k steepness (1 sigmoid)
 * @param {number} x_0 midpoint (0 sigmoid)
 */
export function logisticFunction(x, L, k, x_0) {

  return L / (1 + Math.exp(-k * (x - x_0)));
}


/**
 * 
 * @param {*} condition 
 * @param {*} message
 * @param {*=} callback 
 */
export function assert(condition, message = "Assertion failed", callback) {
  if (!condition) {

    if (callback) {
      callback();
    }
    throw new Error(message);
  }
}