import { Vector } from './vector.js';
import { assert } from './utils.js';
import { Matrix } from './matrix.js';

class Line {

    /**
     * 
     * @param {Vector} p Point on the line
     * @param {Vector} d "Direction" on the line, i.e. a vector pointing in the same direction
     */
    constructor(p, d) {

        assert(p.getDimensions() === d.getDimensions());

        this.p = p;
        this.d = d;
    }

    /**
     * Returns a vector tho
     * 
     * @param {number} t 
     */
    getPoint(t) {

        const p = this.p;
        const d = this.d;


        return p.plus(d.scale(t));
    }

    getDimensions() {
        return this.p.getDimensions();
    }

    /**
     * alpha refers to this line
     * beta refers to that line
     * 
     * @param {Line} that 
     */
    getIntersectionAlphaBeta(that) {

        assert(this.getDimensions() === that.getDimensions());
        assert(this.getDimensions() === 2);

        const p1 = this.p;
        const d1 = this.d;

        const p2 = that.p;
        const d2 = that.d;
        


        const dP = p2.minus(p1);

        
        const D = new Matrix([
            [d1.get(0), d2.get(0)], 
            [d1.get(1), d2.get(1)]
        ]);


        const D_inv = D.invert2x2();


        const G = D_inv.mul(Matrix.getVectorAsColumnVector(dP)).getAsVector();

        const alpha = G[0];
        const beta = G[1];

        console.log(alpha, beta);

        return [alpha, beta];
    }
}

export { Line };
