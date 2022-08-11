export default class ImagePart {
  /** @type {number} */
  width;
  /** @type {number} */
   height;
   /** @type {number} */
   channels;
   /** @type {Uint8ClampedArray} */
   arr;

   /**
    * 
    * @param {number} width 
    * @param {number} height 
    * @param {number} channels 
    * @param {Uint8ClampedArray?} arr 
    */
  constructor(
    width,
    height,
    channels,
    arr
  ) {
    this.arr =
      typeof arr !== "undefined"
        ? arr
        : new Uint8ClampedArray(channels * width * height);
    this.width = width;
    this.height = height;
    this.channels = channels;
  }

   getSize() {
    return this.width * this.height * this.channels;
  }

   getBuffer() {
    return this.arr.buffer;
  }

   getAdditionalData() {
    return {
      width: this.width,
      height: this.height,
      channels: this.channels
    };
  }
}
