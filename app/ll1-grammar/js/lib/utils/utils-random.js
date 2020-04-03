
// Usage: ...
// Pre:   ...
// Post:  ...
const randRange = (min, max) => {
    return min + Math.random() * (max - min);
};

// Usage: x = randomInt(range);
// Pre:   x has to be a number.
// Post:  x is a random number between 0 and range.
const randomInt = range => Math.floor(Math.random() * range);

export {
    randRange
    , randomInt
};
