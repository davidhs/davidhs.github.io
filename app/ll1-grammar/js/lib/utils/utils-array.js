// Usage: ...
// Pre:   ...
// Post:  ...
const createPicker = comparator => (...args) => {
    if (args.length === 0) {
      return undefined; // undefined
    }
    
    let arr;
    
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            arr = args[0];
        } else {
            return args[0];
        }
    } else {
        arr = args;
    }
    
    let best = arr[0];
    
    for (let i = 1; i < arr.length; i += 1) {
        if (comparator(arr[i], best)) {
            best = arr[i];
        }
    }
    
    return best;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const pickMin = createPicker((a, b) => a < b);

// Usage: ...
// Pre:   ...
// Post:  ...
const pickMax = createPicker((a, b) => a > b);

// Usage: ...
// Pre:   ...
// Post:  ...
const minIndex = (...args) => args.indexOf(pickMin(args));

// Usage: ...
// Pre:   ...
// Post:  ...
const booleanANDArray = (arr) => {
  for (let i = 0; i < arr.length; i += 1) if (!arr[i]) return false;

  return true;
};

// Usage: ...
// Pre:   ...
// Post:  ...
const booleanORArray = (arr) => {
  for (let i = 0; i < arr.length; i += 1) if (arr[i]) return true;

  return false;
};

function shuffle(arr) {
    arr.forEach((cv, i, a) => {
        const j = i + ~~(Math.random() * (a.length - i));
        [a[i], a[j]] = [a[j], a[i]];
    });
}

export {
    createPicker
    , pickMin
    , pickMax
    , minIndex
    , booleanANDArray
    , booleanORArray
    , shuffle
};