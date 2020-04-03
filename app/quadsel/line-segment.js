import { Vector } from './vector.js';
import { assert } from './utils.js';
import { Line } from './line.js';

class LineSegment {

    constructor(...args) {

        assert(args.length > 0);

        if (args.length === 1 && args[0] instanceof LineSegment) {

            this.p1 = args[0].p1.slice();
            this.p2 = args[0].p2.slice();

        } else if (args.length === 2 && args[0] instanceof Vector && args[1] instanceof Vector) {

            this.p1 = args[0].getRaw();
            this.p2 = args[1].getRaw();

        } else if (args.length >= 4 && args.length % 2 === 0 && typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number" && typeof args[3] === "number") {

            const p1 = [];
            const p2 = [];

            // left
            
            const k = args.length / 2;

            for (let i = 0; i < k; i += 1) {
                p1.push(args[i]);
            }

            // right

            const n = args.length;
            
            for (let i = k; i < n; i += 1) {
                p2.push(args[i]);
            }


            this.p1 = p1;
            this.p2 = p2;
        } else {
            throw new Error("Don't understand, " + args);
        }

        assert(this.p1.length === this.p2.length);
    }


    getDimensions() {
        return this.p1.length;
    }


    /**
     * Checks if this intersects that
     * 
     * @param {LineSegment} that 
     */
    intersects(that) {

        assert(this.getDimensions() === 2);
        assert(that.getDimensions() === 2);


        const p1 = new Vector(this.p1);
        const d1 = (new Vector(this.p2)).minus(new Vector(this.p1));

        const p2 = new Vector(that.p1);
        const d2 = (new Vector(that.p2)).minus(new Vector(that.p1));

        const L1 = new Line(p1, d1);
        const L2 = new Line(p2, d2);


        try {
            const alpha_beta = L1.getIntersectionAlphaBeta(L2);

            const alpha = alpha_beta[0];
            const beta  = alpha_beta[1];
    
            if (alpha >= 0 && alpha <= 1 && beta >= 0 && beta <= 1) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }

    }

    /**
     * Checks if this intersects that
     * 
     * @param {LineSegment} that 
     */
    getIntersection(that) {

        assert(this.getDimensions() === 2);
        assert(that.getDimensions() === 2);



    }
}

export { LineSegment }
