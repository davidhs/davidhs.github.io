import { drawLine, drawCircle } from './gutil.js';

class FourGon {
    constructor() {
        // Counter clockwise polygon
        this.points = [
            {
                x: 20,
                y: 20
            }, {
                x: 20,
                y: 40
            }, {
                x: 40,
                y: 40
            }, {
                x: 40,
                y: 20
            }
        ];
        this.lock = false;
        this.idx = -1;
    }

    letGo() {
        this.lock = false;
        this.idx = -1;
    }

    /**
     * @param {number} x 
     * @param {number} y
     */
    drag(x, y) {


        if (!this.lock) return;

        if (this.idx === -1) return;
    
        let point = this.points[this.idx];
    
        point.x = x;
        point.y = y;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    grab(x, y) {
        if (this.lock) return;
    
        var idx = -1;
        var dist = Number.MAX_VALUE;
    
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            var px = point.x;
            var py = point.y;
    
            var dx = px - x;
            var dy = py - y;
    
            var _dist = Math.sqrt(dx * dx + dy * dy);
    
            if (_dist < dist) {
                idx = i;
                dist = _dist;
            }
        }
    
        if (dist < 4) {
            this.idx = idx;
            this.lock = true;
        } else {
            this.lock = false;
            this.idx = -1;
        }

    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {

        var points = this.points;
    
        var p1 = points[0];
        var p2 = points[1];
        var p3 = points[2];
        var p4 = points[3];
    
        ctx.strokeStyle = "#f0f";
        drawLine(ctx, p1.x, p1.y, p2.x, p2.y);
        drawLine(ctx, p2.x, p2.y, p3.x, p3.y);
        drawLine(ctx, p3.x, p3.y, p4.x, p4.y);
        drawLine(ctx, p4.x, p4.y, p1.x, p1.y);
    
        var r = 2;
        drawCircle(ctx, p1.x, p1.y, r);
        drawCircle(ctx, p2.x, p2.y, r);
        drawCircle(ctx, p3.x, p3.y, r);
        drawCircle(ctx, p4.x, p4.y, r);

    }
}

export { FourGon };
