var ImagePart = /** @class */ (function () {
    function ImagePart(width, height, channels, arr) {
        this.arr =
            typeof arr !== "undefined"
                ? arr
                : new Uint8ClampedArray(channels * width * height);
        this.width = width;
        this.height = height;
        this.channels = channels;
    }
    ImagePart.prototype.getSize = function () {
        return this.width * this.height * this.channels;
    };
    ImagePart.prototype.getBuffer = function () {
        return this.arr.buffer;
    };
    ImagePart.prototype.getAdditionalData = function () {
        return {
            width: this.width,
            height: this.height,
            channels: this.channels
        };
    };
    return ImagePart;
}());
export default ImagePart;
