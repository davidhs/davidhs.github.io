'use strict';

function Sequence(cfg) {
  this.sequence = cfg.textureAtlas.getSequence({
    all: cfg.all,
    primaryDirection: cfg.primaryDirection,
    secondaryDirection: cfg.secondaryDirection,
  });
}
