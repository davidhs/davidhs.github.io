// Web worker!
importScripts('datastructure/PriorityQueue.js');


const go = {
  grid: [],
  width: 0,
  height: 0,
};


const last_sx = -1;
const last_sy = -1;
let initialized = false;


const TPL = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];


const SQRT_2 = Math.sqrt(2);


let flatData = [];


function init(w, h) {
  initialized = true;

  width = w;
  height = h;

  go.width = w;
  go.height = h;

  grid = [];
  for (let i = 0; i < this.height; i += 1) {
    const row = [];
    for (let j = 0; j < this.width; j += 1) {
      const obj = {
        score: Number.POSITIVE_INFINITY,
        parent: { x: 0, y: 0 },
        x: j,
        y: i,
        obstruction: false,
      };
      row.push(obj);
    }
    grid.push(row);
  }

  go.grid = grid;
}

function _get(x, y) {
  if (x < 0 || x >= width) return false;
  if (y < 0 || y >= height) return false;
  return go.grid[y][x];
}

function get(x, y) {
  if (x < 0 || x >= width) throw Error();
  if (y < 0 || y >= height) throw Error();
  return go.grid[y][x];
}

// Max square for tile at (x, y)
function msq(x, y) {
  let ok = true;

  let maxSquare = 0;

  while (ok) {
    const middleX = maxSquare + x;
    const middleY = maxSquare + y;

    const middleNode = _get(middleX, middleY);

    if (!middleNode) {
      ok = false;
      break;
    }

    if (middleNode.obstruction) {
      ok = false;
      break;
    }

    // Bottom "arm"

    const bay = middleY;
    const bax1 = x;
    const bax2 = middleX;

    for (let bax = bax1; bax < bax2; bax += 1) {
      const baxNode = _get(bax, bay);

      if (!baxNode) {
        ok = false;
        break;
      }

      if (baxNode.obstruction) {
        ok = false;
        break;
      }
    }


    // Right "arm"

    const rax = middleX;
    const ray1 = y;
    const ray2 = middleY;

    for (let ray = ray1; ray < ray2; ray += 1) {
      const rayNode = _get(rax, ray);

      if (!rayNode) {
        ok = false;
        break;
      }

      if (rayNode.obstruction) {
        ok = false;
        break;
      }
    }

    if (ok) {
      maxSquare += 1;

      if (maxSquare >= 3) {
        ok = false;
        break;
      }
    }
  }


  const cNode = _get(x, y);

  if (cNode) {
    cNode.msq = maxSquare;
  }
}


function updateGrid() {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < height; x += 1) {
      msq(x, y);
    }
  }
}


function carveShortestPath(sx, sy) {
  if (!initialized) return false;
  if (sx < 0 || sx >= width) return false;
  if (sy < 0 || sy >= height) return false;


  if (sx === last_sx && sy === last_sy) return false;

  const sNode = this.get(sx, sy);


  const Q = new PriorityQueue({
    check: false,
    type: PriorityQueue.TYPE_MIN_PQ,
  });

  const w = width;
  const h = height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x === sx && y === sy) continue;
      const node = get(x, y);
      node.score = Number.POSITIVE_INFINITY;
      node.parent.x = 0;
      node.parent.y = 0;
      Q.add(node.score, x + y * w);
    }
  }

  sNode.score = 0;
  sNode.parent.x = 0;
  sNode.parent.y = 0;

  Q.add(sNode.score, sx + sy * w);

  while (!Q.isEmpty()) {
    const idx = Q.remove();

    const _x = idx % w;
    const _y = (idx - _x) / w;

    const cNode = this.get(_x, _y);

    const cx = cNode.x;
    const cy = cNode.y;

    // Check neighbours
    for (let i = 0; i < TPL.length; i += 1) {
      const ox = TPL[i][0];
      const oy = TPL[i][1];

      const nx = cx + ox;
      const ny = cy + oy;

      if (nx < 0 || nx >= this.width) continue;
      if (ny < 0 || ny >= this.height) continue;
      if (nx === cx && ny === cy) continue;

      const nNode = get(nx, ny);

      if (nNode.obstruction) {
        continue;
      }

      if (nNode.msq < 2) {
        nNode.parent.x = 0;
        nNode.parent.y = 0;
        continue;
      }


      const dist = this._hce(cx, cy, nx, ny);

      const newScore = cNode.score + dist;

      if (newScore >= nNode.score) continue;

      nNode.score = newScore;

      nNode.parent.x = -ox;
      nNode.parent.y = -oy;

      Q.changePriority(nx + ny * w, newScore);
    }
  }


  return false;
}

function _hce(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  const max = Math.max(dx, dy);
  const min = Math.min(dx, dy);


  const dist = SQRT_2 * min + (max - min);

  return dist;
}

// Receive message
onmessage = (evt) => {
  const data = evt.data;


  if (data[0] === 'init') {
    const w = data[1];
    const h = data[2];

    if (typeof w !== 'undefined' && typeof h !== 'undefined') {
      init(w, h);
    }

    flatData = [];
    let idx = 0;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        flatData[idx] = 0;
        flatData[idx + 1] = 0;
        idx += 2;
      }
    }
  } else if (data[0] === 'carve') {
    carveShortestPath(data[1], data[2]);

    flatData = [];
    let idx = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        flatData[idx] = 0 + grid[y][x].parent.x;
        flatData[idx + 1] = 0 + grid[y][x].parent.y;

        idx += 2;
      }
    }

    postMessage(['grid', flatData]);
  } else if (data[0] === 'obstruction') {
    const x = data[1];
    const y = data[2];

    const node = get(x, y);

    node.obstruction = true;
    node.parent.x = 0;
    node.parent.y = 0;

    updateGrid();
  }


  // Send message
  postMessage('hi');
};
