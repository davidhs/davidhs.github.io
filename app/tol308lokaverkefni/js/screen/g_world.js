'use strict';

/* global  document :true */

const g_world = (function () {
  // PRIVATE DATA

  const UNIT_PIXEL = 'px';
  const UNIT_TILE = 't';

  // Tile dimensions in pixels.
  let tileWidth = 32;
  let tileHeight = 32;

  // Width and height of map in terms of
  // pixels.
  let width = 960;
  let height = 640;

  // PUBLIC FUNCTIONS

  /**
   * Gets the width of the world in `unit' units.
   *
   * The default unit is pixels.
   *
   * @param {Number} unit
   */
  function getWidth(unit) {
    unit = unit || UNIT_PIXEL;

    if (unit === UNIT_PIXEL) {
      return width;
    } else if (unit === UNIT_TILE) {
      return width / tileWidth;
    }
    throw Error();
  }


  /**
   * Gets the height of the world in `unit' units.
   *
   * The default unit is pixels.
   *
   * @param {Number} unit
   */
  function getHeight(unit) {
    unit = unit || UNIT_PIXEL;

    if (unit === UNIT_PIXEL) {
      return height;
    } else if (unit === UNIT_TILE) {
      return height / tileHeight;
    }
    throw Error();
  }


  /**
   * Sets the width of the world to `w' in `unit' units.
   *
   * The default unit is pixels.
   *
   * @param {Number} w
   * @param {Number} unit
   */
  function setWidth(w, unit) {
    unit = unit || UNIT_PIXEL;

    if (unit === UNIT_PIXEL) {
      width = w;
    } else if (unit === UNIT_TILE) {
      width = w * tileWidth;
    } else {
      throw Error();
    }
  }


  /**
   * Sets the height of the world to `h' in `unit' units.
   *
   * The default unit is pixels.
   *
   * @param {Number} h
   * @param {Number} unit
   */
  function setHeight(h, unit) {
    unit = unit || UNIT_PIXEL;

    if (unit === UNIT_PIXEL) {
      height = h;
    } else if (unit === UNIT_TILE) {
      height = h * tileHeight;
    } else {
      throw Error();
    }
  }


  /**
   * Returns the width of a tile in pixels.
   */
  function getTileWidth() {
    return tileWidth;
  }


  /**
   * Returns the height of a tile in pixels.
   */
  function getTileHeight() {
    return tileHeight;
  }


  /**
   * Returns the size of a tile in pixels, that
   * is if the width is equal to the height, otherwise
   * it'll throw an error.
   */
  function getTileSize() {
    if (tileWidth !== tileHeight) throw Error();

    return tileWidth;
  }


  /**
   * Sets the width of a tile to `tw' pixels.
   *
   * @param {Number} tw
   */
  function setTileWidth(tw) {
    tileWidth = tw;
  }


  /**
   * Sets the width of a tile to `th' pixels.
   *
   * @param {Number} th
   */
  function setTileHeight(th) {
    tileHeight = th;
  }


  /**
   * Sets the width and height of a tile to `th' pixels.
   *
   * @param {Number} ts
   */
  function setTileSize(ts) {
    tileWidth = ts;
    tileHeight = ts;
  }


  // SOMETHING ELSE

  /**
   *
   * @param {Number} cx
   * @param {Number} cy
   * @param {Number} radius
   */
  function inBounds(cx, cy, radius) {
    const cond1 = cx > 0 && cx < width;
    const cond2 = cy > 0 && cy < height;

    return cond1 && cond2;
  }

  // EXPOSURE

  const obj = {};

  util.extendObject(obj, {
    getWidth,
    getHeight,
    setWidth,
    setHeight,

    getTileWidth,
    getTileHeight,
    getTileSize,
    setTileWidth,
    setTileHeight,
    setTileSize,

    inBounds,

    UNIT_PIXEL,
    UNIT_TILE,
  });

  return obj;
}());
