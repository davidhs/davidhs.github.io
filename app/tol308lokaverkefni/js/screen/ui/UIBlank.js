'use strict';

function UIBlank() {}

UIBlank.prototype = Object.create(UIElement.prototype);


UIBlank.prototype._updateUI = function () {};

UIBlank.prototype._renderChildren = function () {};

UIBlank.prototype.getElement = function (x, y) {
  return null;
};

UIBlank.prototype.press = function (x, y) {};
