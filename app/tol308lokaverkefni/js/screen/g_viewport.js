'use strict';

/* global g_world :true */


const g_viewport = (function () {
  // PRIVATE DATA

  const innerX = 0;
  const innerY = 0;

  let innerWidth = 0;
  let innerHeight = 0;

  let outerX = 0;
  let outerY = 0;

  let outerWidth = 0;
  let outerHeight = 0;

  let stuckToWorld = false;

  // PRIVATE FUNCTIONS

  function _ensureInWorld() {
    const ww = g_world.getWidth();
    const wh = g_world.getHeight();

    if (outerX < 0) outerX = 0;
    if (outerY < 0) outerY = 0;
    if ((outerX + outerWidth) > ww) outerX = ww - outerWidth;
    if ((outerY + outerHeight) > wh) outerY = wh - outerHeight;
  }

  // PUBLIC FUNCTIONS

  /**
   * Get inner width of viewport.
   */
  function getIW() {
    return innerWidth;
  }


  /**
   * Get inner height of viewport.
   */
  function getIH() {
    return innerHeight;
  }


  /**
   * Set inner width of viewport.
   *
   * @param {Number} iw
   */
  function setIW(iw) {
    innerWidth = iw;
  }


  /**
   * Set inner height of viewport.
   *
   * @param {Number} ih
   */
  function setIH(ih) {
    innerHeight = ih;
  }


  /**
   * Get outer width.
   */
  function getOW() {
    return outerWidth;
  }


  /**
   * Get outer height.
   */
  function getOH() {
    return outerHeight;
  }


  /**
   * Set outer width of viewport.
   *
   * @param {Number} ow
   */
  function setOW(ow) {
    outerWidth = ow;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Set outer height of viewport.
   *
   * @param {Number} oh
   */
  function setOH(oh) {
    outerHeight = oh;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Get outer X.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   */
  function getOX() {
    return outerX;
  }


  /**
   * Get outer Y.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   */
  function getOY() {
    return outerY;
  }


  /**
   * Set outer X.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   *
   * @param {Number} ox
   */
  function setOX(ox) {
    outerX = ox;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Set outer Y.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   *
   * @param {Number} oy
   */
  function setOY(oy) {
    outerY = oy;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Get outer center X, i.e. the middle of the viewport's
   * rectangle in world space.
   */
  function getOCX() {
    return outerX + outerWidth / 2;
  }


  /**
   * Get outer center Y, i.e. the middle of the viewport's
   * rectangle in world space.
   */
  function getOCY() {
    return outerY + outerHeight / 2;
  }


  /**
   * Set outer center X, i.e. the middle of the viewport's
   * rectangle in world space.
   *
   * @param {Number} ocx
   */
  function setOCX(ocx) {
    outerX = ocx - outerWidth / 2;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Set outer center Y, i.e. the middle of the viewport's
   * rectangle in world space.
   *
   * @param {Number} ocy
   */
  function setOCY(ocy) {
    outerY = ocy - outerHeight / 2;
    if (stuckToWorld) _ensureInWorld();
  }


  /**
   * Map X from viewport's (inner) coordinate system to
   * to world's (outer) coordinate system.
   *
   * @param {Number} ix
   */
  function mapI2OX(ix) {
    return outerX + ix * (outerWidth / innerWidth);
  }


  /**
   * Map Y from viewport's (inner) coordinate system to
   * the world's (outer) coordinate system.
   *
   * @param {Number} iy
   */
  function mapI2OY(iy) {
    return outerY + iy * (outerHeight / innerHeight);
  }


  /**
   * Map X from world's (outer) coordinate system to
   * viewport's (inner) coordinate system.
   *
   * @param {Number} ox
   */
  function mapO2IX(ox) {
    return (ox - outerX) * (innerWidth / outerWidth);
  }


  /**
   * Map Y from world's (outer) coordinate system to
   * viewport's (inner) coordinate system.
   *
   * @param {Number} oy
   */
  function mapO2IY(oy) {
    // return (oy - outerY) * (innerHeight / innerWidth);
    return (oy - outerY);
  }

  function inOuterBoundsPoint(wcx, wcy) {
    const c1 = wcx >= getOX() && wcx <= getOX() + getOW();
    const c2 = wcy >= getOY() && wcy <= getOY() + getOH();
    return c1 && c2;
  }

  function inOuterRectangleBounds(wx, wy, ww, wh) {
    const ax1 = getOX();
    const ax2 = getOX() + getOW();

    const ay1 = getOY();
    const ay2 = getOY() + getOH();

    const x1 = wx;
    const x2 = wx + ww;

    const y1 = wy;
    const y2 = wy + wh;

    const c1 = util.isIntervalIntersection(x1, x2, ax1, ax2);
    const c2 = util.isIntervalIntersection(y1, y2, ay1, ay2);

    return c1 && c2;
  }

  function inOuterSquareCircle(wcx, wcy, wr) {
    return inOuterRectangleBounds(wcx - wr, wcy - wr, 2 * wr, 2 * wr);
  }

  function inOuterCircleBounds(wcx, wcy, wr) {
    return inOuterSquareCircle(wcx, wcy, wr);
  }

  function inInnerBoundsPoint(x, y, padX, padY) {
    const c1 = x >= innerX - padX && x <= innerX + innerWidth + padY;
    const c2 = y >= innerY - padX && y <= innerY + innerHeight + padY;
    return c1 && c2;
  }

  function stickToWorld(flag) {
    stuckToWorld = flag;
    if (stuckToWorld) _ensureInWorld();
  }

  // EXPOSURE

  const obj = {};

  util.extendObject(obj, {
    getIW,
    getIH,
    setIW,
    setIH,
    getOW,
    getOH,
    setOW,
    setOH,


    getOX,
    getOY,
    setOX,
    setOY,

    getOCX,
    getOCY,
    setOCX,
    setOCY,

    mapI2OX,
    mapI2OY,
    mapO2IX,
    mapO2IY,

    inInnerBoundsPoint,

    inOuterBoundsPoint,
    inOuterSquareCircle,
    inOuterCircleBounds,
    inOuterRectangleBounds,

    stickToWorld,
  });

  return obj;
}());
