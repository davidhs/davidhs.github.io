// 'use strict';

/* global util document g_viewport g_asset :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


/**
 * Spatial manager
 * ===============
 * A module which handles spatial lookup, used for general collision
 * detection.
 * ---------------
 * It's very important to consider the tile size `tileSize' beforehand --
 * enable to change tile size -- because it can drastically affect
 * performance.  If the scene is huge and there are a lot of objects
 * spread around, you should conside using a larget tile size.
 * ----------------
 * Registering and unregistering is a rather slow process.  It's used
 * for spatial lookup.  It only indicates potential collisions.  It's
 * up to the entities themselves to resolve the collisions themselves.
 */
const spatialManager = (function () {
  // PRIVATE DATA

  const DEBUG = false;

  // SPATIAL ID TYPES
  const NO_CONFLICT = 0;
  const POTENTIAL_CONFLICT = 1;
  const OUT_OF_BOUNDS = 2;
  const WALL_ID = 3;

  // Lorem ipsum.
  const MIN_ENTITY = 30;
  const entities = [];

  const _removedEntities = [];

  const _registered = [];

  // Tiles (grid)
  // Grid should also contain path
  // finding info.
  // const tiles = [];
  // const tiles = new Grid();
  let tiles = null;

  // TODO: tile size should match
  const tileSize = 32;

  let nextSpatialID = MIN_ENTITY; // make all valid IDs non-falsey (i.e. don't start at 0)

  // PRIVATE METHODS


  // Gets column (x-coordinate) of grid.
  function _getX(x) {
    return Math.max(Math.floor(x / tileSize), 0);
  }


  // Gets row (y-coordinate) of grid.
  function _getY(y) {
    return Math.max(Math.floor(y / tileSize), 0);
  }


  function _inBounds(tx, ty) {
    if (tx < 0 || tx >= tiles.width) {
      return false;
    }

    if (ty < 0 || ty >= tiles.height) {
      return false;
    }

    return true;
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.  Potential collision.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _registerTile(id, x, y) {
    if (!_inBounds(x, y)) return OUT_OF_BOUNDS;

    const obj = tiles.get(x, y);

    const result = obj.ids.add(id);

    if (result) {
      obj.count += 1;
      if (id === WALL_ID) {
        obj.obstruction = true;
        tiles.addObstruction(x, y);
      }
    }

    return obj.count > 1 ? POTENTIAL_CONFLICT : NO_CONFLICT;
  }


  function registerTile(id, x, y) {
    _registerTile(id, x, y);
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _unregisterTile(id, x, y) {
    if (!_inBounds(x, y)) return 0;

    const obj = tiles.get(x, y);

    const result = obj.ids.remove(id);

    if (result) {
      obj.count -= 1;
      return 1;
    }

    return 0;
  }


  /**
   * Checks whether spatial ids intersect
   *
   */
  function _isIntersection(sid1, sid2) {
    const e1 = entities[sid1];
    const e2 = entities[sid2];

    const x1 = e1.cx;
    const y1 = e1.cy;
    const r1 = e1.radius * 0.5;

    const x2 = e2.cx;
    const y2 = e2.cy;
    const r2 = e2.radius * 0.5;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const sr = r1 + r2;

    return (dx * dx + dy * dy) <= (sr * sr);
  }

  /**
   * Precondition:
   *
   *  [id] is a valid spatial ID, e.g. it's not outdated.
   *  [x, y] are valid coordinates for a tile in tiles.
   *
   * Postcondition:
   *
   *  Tells the caller whether there is an actual conflict
   *  at this tile, e.g. things are colliding or an entity
   *  is bumping against a wall.
   *
   * @param {number} id
   * @param {number} x
   * @param {number} y
   */
  function _resolveConflict(id, x, y) {
    if (!_inBounds(x, y)) throw Error();

    const tile = tiles.get(x, y);

    // List of spatial IDs registered in tile.
    const l = tile.ids.getList();

    // How many spatial IDs to check.
    const n = tile.ids.getSize();

    let conflictStatus = NO_CONFLICT;

    for (let i = 0; i < n; i += 1) {
      // Spatial ID.
      const bid = parseInt(l[i], 10);

      // Ignore if comparing with itself.
      if (bid === id) continue;

      // Always collide with wall.
      if (bid === WALL_ID) {
        conflictStatus = WALL_ID;
        break;
      }

      // Checks for intersection.
      if (_isIntersection(id, bid)) {
        conflictStatus = bid;
      }
    }

    return conflictStatus;
  }

  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * NOTE: make sure x1 <= x2 and y1 <= y2.
   *
   * TODO: needs to handle force
   *
   * @param {Number} id
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   */
  function _registerRect(id, force, x1, y1, x2, y2) {
    // Attempt to register all tiles in bounding box.
    for (let y = y1; y <= y2; y += 1) {
      for (let x = x1; x <= x2; x += 1) {
        // Registration of tile.
        const result = _registerTile(id, x, y);

        // Conflict resolution.
        if (result === POTENTIAL_CONFLICT) {
          // Resolve conflict
          const resStat = _resolveConflict(id, x, y);

          // If conflict resolution failed (i.e. collision)
          // return info about it to the entity that is
          // trying to register.
          if (!force && resStat !== NO_CONFLICT) {
            return resStat;
          }
        }
      }
    }

    return NO_CONFLICT;
  }

  function update(du) {
    const player = entityManager.getPlayer();
    const sx = _getX(player.cx);
    const sy = _getY(player.cy);

    tiles.setSource(sx, sy);

    tiles.update(du);
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * NOTE: make sure x1 <= x2 and y1 <= y2.
   *
   * @param {Number} id
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   */
  function _unregisterRect(id, x1, y1, x2, y2) {
    let count = 0;

    for (let x = x1; x <= x2; x += 1) {
      for (let y = y1; y <= y2; y += 1) {
        count += _unregisterTile(id, x, y);
      }
    }

    return count;
  }


  // ==============
  // PUBLIC METHODS
  // ==============

  function getNewSpatialID() {
    const id = nextSpatialID;
    nextSpatialID += 1;

    return id;
  }


  function _unregister(spatialID, cx, cy, radius) {
    const x1 = _getX(cx - radius);
    const y1 = _getY(cy - radius);

    const x2 = _getX(cx + radius);
    const y2 = _getY(cy + radius);


    const count = _unregisterRect(spatialID, x1, y1, x2, y2);

    // tile.ids.getList();

    if (DEBUG) {
      if (DEBUG) console.log(`Clearing... ${spatialID}`);
      for (let y = 0; y < tiles.height; y += 1) {
        for (let x = 0; x < tiles.width; x += 1) {
          const tile = tiles.get(x, y);
          const ids = tile.ids;
          if (ids.has(spatialID)) {
            console.error(x, y, spatialID, cx, cy, radius, count, entities[spatialID]);
            throw Error();
          }
        }
      }
    }

    delete entities[spatialID];
  }

  function isRegistered(entity) {
    const spatialID = entity.getSpatialID();
    if (_registered[spatialID]) return true;
    return false;
  }

  /**
    *
    * @param {Entity} entity
    * @param {boolean} force if true don't unregiser on failure
    */
  function unregister(entity) {
    if (!isRegistered(entity)) {
      // throw Error();
      return;
    }

    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();


    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    _unregister(spatialID, cx, cy, radius);

    _registered[spatialID] = false;
  }

  function _register(spatialID, force, cx, cy, radius) {
    // Compute bounding box.
    const x1 = _getX(cx - radius);
    const y1 = _getY(cy - radius);

    const x2 = _getX(cx + radius);
    const y2 = _getY(cy + radius);

    const ent = {
      cx, cy, radius,
    };

    entities[spatialID] = ent;

    const result = _registerRect(spatialID, force, x1, y1, x2, y2);

    if (result !== 0 && result !== 3) {
      if (DEBUG) console.log(`Result: ${result}`);
    }


    if (result !== NO_CONFLICT) {
      _unregister(spatialID, cx, cy, radius);
    }

    return result;
  }


  /**
   * Registers entity.
   *
   * If the registration fails this function will do a proper cleanup.
   *
   * If two entities might collider then the spatial manager will
   * decide on it.
   *
   * @param {Entity} entity
   * @param {boolean} force if true don't unregister
   */
  function register(entity, force) {
    // Get position, radius and spatial ID from entity.
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();


    if (_registered[spatialID]) {
      console.error('This entity is already registered!');
      console.error(entity, force);
      throw Error();
    }

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    const result = _register(spatialID, force, cx, cy, radius);

    if (result === NO_CONFLICT) {
      entities[spatialID].entity = entity;
      _registered[spatialID] = true;
    }

    return result;
  }

  function forceRecompute() {
    tiles.forceRecompute();
  }


  /**
   * Some entity with upper left position (x, y) requests
   * directions from where it stands to that of the player.
   *
   * @param {number} x
   * @param {number} y
   * @returns {x: number, y: number}
   */
  function getDirection(x, y) {
    const tx = _getX(x);
    const ty = _getY(y);


    return tiles.getCI(tx, ty);
  }


  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  function render(ctx) {
    const oldStyle = ctx.strokeStyle;

    const dx = g_viewport.getOX();
    const dy = g_viewport.getOY();

    // NNEEDZ optimization

    // Render collision grid
    for (let ty = 0; ty < tiles.height; ty += 1) {
      for (let tx = 0; tx < tiles.width; tx += 1) {
        const obj = tiles.get(tx, ty);
        const ci = tiles.getCI(tx, ty);

        if (typeof ci === 'undefined') continue;

        const count = obj.count;

        const x = tx * tileSize;
        const y = ty * tileSize;

        if (g_viewport.inOuterRectangleBounds(x, y, tileSize, tileSize)) {
          const mahx = ci.x;
          const mahy = ci.y;

          const x1 = x + tileSize / 2;
          const y1 = y + tileSize / 2;
          const x2 = x1 + tileSize * mahx / 2;
          const y2 = y1 + tileSize * mahy / 2;
          if (obj.stamp === tiles._stamp) {
            ctx.strokeStyle = 'orange';
          } else {
            ctx.strokeStyle = 'blue';
          }

          if (!(mahx === 0 && mahy === 0)) {
            util.strokeCircle(ctx, x1 - dx, y1 - dy, 5);
            ctx.beginPath();
            ctx.moveTo(x1 - dx, y1 - dy);
            ctx.lineTo(x2 - dx, y2 - dy);
            ctx.stroke();
          }
        }

        // Draw direction

        if (count <= 0) continue;

        const idsList = obj.ids.getList();

        for (let k = 0; k < obj.ids.getSize(); k += 1) {
          const id = idsList[k];


          if (id >= MIN_ENTITY) {
            ctx.strokeStyle = 'violet';
          } else {
            ctx.strokeStyle = 'green';
          }

          if (g_viewport.inOuterRectangleBounds(x, y, tileSize, tileSize)) {
            util.strokeRect(ctx, x - dx, y - dy, tileSize, tileSize);
          }
        }
      }
    }

    ctx.strokeStyle = 'red';
    // Render boundary "boxes".
    for (let j = 0, keys2 = Object.keys(entities); j < keys2.length; j += 1) {
      const ID = keys2[j];
      const e = entities[ID];
      const radius = (typeof e.radius !== 'undefined') ? e.radius : e.getRadius();

      if (g_viewport.inOuterSquareCircle(e.cx, e.cy, radius)) {
        util.strokeCircle(ctx, e.cx - dx, e.cy - dy, e.radius);
      }
    }
    ctx.strokeStyle = oldStyle;
  }


  /**
   *
   * @param {number} width
   * @param {number} height
   */
  function init(width, height) {
    tiles = new Grid(width / tileSize, height / tileSize);

    // Set portals.

    if (g_tm && g_tm.objects) {
      const portalSource = g_tm.objects.portalSource;
      const portalTarget = g_tm.objects.portalTarget;
    }
  }


  /**
   * Once the Web Worker for the `tiles' has finished
   * @param {function} callback
   */
  function onready(callback) {
    tiles.onready(callback);
  }

  function getEntity(spatialID) {
    return entities[spatialID].entity;
  }


  // EXPOSURE

  return {
    getNewSpatialID,
    onready,
    render,
    // getWallOcclusionMap,
    init,
    getTileSize: () => tileSize,

    update,
    isRegistered,

    getEntity,

    getDirection,

    registerTile,
    register,
    unregister,

    forceRecompute,

    MIN_ENTITY,
    WALL_ID,
    NO_CONFLICT,
  };
})();
