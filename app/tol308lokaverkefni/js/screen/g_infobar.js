'use strict';

/* global g_viewport document :true */

const g_infobar = (function () {
  const infobar = {};

  infobar.sx = g_viewport.getX + g_viewport.getWidth / 4;
  infobar.sy = g_viewport.getY;
  infobar.sWidth = g_viewport.getwidth / 2;
  infobar.sHeight = 100;

  infobar.canvas = document.createElement('canvas');
  infobar.canvas.width = infobar.sWidth;
  infobar.canvas.height = infobar.sHeight;
  infobar.ctx = infobar.canvas.getContext('2d');
  infobar.ctx.beginPath();
  infobar.ctx.lineWidth = '6';
  infobar.ctx.strokeStyle = 'red';
  infobar.ctx.rect(infobar.sx, infobar.sy, infobar.sWidth, infobar.sHeight);
  infobar.ctx.fill();
  console.log('pepp');

  infobar.getWidth = function () {
    return infobar.width;
  };

  infobar.getHeight = function () {
    return infobar.height;
  };

  return infobar;
}());
