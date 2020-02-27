'use strict';

/* global Image Audio XMLHttpRequest  :true */

/* jslint browser: true, devel: true, white: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ======
// LOADER
// ======

// The loader loads assets off of your computer.
// This is a generic loader, i.e. should be reusable.

// Usage: loader.load(x, y);
// Before: x is an object of the form
//  {
//    image: [...paths],
//    audio: [...paths],
//    text: [...paths],
//    json: [...paths],
//    xml: [...paths]
//  }
// where the paths are a paths to the files
// that need to be loaded.
const loader = (function () {
  // Types of assets this manager supports.
  // const _catname = ['image', 'audio', 'text'];

  const DEBUG = false;
  const VERBOSE = false;
  const FILENAME = 'loader.js';

  const _catname = ['image', 'audio', 'text', 'json', 'xml'];
  const _catlu = {};
  for (let ii = 0; ii < _catname.length; ii += 1) {
    _catlu[_catname[ii]] = true;
  }

  // Each load invocation creates a bundle.  A bundle
  // keeps track of the callback function, which URLs
  // to process, and how many assets have been received.
  // This enables the user to have multiple load
  // invocations at the same time.
  const bundles = [];

  // Processes given asset type.
  const processor = {};

  // Process image
  processor.image = function (handle, url, callback) {
    const img = new Image();

    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Processing image: ${url}`);

    img.onload = function (evt) {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing image: ${url}`);
      callback(img, 'image', handle, url);
    };

    img.onerror = function (evt) {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing image (error): ${url}`);
      callback(null, 'image', handle, url);
    };

    img.src = url;
  };

  // Process audio, most likely not needed.
  processor.audio = function (handle, url, callback) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Processing audio: ${url}`);
    // const audio = new Audio(url, 'audio');
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing audio: ${url}`);
    // callback(audio, 'audio', handle, url);

    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (evt) {
      const req = evt.target;
      audioManager.ctx.decodeAudioData(req.response, function (buffer)
      {
        callback(buffer, 'audio', handle, url);
      });
    };
    xhr.send();
  };

  // Processes text
  processor.text = function (handle, url, callback) {
    if (DEBUG) console.log(`${FILENAME}: Processing text: ${url}`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.onload = function () {
      if (xhr.status === 200) {
        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing text: ${url}`);
        callback(xhr.responseText, 'text', handle, url);
      } else {
        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing text (error): ${url}`);
        callback(null, 'text', handle, url);
      }
    };
    xhr.send();
  };

  processor.xml = function (handle, url, callback) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Processing XML: ${url}`);
    processor.text(handle, url, (response) => {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing XML: ${url}`);
      if (response === null) callback(null, 'xml', handle, url);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, 'text/xml');
      callback(xmlDoc, 'xml', handle, url);
    });
  };


  processor.json = function (handle, url, callback) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Processing JSON: ${url}`);
    processor.text(handle, url, (response) => {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Done processing JSON: ${url}`);
      if (response === null) callback(null, 'json', handle, url);
      const json = JSON.parse(response);
      callback(json, 'json', handle, url);
    });
  };

  /**
   * Each time an asset has been (successfully/unsuccessfully) loaded
   * then this function is invoked.
   * ajksdfaæds fkjasæjkf læasdflækjas lædfkjasl kædfjasældkfj ælasdjflæ ajsdflækj aslædfj
   *
   * @param {*} asset
   * @param {string} url
   */
  function assetTick(asset, type, handle, url) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Tick:`, asset, type, handle, url);

    for (let i = 0; i < bundles.length; i += 1) {
      const bundle = bundles[i];
      const bundleLut = bundle.lut;
      const lut = bundleLut;

      // Check if this bundle has been waiting
      // for this URL
      if (lut[url]) {
        lut[url] = false;
        bundle.count += 1;
        if (!bundle.asset[type]) bundle.asset[type] = {};
        if (!bundle.asset[type][handle]) bundle.asset[type][handle] = {};
        bundle.asset[type][handle] = asset;
      }

      // If all assets are loaded in the
      // bundle, call callback with
      // assets.
      if (bundle.count === bundle.size) {
        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Remaining bundles: ${bundles.length}`);
        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Before release:`, util.snapshot(bundle));

        delete bundles[i];

        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Bundle at index ${i} complete.`);

        bundles.splice(i, 1);
        i -= 1;

        bundle.callback(bundle.asset);
      }
    }
  }

  // PUBLIC FUNCTIONS

  /**
   * Loads assets off of your computer as specified in `categories'.
   * Doesn't even have to be an array.
   *
   * @param {{image:string[],audio:string[],text:string[],json:string[],xml:string[]}} categories
   * @param {function} callback
   */
  function load(categories, callback) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Input:`, util.snapshot(categories));
    // TODO: probably doesn't work
    if (!categories) {
      if (callback) {
        callback(null);
      }
      return;
    }

    for (let i = 0, keys = Object.keys(categories); i < keys.length; i += 1) {
      const key = keys[i];
      if (!_catlu[key]) {
        console.error(`${util.timestamp()}: ${FILENAME}: Type not supported: ${key}`);
      }
    }

    // Create a bundle
    const bundle = {
      category: {},
      size: 0,
      count: 0,
      callback,
      asset: {},
      lut: {},
    };

    // Load into bundle
    for (let i = 0; i < _catname.length; i += 1) {
      const catname = _catname[i];
      const urls = categories[catname];

      if (!urls) continue;

      const urlKeys = Object.keys(urls);

      for (let j = 0, keys = urlKeys; j < keys.length; j += 1) {
        const url = urls[keys[j]];
        bundle.lut[url] = true;
      }

      bundle.size += urlKeys.length;
      bundle.category[catname] = urls;
    }

    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Bundle state:`, util.snapshot(bundle));

    // Check if bundle is empty
    if (bundle.size === 0) {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Bundle is empty.`);
      if (callback) callback(null);
      return;
    }

    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Adding bundle with ${bundle.size} elements.`);
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Bundle to process:`, util.snapshot(bundle));

    // Push to bundles.
    bundles.push(bundle);

    const categoryNames = Object.keys(bundle.category);
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Category names requested:`, categoryNames);


    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      const urls = bundle.category[categoryName];
      const urlKeys = Object.keys(urls);

      for (let i = 0; i < urlKeys.length; i += 1) {
        const handle = urlKeys[i];
        const url = urls[handle];
        if (!processor[categoryName]) throw Error('CATEGORY NOT SUPPORTED: ', categoryName);
        processor[categoryName](handle, url, assetTick);
      }
    }
  }

  // EXPOSE

  const returnObject = {};

  returnObject.load = load;

  if (DEBUG) {
    returnObject.debug = {
      bundles,
    };
  }

  return returnObject;
}());
