
// Usage: x = isIntervalIntersection(left1, right1, left2, right2);
// Pre:   left1, right1, left2, right2 are numbers such that
//        left1 <= right1 and left2 <= right2.
// Post:  x is true if intervals [left1, right1] and [left2, right2] intersect,
//        otherwise it's false.
const isIntervalIntersection = (left1, right1, left2, right2) => {
  const c1 = left1 <= right2;
  const c2 = right1 >= left2;

  return c1 && c2;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const clampRange = (value, lowBound, highBound) => {
  if (value < lowBound) {
    value = lowBound;
  } else if (value > highBound) {
    value = highBound;
  }
  return value;
};

// TODO I think this is the same as posmod
// Usage: ...
// Pre:   ...
// Post:  ...
const wrapRange = (value, lowBound, highBound) => {
  // TODO: use remainder operator instead of while loop.
  while (value < lowBound) {
    value += (highBound - lowBound);
  }
  while (value > highBound) {
    value -= (highBound - lowBound);
  }
  return value;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const isBetween = (value, lowBound, highBound) => {
    return !(value < lowBound || value > highBound);
};

// Usage: x = posmod(value, modulus);
// Pre:   modulus is a positive number,
//        value is a number.
// Post:  x and value are congruent modulo modulus, such that
//        0 <= x < modulus.
// Purp:  Don't want to deal with negative remainders.
const posmod = (value, modulus) => {
    return (modulus + (value % modulus)) % modulus;
}

// Usage: ...
// Pre:   ...
// Post:  ...
const inBounds = (value, minValue, maxValue) => {
    return (value >= minValue) && (value <= maxValue);
};

// Usage: ...
// Pre:   ...
// Post:  ...
const clamp = (value, min_value, max_value) => {
    if (value < minValue) {
        return minValue;
    } else if (value > maxValue) {
        return maxValue;
    } else {
        return value;
    }
};

// Usage: ...
// Pre:   ...
// Post:  ...
const range = (a, b) => {
  const l = [];
  for (let i = a; i < b; i += 1) {
    l.push(i);
  }
  return l;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const square = x => (x * x);

// Usage: ...
// Pre:   ...
// Post:  ...
const cube = x => (x * x * x);

// Usage: ...
// Pre:   ...
// Post:  ...
const distSq = (x1, y1, x2, y2) => (square(x2 - x1) + square(y2 - y1));

// Usage: ...
// Pre:   ...
// Post:  ...
const dist = (x1, y1, x2, y2) => Math.sqrt(distSq(x1, y1, x2, y2));


// Usage: y = sgn(x);
// Pre:   x is a number.
// Post:  y is -1 if x is less than 0, otherwise y is 1.
const sgn = x => x < 0 ? -1 : 1;

// Usage: ...
// Pre:   ...
// Post:  ...
const wrappedDistSq = (x1, y1, x2, y2, xWrap, yWrap) => {
  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);

  if (dx > xWrap / 2) {
    dx = xWrap - dx;
  }

  if (dy > yWrap / 2) {
    dy = yWrap - dy;
  }
  return square(dx) + square(dy);
};

export {
    isIntervalIntersection
    , clampRange
    , wrapRange
    , isBetween
    , randRange
    , posmod
    , inBounds
    , clamp
    , range
    , square
    , cube
    , distSq
    , dist
    , sgn
    , wrappedDistSq
};

