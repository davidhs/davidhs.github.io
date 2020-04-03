'use strict';

function UIList() {
  this._setup(this);
}

// UIList.prototype = new UIElement();

UIList.prototype = Object.create(UIElement.prototype);


UIList.prototype._updateUI = function () {
  const children = this._children;

  const n = children.length;

  const allotedHeight = n === 0 ? this.getHeight() : this.getHeight() / n;

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    child.setPosition(this._x, this._y + allotedHeight * i);
    child._setProvidedDimensions(this.getWidth(), allotedHeight);
    child._updateUI();
  }
};
