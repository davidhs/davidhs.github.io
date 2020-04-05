export default class ImagePart {
    constructor(width, height, channels, arr) {
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
