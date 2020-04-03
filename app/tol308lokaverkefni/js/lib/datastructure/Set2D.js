'use strict';

function Set2D() {
  this._arr = [];
}

Set2D.prototype.clear = function () {
  this._arr.splice(0);
};

Set2D.prototype.has = function (x, y) {
  if (!this._arr[x]) return false;

  return typeof this._arr[x][y] !== 'undefined';
};

Set2D.prototype.get = function (x, y) {
  if (!this._arr[x]) return false;

  return this._arr[x][y];
};

Set2D.prototype.set = function (x, y, value) {
  value = value || true;
  if (!this._arr[x]) this._arr[x] = [];
  this._arr[x][y] = value;
};
