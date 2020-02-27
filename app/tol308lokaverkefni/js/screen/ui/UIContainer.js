'use strict';

function UIContainer() {
  this._setup(this);
}

// UIContainer.prototype = new UIElement();

UIContainer.prototype = Object.create(UIElement.prototype);


UIContainer.prototype.render = function (ctx) {
  const oldfillStyle = ctx.fillStyle;

  const x = this.getOuterX();
  const y = this.getOuterY();
  const w = this.getWidth();
  const h = this.getHeight();

  const backgroundColor = this.backgroundColor;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y, w, h);
  ctx.fill();
  ctx.fillStyle = oldfillStyle;

  if (this.background) {
    // Stretch to fill screen
    ctx.drawImage(this.background, 0, 0, this.background.width, this.background.height, 0, 0, w, h);
  }

  this._renderChildren(ctx);
};

UIContainer.prototype.addChild = function (child) {
  if (child === this) throw Error();

  child.setParent(this);
  this._children.push(child);

  this._updateUI();
};
