'use strict';

/**
 *
 * @param {number} width
 * @param {number} height
 */
function Grid(width, height) {
  this._stuff = {};


  this.width = width;
  this.height = height;


  const grid = [];
  for (let i = 0; i < this.height; i += 1) {
    const row = [];
    for (let j = 0; j < this.width; j += 1) {
      const obj = {
        ids: new QuickList(),
        count: 0,
      };
      row.push(obj);
    }
    grid.push(row);
  }
  this._grid = grid;

  this._lastX = -1;
  this._lastY = -1;

  this._x = 0;
  this._y = 0;

  this._firstTime = true;
  this._callbacks = [];


  this._elapsedTime = 0;

  const self = this;


  this._carver = new Worker('js/lib/carver.js');
  this._carver.onmessage = (evt) => {
    self.mailbox(evt);
  };
  this._carver.postMessage(['init', width, height]);
}


/**
 *
 * @param {*} du
 */
Grid.prototype.update = function (du, force) {
  this._elapsedTime += du;

  if (this._elapsedTime < 10) return;

  this._elapsedTime = 0;

  if (this._lastX === this._x && this._lastY === this._y) return;

  this._update();
};


Grid.prototype._update = function () {
  this._carver.postMessage(['carve', this._x, this._y]);

  this._lastX = this._x;
  this._lastY = this._y;
};


/**
 *
 * @param {*} callbacks
 */
Grid.prototype.onready = function (callbacks) {
  this._callbacks.push(callbacks);
};


/**
 *
 * @param {*} evt
 */
Grid.prototype.mailbox = function (evt) {
  const data = evt.data;

  if (this._firstTime) {
    this._firstTime = false;
    for (let i = 0; i < this._callbacks.length; i += 1) {
      this._callbacks[i]();
    }
    this._callbacks = [];
  }

  if (data[0] === 'grid') {
    this._stuff.data = data[1];
  }
};


/**
 *
 * @param {*} x
 * @param {*} y
 * @param {*} value
 */
Grid.prototype.set = function (x, y, value) {
  if (x < 0 || x >= this.width) throw Error();
  if (y < 0 || y >= this.height) throw Error();
  this._grid[y][x] = value;
};

Grid.prototype.forceRecompute = function () {
  this._update();
};


/**
 *
 * @param {*} x
 * @param {*} y
 */
Grid.prototype.get = function (x, y) {
  if (x < 0 || x >= this.width) throw Error();
  if (y < 0 || y >= this.height) throw Error();
  return this._grid[y][x];
};

// Collision info
Grid.prototype.getCI = function (x, y) {
  if (x < 0 || x >= this.width) throw Error();
  if (y < 0 || y >= this.height) throw Error();

  if (!this._stuff.data) return null;

  const idx = 2 * (x + this.width * y);

  const xV = this._stuff.data[idx];
  const yV = this._stuff.data[idx + 1];

  return { x: xV, y: yV };
};

Grid.prototype.addObstruction = function (x, y) {
  this._carver.postMessage(['obstruction', x, y]);
};


// Carve shortest path from x to y
Grid.prototype.setSource = function (x, y) {
  this._x = x;
  this._y = y;

  if (this._firstTime) {
    this._lastX = this._x;
    this._lastY = this._y;
    this._update();
  }
};
