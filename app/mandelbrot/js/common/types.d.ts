export type Region = {
  x: number;
  y: number;

  w: number;
  h: number;
}

// Rename this to objective
export type Config = {
  id: number, // work id

  cw: number, // canvas width
  ch: number, // canvas height
  
  re: number,
  im: number,

  z: number, // zoom

  max_iter: number,
};

export type MFMTS_Work = {
  type: "work",

  cfg: Config,
  region: Region,
  
  wi: number, // worker index
  
  part: string,
  imagePart: {
    arr: Uint8ClampedArray,
    buffer: Uint8ClampedArray["buffer"],
    data: {
      width: number,
      height: number,
      channels: number,
    },
  },
};

export type MFMTS_Stop = {
  type: "stop";
}

export type MessageFromMasterToSlave = MFMTS_Work | MFMTS_Stop;

export type MessageFromSlaveToMaster = {
  done: boolean,
  part: string,
  imgPart: Uint8ClampedArray["buffer"],
  
  wi: number, // worker index  

  re: number,
  im: number,

  z: number,

  id: number,
};

// export type assert = (condition: any, message?: string): asserts condition => void;
