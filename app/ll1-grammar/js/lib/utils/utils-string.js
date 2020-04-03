

const leftPad = (str, length, pad) => {
    const s = "" + str;
    const n = Math.max(0, length - s.length);
    return pad.repeat(n) + s;
};



const rightPad = (str, length, pad) => {
  const s = "" + str;
  const n = Math.max(0, length - s.length);
  return s + pad.repeat(n);
};

const replaceAll = (string, replacement) => {
  return string.replace(new RegExp(search, 'g'), replacement);
};


// Desc:  Concatenates the prefix to the URLs.
// Usage: x = prefixStrings(prefix, strings);
// Pre:   prefix is a string,
//        strings is an object.
// Post:  x is an object whose keys are the same as in strings,
//        and the value mapped by those keys is the prefix plus
//        the key.
const prefixStrings = (prefix, strings) => {
  const obj = {};

  for (let i = 0, keys = Object.keys(strings); i < keys.length; i += 1) {
    const key = keys[i];
    obj[key] = prefix + strings[key];
  }

  return obj;
};

const stringSummary = (str, n, pad) => {

    let ts = str.trim();

    if (ts.length > n) {
        ts = ts.substring(0, n - 3) + "...";
    }

    return ts.padEnd(n, pad);
};

function escapeHTML(unsafe, wsr=8) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/\t/g, "&nbsp;".repeat(wsr))
         .replace(/\n/g, "<br/>");
}

export {
    leftPad
    , rightPad
    , stringSummary
    , escapeHTML
};
