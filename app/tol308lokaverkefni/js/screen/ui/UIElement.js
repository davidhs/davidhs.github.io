'use strict';


/**
 *
 */
function UIElement() {}

// =========================
// PRIVATE SHARED PROPERTIES
// =========================

UIElement.prototype._fontHeightCache = {};

// =============================
// PUBLIC "IMMUTABLE" PROPERTIES
// =============================

UIElement.prototype.LAYOUT_DEFAULT = 'default';
UIElement.prototype.LAYOUT_CARD = 'card';

// =========================
// PUBLIC SHARED? PROPERTIES
// =========================

UIElement.prototype.cardSelection = -1;

UIElement.prototype.borderColor = '#888';
UIElement.prototype.foregroundColor = '#111';
UIElement.prototype.backgroundColor = '#f00';

UIElement.prototype.layout = 'default';

// ==========================
// PRIVATE "HELPER" FUNCTIONS
// ==========================


/**
 *
 * @param {UIElement} obj
 */
UIElement.prototype._setup = function (obj) {
  obj.name = '';

  obj._children = [];

  // Is relative to parent
  obj._x = null;
  obj._y = null;

  obj.parent = null;

  obj._intersectedWidth = -1;
  obj._intersectedHeight = -1;

  obj._requestedWidth = -1;
  obj._requestedHeight = -1;

  obj._providedWidth = -1;
  obj._providedHeight = -1;

  obj._actualX = null;
  obj._actualY = null;

  obj.typeCallbacks = {};

  obj.background = null;
};


/**
 * To get the maximum size of the font as the end user would perceive it
 * we draw the text to canvas and measure it.
 * 
 * @param {string} fontStyle
 *
 * @returns {top: number, bottom: number}
 */
UIElement.prototype._getFontHeight = function (fontStyle) {
  console.info(fontStyle);
  if (this._fontHeightCache[fontStyle]) {
    return this._fontHeightCache[fontStyle];
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.font = fontStyle;
  ctx.fillText('gM', 0, 0);
  const pixels = ctx.getImageData(0, 0, w, h).data;


  let left = canvas.width;
  let right = 0;
  let top = h;
  let bottom = 0;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = 4 * (x + y * w);
      const r = pixels[idx];

      if (r !== 0) {
        if (top > y) {
          top = y;
        }
        if (bottom < y) {
          bottom = y;
        }
        if (x < left) {
          left = x;
        }
        if (x > right) {
          right = x;
        }
      }
    }
  }

  const result = { 
    top,
    bottom,
    left,
    right,
    height: bottom - top + 1,
  };

  this._fontHeightCache[fontStyle] = result;

  if (false) {
    // Draw bounding box
    // Check if it works as expected.
    ctx.strokeStyle = "#0f0";

    // offset
    const oy = 0.5;
    const ox = 0.5;

    // Upper left corner
    ctx.moveTo(ox + left,  oy + top);
    ctx.lineTo(ox + right, oy + top);
    ctx.lineTo(ox + right, oy + bottom);
    ctx.lineTo(ox + left,  oy + bottom);
    ctx.lineTo(ox + left,  oy + top);
    ctx.stroke();
    
    document.querySelector("body").appendChild(canvas);
  }
  

  return result;
};


/**
 *
 * @param {string} fontStyle
 * @param {string} text
 */
UIElement.prototype._getTextWidth = function (fontStyle, text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = fontStyle;

  const tm = ctx.measureText(text);

  if (false) {
    // Debug
    console.info(tm);
  }

  return tm.width;
};


/**
 *
 */
UIElement.prototype._updateUI = function () {
  const children = this._children;
  const ox = this.getOuterX();
  const oy = this.getOuterY();
  const w = this.getWidth();
  const h = this.getHeight();
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    child.setPosition(ox, oy);
    child._setProvidedDimensions(w, h);
    child._updateUI();
  }
};

// ================
// PUBLIC FUNCTIONS
// ================


/**
 *
 * @param {string} name
 */
UIElement.prototype.setName = function (name) {
  this.name = name;
};


/**
 *
 * @param {string} type
 * @param {function} callback
 */
UIElement.prototype.addEventListener = function (type, callback) {
  const typeCallbacks = this.typeCallbacks;

  if (!typeCallbacks[type]) {
    typeCallbacks[type] = [];
  }

  typeCallbacks[type].push(callback);
};


/**
 *
 * @param {*} layout
 */
UIElement.prototype.setLayout = function (layout) {
  this.layout = layout;
};


/**
 *
 * @param {number} x
 * @param {number} y
 */
UIElement.prototype.press = function (x, y) {
  const el = this.getElement(x, y);

  const inputObject = {
    x, y,
  };

  if (el.typeCallbacks.press) {
    const callbacks = el.typeCallbacks.press;
    for (let i = 0; i < callbacks.length; i += 1) {
      const callback = callbacks[i];
      callback(inputObject);
    }
  }
};


/**
 *
 * @param {UIElement} parent
 */
UIElement.prototype.setParent = function (parent) {
  // One can not be one's own parent
  if (this !== parent) {
    this.parent = parent;
  }
};


/**
 *
 * @param {number} x
 * @param {number} y
 */
UIElement.prototype.getElement = function (x, y) {
  if (this.inBounds(x, y)) {
    const selection = null;
    const children = this._children;

    if (this.layout === this.LAYOUT_DEFAULT) {
      // Check children
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        const el = child.getElement(x, y);
        if (el) {
          return el;
        }
      }
    } else if (this.layout === this.LAYOUT_CARD) {
      const child = this._cards[this.cardSelection];
      const el = child.getElement(x, y);
      if (el) {
        return el;
      }
    }

    return this;
  }

  return null;
};


/**
 *
 * @param {*} x
 * @param {*} y
 */
UIElement.prototype.inBounds = function (x, y) {
  const x1 = this.getOuterX();
  const x2 = x1 + this.getWidth();
  const y1 = this.getOuterY();
  const y2 = y1 + this.getHeight();

  const cond1 = x >= x1 && x <= x2;
  const cond2 = y >= y1 && y <= y2;

  return cond1 && cond2;
};


/**
 * @returns {UIElement}
 */
UIElement.prototype.getRoot = function () {
  let root = this;

  while (root.parent) {
    root = root.parent;
  }

  return root;
};


/**
 *
 * @param {string} color
 */
UIElement.prototype.setBackgroundColor = function (color) {
  this.backgroundColor = color;
};


/**
 *
 * @param {string} background
 */
UIElement.prototype.setBackground = function (background) {
  this.background = background;
};


/**
 *
 * @param {UIElement} child
 */
UIElement.prototype.addChild = function (child) {
  if (child === this) throw Error();

  const children = this._children;

  child.setParent(this);
  children.push(child);

  this._updateUI();
};

// ==========================
// DIMENSIONS PRIVATE METHODS
// ==========================

/**
 *
 * @param {number} width
 * @param {number} height
 */
UIElement.prototype._setRequestedDimensions = function (width, height) {
  this._requestedWidth = width;
  this._requestedHeight = height;

  if (this.parent) {
    // Ask parent for space.
    this.parent._updateUI();

    const iw = Math.min(this._requestedWidth, this._providedWidth);
    const ih = Math.min(this._requestedHeight, this._providedHeight);

    this._setIntersectedDimensions(iw, ih);
  } else {
    this._setProvidedDimensions(width, height);
    this._setIntersectedDimensions(width, height);
  }

  this._updateUI();
};


/**
 *
 * @param {number} width
 * @param {number} height
 */
UIElement.prototype._setProvidedDimensions = function (width, height) {
  this._providedWidth = width;
  this._providedHeight = height;

  const bad1 = this._requestedWidth === -1 || this._requestedHeight === -1;
  const bad2 = Number.isNaN(this._requestedWidth) || Number.isNaN(this._requestedHeight);
  const bad3 = typeof this._requestedWidth === 'undefined' || typeof this._requestedHeight === 'undefined';

  if (bad1 || bad2 || bad3) {
    this._requestedWidth = width;
    this._requestedHeight = height;
  }

  const iw = Math.min(this._requestedWidth, this._providedWidth);
  const ih = Math.min(this._requestedHeight, this._providedHeight);

  this._setIntersectedDimensions(iw, ih);
};

/**
 *
 * @param {number} width
 * @param {number} height
 */
UIElement.prototype._setIntersectedDimensions = function (width, height) {
  this._intersectedWidth = width;
  this._intersectedHeight = height;
};


// =========================
// DIMENSIONS PUBLIC METHODS
// =========================

UIElement.prototype.setDimensions = function (width, height) {
  this._setRequestedDimensions(width, height);
  this._updateUI();
};

/**
 *
 * @param {number} width
 */
UIElement.prototype.setWidth = function (width) {
  this._setRequestedDimensions(width, this.height);
  this._updateUI();
};


/**
 *
 * @param {number} height
 */
UIElement.prototype.setHeight = function (height) {
  this._setRequestedDimensions(this.width, height);
  this._updateUI();
};


/**
 *
 */
UIElement.prototype.getWidth = function () {
  return this._intersectedWidth;
};


/**
 * @returns {number}
 */
UIElement.prototype.getHeight = function () {
  return this._intersectedHeight;
};

// ========
// POSITION
// ========

/**
 *
 * @param {*} x
 * @param {*} y
 */
UIElement.prototype.setPosition = function (x, y) {
  this._x = x;
  this._y = y;
};

/**
 *
 */
UIElement.prototype.getInnerX = function () {
  return this._x;
};


/**
 *
 */
UIElement.prototype.getInnerY = function () {
  return this._y;
};


/**
 *
 */
UIElement.prototype.getOuterX = function () {
  let padX = this.parent ? this.parent.getOuterX() : 0;
  padX = padX || 0;
  return padX + this.getInnerX();
};


/**
 *
 */
UIElement.prototype.getOuterY = function () {
  let padY = this.parent ? this.parent.getOuterY() : 0;
  padY = padY || 0;
  return padY + this.getInnerY();
};

// =====================
// SPECIFIC TO MAIN LOOP
// =====================

/**
 *
 * @param {number} du
 */
UIElement.prototype.update = function (du) {
  this._updateChildren(du);
};


/**
 *
 * @param {number} du
 */
UIElement.prototype._updateChildren = function (du) {
  for (let i = 0; i < this._children.length; i += 1) {
    this._children[i].update(du);
  }
};


/**
 *
 * @param {number} ctx
 */
UIElement.prototype.render = function (ctx) {
  this._renderChildren(ctx);
};


/**
 *
 * @param {number} ctx
 */
UIElement.prototype._renderChildren = function (ctx) {
  for (let i = 0; i < this._children.length; i += 1) {
    this._children[i].render(ctx);
  }
};
