import { assert } from './utils.js';


/**
 * 
 * 
 * 
 * Point P(x1, y1) on grid 1 maps onto point Q(x2, y2) on grid 2.
 * 
 * 
 * 
 * 
 */
class GridMap {

    /**
     * 
     * @param {number} s scale
     * @param {number} r rotation (in radians), 0 is no difference
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     */
    constructor(s = 1, r = 0, x1 = 0, y1 = 0, x2 = 0, y2 = 0) {

        this.s = s;
        this.r = r;

        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * 
     */
    getScale() {
        return this.s;
    }

    /**
     * 
     * @param {number} s 
     */
    setScale(s) {
        this.s = s;
    }

    /**
     * 
     */
    getRotation() {
        return this.r;
    }

    /**
     * 
     */
    getGrid1X() {
        return this.x1;
    }

    /**
     * 
     * @param {number} x 
     */
    setGrid1X(x) {
        this.x1 = x;
    }

    /**
     * 
     */
    getGrid1Y() {
        return this.y1;
    }

    /**
     * 
     * @param {number} y 
     */
    setGrid1Y(y) {
        this.y1 = y;
    }

    /**
     * 
     */
    getGrid2X() {
        return this.x2;
    }

    /**
     * 
     * @param {number} x 
     */
    setGrid2X(x) {
        this.x2 = x;
    }

    /**
     * 
     */
    getGrid2Y() {
        return this.y2;
    }

    /**
     * 
     * @param {number} y 
     */
    setGrid2Y(y) {
        this.y2 = y;
    }

    /**
     * 
     * @param {number} r 
     */
    setRotation(r) {
        this.r = r;
    }


    /**
     * Maps number `x` from grid 1 to its corresponding position on grid 2.
     * 
     * @param {number} x 
     */
    get12X(x) {

        // const x = 0;
        const y = 0;

        const s = this.s;
        const r = this.r;

        const x1 = this.x1;
        const y1 = this.y1;

        const x2 = this.x2;
        const y2 = this.y2;

        const P_x = x1;
        const P_y = y1;

        const Q_x = x2;
        const Q_y = y2;

        const PQ_x = Q_x - P_x;
        const PQ_y = Q_y - P_y;

        const scalar = s;

        const dx = (x - x1) * scalar;
        const dy = (y - y1) * scalar;

        const x_prime = P_x + dx + PQ_x;
        const y_prime = P_y + dy + PQ_y;

        return x_prime;
    }


    /**
     * Maps number `y` from grid 1 to its corresponding position on grid 2.
     * 
     * @param {number} y 
     */
    get12Y(y) {

        const x = 0;
        // const y = 0;

        const s = this.s;
        const r = this.r;

        const x1 = this.x1;
        const y1 = this.y1;

        const x2 = this.x2;
        const y2 = this.y2;

        const P_x = x1;
        const P_y = y1;

        const Q_x = x2;
        const Q_y = y2;

        const PQ_x = Q_x - P_x;
        const PQ_y = Q_y - P_y;

        const scalar = s;

        const dx = (x - x1) * scalar;
        const dy = (y - y1) * scalar;

        const x_prime = P_x + dx + PQ_x;
        const y_prime = P_y + dy + PQ_y;

        return y_prime;
    }


    /**
     * Maps number `x` from grid 2 to its corresponding position on grid 1.
     * 
     * @param {number} x 
     */
    get21X(x) {

        // const x = 0;
        const y = 0;

        const s = this.s;
        const r = this.r;

        const x1 = this.x1;
        const y1 = this.y1;

        const x2 = this.x2;
        const y2 = this.y2;

        const P_x = x1;
        const P_y = y1;

        const Q_x = x2;
        const Q_y = y2;

        const QP_x = P_x - Q_x;
        const QP_y = P_y - Q_y;

        const scalar = 1 / s;

        const dx = (x - x2) * scalar;
        const dy = (y - y2) * scalar;

        const x_prime = Q_x + dx + QP_x;
        const y_prime = Q_y + dy + QP_y;

        return x_prime;
    }


    /**
     * Maps number `y` from grid 2 to its corresponding position on grid 1.
     * 
     * @param {number} y 
     */
    get21Y(y) {

        const x = 0;
        // const y = 0;

        const s = this.s;
        const r = this.r;

        const x1 = this.x1;
        const y1 = this.y1;

        const x2 = this.x2;
        const y2 = this.y2;

        const P_x = x1;
        const P_y = y1;

        const Q_x = x2;
        const Q_y = y2;

        const QP_x = P_x - Q_x;
        const QP_y = P_y - Q_y;

        const scalar = 1 / s;

        const dx = (x - x2) * scalar;
        const dy = (y - y2) * scalar;

        const x_prime = Q_x + dx + QP_x;
        const y_prime = Q_y + dy + QP_y;

        return y_prime;
    }
}

export { GridMap };


if (true) {
    // unit tests

    if (true) {

        const s = 1;
        const r = 0;

        const x1 = 1;
        const y1 = 2;

        const x2 = 3;
        const y2 = 4;

        const gm = new GridMap(s, r, x1, y1, x2, y2);

        const g_x1 = gm.get21X(x2);
        const g_y1 = gm.get21Y(y2);

        const g_x2 = gm.get12X(x1);
        const g_y2 = gm.get12Y(y1);


        // console.log(x1, y1, x2, y2);

        // console.log(g_x1, g_y1, g_x2, g_y2);

    }

    if (true) {
        const gm = new GridMap();

        for (let i = 0; i < 100; i += 1) {
            const s = 2 * Math.random() - 0.99998;
            const r = 0;

            const x1 = 100 * (2 * Math.random() - 1);
            const y1 = 100 * (2 * Math.random() - 1);

            const x2 = 100 * (2 * Math.random() - 1);
            const y2 = 100 * (2 * Math.random() - 1);

            gm.setScale(s);

            gm.setRotation(r);

            gm.setGrid1X(x1);
            gm.setGrid1Y(y1);

            gm.setGrid2X(x2);
            gm.setGrid2Y(y2);


            const eps = 0.0001;


            assert(Math.abs(gm.get12X(x1) - x2) < eps, `${x1} should map to ${x2}, but maps to ${gm.get12X(x1)}.`);
            assert(Math.abs(gm.get12Y(y1) - y2) < eps, `${y1} should map to ${y2}, but maps to ${gm.get12Y(y1)}.`);

            assert(Math.abs(gm.get21X(x2) - x1) < eps, `${x2} should map to ${x1}, but maps to ${gm.get21X(x2)}.`);
            assert(Math.abs(gm.get21Y(y2) - y1) < eps, `${y2} should map to ${y1}, but maps to ${gm.get21Y(y2)}.`);
        }

        // console.log("success!");
    }


}
