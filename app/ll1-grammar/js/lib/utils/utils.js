
// Usage: ...
// Pre:   ...
// Post:  ...
const assert = (condition, message) => {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

// Usage: ...
// Pre:   ...
// Post:  ...
const extendObject = (object, extensions) => {
    if (!extensions) {
        return;
    }
    
    for (let i = 0, keys = Object.keys(extensions); i < keys.length; i += 1) {
        object[keys[i]] = extensions[keys[i]];
    }
};

// Desc:  Takes a snapshot of the object `obj'.
// Purp:  To get a copy of an object as-is, and being able to print it out to
//        console without unwanted modification inbetween.
// Usage: ...
// Pre:   ...
// Post:  ...
const snapshot = obj => JSON.parse(JSON.stringify(obj));

// Usage: t = n_arr(d, v);
// Pre:   d is an array [d1, d2, ..., dN], where di are
//        positive integers,
//        v is any value
// Post:  t is an n-dimensional array of the form
//        t[1..d1][1..d2]..[1..dN] with values v.
var n_arr = (() => {
    const h = (d, v, i) => {
        const a = [];
        const n = d[i];
        const il = (i === d.length - 1);
        for (let j = 0; j < n; j += 1) {
            if (il) { a.push(v); }
            else { a.push(h(d, v, i + 1)); }
        }
        return a;
    }
    return (d, v=0) => {
        return h(d, v, 0);
    }
})();

// Desc:  ...
// Purp:  ...
// Usage: ...
// Pre:   ...
// Post:  ...
function objectStringReplacement(obj, stringTarget, replacement) {
  const c1 = obj === null;
  const c2 = typeof obj === 'undefined';
  const c3 = typeof el === 'number';
  const c4 = typeof el === 'boolean';
  const c5 = typeof el === 'function';

  if (obj === null || typeof obj === 'undefined' || typeof el === 'number' || typeof el === 'boolean') {
    return;
  }

  // Check if object is array,
  // Check if object is "object"

  if (Array.isArray(obj)) {
    // Assume is array
    const arr = obj;
    for (let i = 0; i < arr.length; i += 1) {
      const el = arr[i];
      if (typeof el === 'string') {
        if (el === stringTarget) {
          arr[i] = replacement;
        } else {
          objectStringReplacement(el, stringTarget, replacement);
        }
      }
    }
  } else if (obj !== null && typeof obj !== 'undefined') {
    // Assume is object
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const el = obj[key];

      if (typeof el === 'string') {
        if (el === stringTarget) {
          obj[key] = replacement;
        }
      } else {
        objectStringReplacement(el, stringTarget, replacement);
      }
    }
  }
}

// Usage: pl = objPropsToList(obj);
// Pre:   obj is an object
// Post:  pl is an array containing the property names of the
//        obj, but does not go down the prototype chain.
const objPropsToList = obj => {
    const l = [];
    for (let i = 0, keys = Object.keys(obj); i < keys.length; i += 1) {
        const key = keys[i];
        l.push(obj[key]);
    }
    
    return l;
};

// Usage: x = value(value, defaultValue);
// Pre:   value might be an initialized value,
//        defaultValue is some other value.
// Post:  if value is initialized, then x is value, otherwise
//        x is defaultValue.
const value = (value, defaultValue) => {
    if (typeof value !== 'undefined') {
        return value;
    }
    return defaultValue;
}; 

// Usage: x = xml2json(xml);
// Pre:   xml is of the type XMLDocument.
// Post:  x is a JSON representation of the XML file xml.
function xml2json(xml) {
  let obj = {};


  if (typeof xml === 'undefined') throw Error();

  const ignoreEmptyStrings = true;

  // I'll do this later.  I want to be able to replace
  // every of this names with something else.
  const attributeHandle = '@attributes';
  const textHandle = '#text';

  if (xml.nodeType === XMLDocument.ELEMENT_NODE) {
    if (xml.attributes.length > 0) {
      obj[attributeHandle] = {};
      for (let i = 0; i < xml.attributes.length; i += 1) {
        const attribute = xml.attributes.item(i);
        obj[attributeHandle][attribute.nodeName] = attribute.nodeValue;
      }
    }
  }

  if (xml.nodeType === XMLDocument.TEXT_NODE) {
    obj = xml.nodeValue;
  }

  if (xml.nodeType === XMLDocument.DOCUMENT_NODE) { /* ... */ }


  if (typeof xml.hasChildNodes !== 'undefined' && xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i += 1) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      if (typeof obj[nodeName] === 'undefined') {
        const subtree = xml2json(item);

        if (typeof subtree === 'string') {
          const str = ignoreEmptyStrings ? subtree.trim() : subtree;
          if (str.length !== 0) {
            obj[nodeName] = str;
          }
        } else {
          obj[nodeName] = xml2json(item);
        }
      } else {
        // Multi line text?
        if (typeof obj[nodeName].push === 'undefined') {
          const oldObject = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(oldObject);
        }

        const subtree = xml2json(item);

        if (typeof subtree === 'string') {
          const str = ignoreEmptyStrings ? subtree.trim() : subtree;
          if (str.length !== 0) {
            obj[nodeName] = str;
          }
        } else {
          obj[nodeName].push(subtree);
        }
      }
    }
  }

  return obj;
}



export {
    assert
    , extendObject
    , snapshot
    , objectStringReplacement
    , objPropsToList
    , value
    , xml2json
    , n_arr
};
