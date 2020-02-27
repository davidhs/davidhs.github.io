const _catname = ['image', 'audio', 'text', 'json', 'xml'];
const _catlu = {};
for (let i = 0; i < _catname.length; i += 1) {
  _catlu[_catname[i]] = true;
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

// Desc:  
// Usage: processor.image(handle, url, callback);
// Pre:   don't remember what the handle was,
//        url is the URL that's supposed to be fetched and
//        be processed as an image,
//        callback is a function that is called once the image
//        has been loaded (or failed to load) with the resulting
//        data.
// Post:  Eventually the file should be loaded (or not) and the result is 
//        sent off to the function callback.
processor.image = function (handle, url, callback) {
  const img = new Image();

  img.onload = function (evt) {
    callback(img, 'image', handle, url);
  };

  img.onerror = function (evt) {
    callback(null, 'image', handle, url);
  };

  img.src = url;
};

// Process audio, most likely not needed.
// Desc:  ...
// Usage: ...
// Pre:   ...
// Post:  ...
processor.audio = function (handle, url, callback) {
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

// Desc:  ...
// Usage: ...
// Pre:   ...
// Post:  ...
processor.text = function (handle, url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(xhr.responseText, 'text', handle, url);
    } else {
      callback(null, 'text', handle, url);
    }
  };
  xhr.send();
};

// Desc:  ...
// Usage: ...
// Pre:   ...
// Post:  ...
processor.xml = function (handle, url, callback) {
  processor.text(handle, url, (response) => {
    if (response === null) callback(null, 'xml', handle, url);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, 'text/xml');
    callback(xmlDoc, 'xml', handle, url);
  });
};

// Desc:  ...
// Usage: ...
// Pre:   ...
// Post:  ...
processor.json = function (handle, url, callback) {
  processor.text(handle, url, (response) => {
    if (response === null) callback(null, 'json', handle, url);
    const json = JSON.parse(response);
    callback(json, 'json', handle, url);
  });
};

// Desc:  ...
// Usage: assetTick(asset, type, handle, url);
// Pre:   asset is a resources that was fetched off of the computer from the
//        URL url.
//        type is the type of built-in file processing that was applied, 
//        i.e. image, text, json, xml, etc.
//        handle is an string, a name to refer to the resource within the 
//        program.
//        url is a string refering to the URL where the file is stored.
// Post:  the bundles that are depending on this resource should be adequately
//        updated, or if the "bundle" has loaded all its resources it calls
//        the callback, that was supplied via load function, with the assets.
function assetTick(asset, type, handle, url) {
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

      delete bundles[i];

      bundles.splice(i, 1);
      i -= 1;

      bundle.callback(bundle.asset);
    }
  }
}

// PUBLIC FUNCTIONS

// Desc:  Loads assets off of your computer as specified in the `categories'
//        object.
// Usage: load(categories, callback);
// Pre:   categories is an object, potentially with the keys 'image', 'audio',
//        'text', 'json', and/or 'xml', the corresponding value to the key is
//        an object, and the keys to that object are the "handles", how you 
//        refer to the resources, and the value is the URL to the resource on
//        the computer.
//        callback is a function that is called once all the resources have 
//        been fetched, and the argument are all the resources.
// Post:  Eventually all the resources should be loaded and callback sent
//        those resources.
function load(categories, callback) {
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
      console.error(`loader.js: Type not supported: ${key}`);
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

  // Check if bundle is empty
  if (bundle.size === 0) {
    if (callback) callback(null);
    return;
  }

  // Push to bundles.
  bundles.push(bundle);

  const categoryNames = Object.keys(bundle.category);


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

export { load };
