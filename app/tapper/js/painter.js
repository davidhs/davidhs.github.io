
function Painter() {
    this.cfg = {
        id: null,
        canvas: null
    };
}

Painter.prototype.captureCanvasID = function (id) {
    this.cfg.id = id;
    this.cfg.canvas = document.getElementById(id);
};

Painter.prototype.paint = function (func) {
    console.log("This in prototype", this);
    func(this);
};

export { Painter };
