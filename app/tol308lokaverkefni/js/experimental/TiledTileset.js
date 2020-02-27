'use strict';

function TiledTileset(cfg) {
  this.cfg = util.xml2json(cfg.cfg).tileset;
  this.textureAtlas = cfg.textureAtlas;

  this.tilewidth = parseInt(this.cfg['@attributes'].tilewidth, 10);
  this.tileheight = parseInt(this.cfg['@attributes'].tileheight, 10);
  this.tilecount = parseInt(this.cfg['@attributes'].tilecount, 10);
  this.columns = parseInt(this.cfg['@attributes'].columns, 10);

  // Process tiles

  const tlut = [];

  const tiles = this.cfg.tile;


  if (tiles) {
    for (let i = 0; i < tiles.length; i += 1) {
      const tile = tiles[i];
      const id = parseInt(tile['@attributes'].id, 10);


      if (tile.objectgroup) {
        if (tile.objectgroup.property || tile.objectgroup.properties) {
          let properties;
          if (tile.objectgroup.property) {
            properties = tile.objectgroup.property;
          } else if (tile.objectgroup.properties) {
            properties = tile.objectgroup.properties;
          }

          // So stupid...
          properties = properties.property;


          for (let j = 0; j < properties.length; j += 1) {
            const property = properties[j];
            const name = property['@attributes'].name;
            const type = property['@attributes'].type;
            const value = property['@attributes'].value;

            let val;

            if (type === 'bool') {
              if (value === 'true') val = true;
              else if (value === 'false') val = false;
            } else {
              val = value;
            }

            tlut[id] = {
              name,
              type,
              value: val,
            };
          }
        }
      }
    }
  }

  this.tlut = tlut;
}
