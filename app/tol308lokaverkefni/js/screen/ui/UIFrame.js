'use strict';

function UIFrame(obj) {
  this._setup(this);
  this.setPosition(0, 0);

  let w = 0;
  let h = 0;


  if (obj && obj.width && obj.height) {
    w = obj.width;
    h = obj.height;
  }

  this._setRequestedDimensions(w, h);
  this._setProvidedDimensions(w, h);

  this._cards = [];
}

UIFrame.prototype = Object.create(UIElement.prototype);

// UIFrame.prototype = new UIElement();

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 */
UIFrame.prototype.render = function (ctx) {
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


  if (this.layout === this.LAYOUT_DEFAULT) {
    this._renderChildren(ctx);
  } else if (this.layout === this.LAYOUT_CARD) {
    this._cards[this.cardSelection].render(ctx);
  }
};

UIFrame.prototype.addChild = function (child, cardID) {
  if (child === this) throw Error();
  child.setParent(this);
  this._children.push(child);

  if (this.layout === this.LAYOUT_DEFAULT) {
    // FILLER COMMENT
  } else if (this.layout === this.LAYOUT_CARD) {
    this._cards[cardID] = child;
  }

  this._updateUI();
};


UIFrame.prototype.selectCard = function (card) {
  this.cardSelection = card;
};
