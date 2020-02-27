'use strict';

function UIButton(text) {
  this._setup(this);


  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  this._canvas = canvas;
  this._ctx = ctx;

  this._text = text || '';
  this._fontSize = 60;
  this._fontType = 'umbrageregular';
}

// UIButton.prototype = new UIElement();

UIButton.prototype = Object.create(UIElement.prototype);

UIButton.prototype.borderColor = '#666';
UIButton.prototype.foregroundColor = '#111';
UIButton.prototype.backgroundColor = '#ddd';

UIButton.prototype.verticalAlignment = 'center';
UIButton.prototype.horizontalAlignment = 'center';

UIButton.prototype._updateUI = function () {
  const w = this.getWidth();
  const h = this.getHeight();

  const canvas = this._canvas;

  canvas.width = w;
  canvas.height = h;

  const ctx = this._ctx;

  // Alias
  const text = this._text;


  // Measure text
  const fontStyle = `${this._fontSize}px ${this._fontType}`;

  const tw = this._getTextWidth(fontStyle, text);
  const res = this._getFontHeight(fontStyle);

  // const th = this._fontSize;
  const th = res.height;
  

  const topPadding = res.top;

  const rectW = tw;
  const rectH = th + 2 * topPadding;

  const padX = (w - rectW) / 2;
  const padY = (h - rectH) / 2;


  const aX = padX;
  const aY = padY;
  const aW = rectW;
  const aH = rectH;

  // ctx.textBaseline = 'top';
  ctx.fillStyle = this.backgroundColor;
  ctx.strokeStyle = this.borderColor;
  // ctx.fillRect(aX, aY, aW, aH);
  ctx.fillRect(aX, aY, aW, aH);
  ctx.rect(aX, aY, aW, aH);
  ctx.stroke();

  ctx.fillStyle = this.foregroundColor;
  ctx.font = fontStyle;
  ctx.fillText(text, aX, aY + th + topPadding);
};

UIButton.prototype.render = function (ctx) {
  const x = this.getOuterX();
  const y = this.getOuterY();
  const w = this.getWidth();
  const h = this.getHeight();

  ctx.drawImage(this._canvas, x, y, w, h);
};
