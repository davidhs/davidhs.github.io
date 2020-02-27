'use strict';

function TiledMap(cfg) {
  const map = util.xml2json(cfg.map).map;
  const tilesets = cfg.tilesets;

  // Safety
  for (let i = 0; i < tilesets.length; i += 1) {
    if (typeof tilesets[i] === 'string') {
      console.error('Should be of type TiledTileset but got a string:', tilesets[i]);
      throw Error();
    }
  }

  // Width in tiles
  const width = parseInt(map['@attributes'].width, 10);
  const height = parseInt(map['@attributes'].height, 10);

  // Width and height of map in terms of tiles.
  this.widthInTiles = width;
  this.heightInTiles = height;

  // Width and height of tiles in pixels.
  const tileWidth = parseInt(map['@attributes'].tilewidth, 10);
  const tileHeight = parseInt(map['@attributes'].tileheight, 10);

  this.tileWidth = tileWidth;
  this.tileHeight = tileHeight;

  const data2Ds = [];

  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];
  this.layers = layers;

  // BOTTOM (BACKGROUND) LAYERS
  this.isBottomLayer = {};


  // MIDDLE LAYERS (CAST SHADOWS)
  this.isMiddleLayer = {};

  // TOP LAYERS (OVERHEAD)
  this.isTopLayer = {};

  // Process layers.
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);

    // LAYER TYPE

    if (!layer.properties) {
      console.error('Need level properties!');
      console.error('Open Tiled, select a layer and add a custom attribute' +
      " level.  Set it to 0 if it's a bottom layers, 1 if it's a middle layer and 2 if it's" +
      ' a top layer.');
      throw Error();
    }

    const atr = layer.properties.property['@attributes'];
    if (atr.name === 'level') {
      const lvl = parseInt(atr.value, 10);
      if (lvl === 0) {
        this.isBottomLayer[name] = true;
      } else if (lvl === 1) {
        this.isMiddleLayer[name] = true;
      } else if (lvl === 2) {
        this.isTopLayer[name] = true;
      } else {
        throw Error('Invalid number for level.');
      }
    } else {
      throw Error('Need level information!');
    }

    const data = layers[i].data;
    const data1D = data['#text'].split(',').map(x => parseInt(x, 10));

    let row = [];
    const rows = [];

    let idx = 0;
    while (idx < data1D.length) {
      if (row.length === width) {
        rows.push(row);
        row = [];
      }
      row.push(data1D[idx]);
      idx += 1;
    }

    if (row.length !== 0) {
      rows.push(row);
      row = [];
    }

    data2Ds.push(rows);
  }

  // Process object group

  const objectGroup = map.objectgroup;

  // 1 object laye

  const objectGroupAttributes = objectGroup['@attributes'];
  // Objects

  this.objects = {};

  // console.log(objectGroup);

  for (let i = 0; i < objectGroup.object.length; i += 1) {
    const object = objectGroup.object[i];
    const objectAttributes = object['@attributes'];

    let shape = 'rectangle';

    if (object.ellipse) {
      shape = 'ellipse';
    }

    let name = objectAttributes.name;
    let type = objectAttributes.type;
    let x = parseInt(objectAttributes.x, 10);
    let y = parseInt(objectAttributes.y, 10);
    let width = parseInt(objectAttributes.width, 10);
    let height = parseInt(objectAttributes.height, 10);

    if (!name) name = 'unknownName';
    if (!type) type = 'unknownType';
    if (!x) x = 0;
    if (!y) y = 0;
    if (!width) width = 0;
    if (!height) height = 0;


    if (!this.objects[type]) this.objects[type] = [];

    const insObj = {
      shape, name, type, x, y, width, height,
    };

    if (object.property) {
      object.properties = {
        property: [object.property],
      };
    }

    if (object.properties) {
      const props = {};

      const _props = object.properties.property;

      for (let j = 0; j < _props.length; j += 1) {
        const attr = _props[j]['@attributes'];

        let name = '';
        let type = 'string';
        let value = '';

        if (attr.name) name = attr.name;
        if (attr.type) type = attr.type;
        if (attr.value) value = attr.value;

        if (type === 'int') value = parseInt(value, 10);
        if (type === 'bool') {
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
        }

        props[name] = value;
      }

      insObj.props = props;
    }

    this.objects[type].push(insObj);
  }

  this.map = map;
  this.tilesets = tilesets;
  this.data2Ds = data2Ds;
}

TiledMap.prototype._getLayerName = function (layer) {
  return layer['@attributes'].name;
};


TiledMap.prototype._renderIndexTile = function (ctx, index, x, y, w, h, cfg) {
  // BLANK?
  if (index === 0) {
    return;
  }

  // TODO: this -1 is bound to Tiled app
  let sidx = 0;
  let sgid = 1;

  const map = this.map;

  for (let z = 0; z < map.tileset.length; z += 1) {
    const gid = parseInt(map.tileset[z]['@attributes'].firstgid, 10);
    if (gid > index) {
      z = map.tileset.length;
    } else {
      sidx = z;
      sgid = gid;
    }
  }

  if (index - sgid < 0) {
    throw Error();
  }

  const tidx = index - sgid;

  const textureAtlas = this.tilesets[sidx].textureAtlas;
  const tlut = this.tilesets[sidx].tlut;


  if (cfg && cfg.occlusion) {
    const pkg = tlut[tidx];

    if (pkg) {
      textureAtlas.renderIndexTile(ctx, tidx, x, y, w, h, cfg);
    }
  } else {
    textureAtlas.renderIndexTile(ctx, tidx, x, y, w, h, cfg);
  }
};

TiledMap.prototype._render = function (ctx, index, cfg) {
  const wx1 = g_viewport.getOX();
  const wy1 = g_viewport.getOY();

  const wx2 = g_viewport.getOX() + g_viewport.getOW();
  const wy2 = g_viewport.getOY() + g_viewport.getOH();


  const tileWidth = this.tileWidth;
  const tileHeight = this.tileHeight;

  const tx1 = Math.floor(wx1 / tileWidth);
  const ty1 = Math.floor(wy1 / tileHeight);

  const tx2 = Math.floor(wx2 / tileWidth);
  const ty2 = Math.floor(wy2 / tileHeight);

  // offset
  const offx = Math.round(util.posmod(wx1, tileWidth));
  const offy = Math.round(util.posmod(wy1, tileHeight));

  const map = this.map;

  // LAYERS
  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];
  const data2D = this.data2Ds[index];

  for (let ty = ty1, i = 0; ty <= ty2; ty += 1, i += 1) {
    for (let tx = tx1, j = 0; tx <= tx2; tx += 1, j += 1) {
      if (ty >= 0 && ty < this.heightInTiles && tx >= 0 && tx < this.widthInTiles) {
        const x = -offx + j * tileWidth;
        const y = -offy + i * tileHeight;
        const w = tileWidth;
        const h = tileHeight;

        const index = data2D[ty][tx];

        this._renderIndexTile(ctx, index, x, y, w, h, cfg);
      }
    }
  }
};

TiledMap.prototype.renderBottom = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isBottomLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.renderMiddle = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isMiddleLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.renderTop = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isTopLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.render = function (ctx, cfg) {
  this.renderBottom(ctx, cfg);
  this.renderMiddle(ctx, cfg);
  this.renderTop(ctx, cfg);
};

// Ideally, only run this once.
// Only run this once!
TiledMap.prototype.addObstructions = function () {
  const map = this.map;
  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];


  const tts = spatialManager.getTileSize();


  // World width
  const ww = this.widthInTiles * this.tileWidth;
  const wh = this.heightInTiles * this.tileHeight;

  const tmw = this.tileWidth;
  const tmh = this.tileHeight;

  const smw = spatialManager.getTileSize();
  const smh = spatialManager.getTileSize();

  // TODO: Go through every pixel D:'!!

  // if (true) return;

  // Spatial manager
  const spRows = Math.ceil(ww / tts); // rows
  const spCols = Math.ceil(wh / tts); // columns

  const ITER = 0;


  // Iterate through layers

  for (let i = 0; i < layers.length; i += 1) {
    // Iterate through columns
    const data2D = this.data2Ds[i];
    for (let j = 0; j < this.heightInTiles; j += 1) {
      for (let k = 0; k < this.widthInTiles; k += 1) {
        const tx = k;
        const ty = j;

        const index = data2D[ty][tx];

        if (index !== 0) {
          let sidx = 0;
          // let sidx = -1;
          let sgid = 1;

          for (let z = 0; z < map.tileset.length; z += 1) {
            const gid = parseInt(map.tileset[z]['@attributes'].firstgid, 10);
            if (gid > index) {
              z = map.tileset.length;
            } else {
              sidx = z;
              sgid = gid;
            }
          }

          if (index - sgid < 0) {
            throw Error();
          }

          const tidx = index - sgid;

          // console.log(this.tilesets, sidx);

          const tlut = this.tilesets[sidx].tlut;


          if (tlut[tidx]) {
            if (tlut[tidx].name === 'collision' && tlut[tidx].value) {
              // spatialManager.debug.registerTile(spatialManager.WALL_ID, tx, ty);
              spatialManager.registerTile(spatialManager.WALL_ID, tx, ty);
            }
          }
        }
      }
    }
  }


  // Force recompute
  spatialManager.forceRecompute();
};
