import { assert } from './utils.js';



const DO_UNIT_TESTS = true;


/**
 * 
 */
class Vector {


    /**
     * 
     * @param {number|number[]} x 
     */
    constructor(x) {

        assert(typeof x === "number" || Array.isArray(x));

        if (typeof x === "number") {
            const v = [];
            const n = x;
            for (let i = 0; i < n; i += 1) {
                v.push(0);
            }
            this.arr = v;
        } else if (Array.isArray(x)) {
            this.arr = x;
        } else {
            throw new Error("Don't understand: " + x);
        }
    }


    get(i) {
        assert(i >= 0 && i < this.arr.length);
        return this.arr[i];
    }

    set(i, value) {
        assert(i >= 0 && i < this.arr.length);
        this.arr[i] = value;
    }

    getRaw() {
        return this.arr.slice();
    }


    /**
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    neg() {
        const n = this.arr.length;
        const arr = [];

        for (let i = 0; i < n; i += 1) {
            arr.push(-this.arr[i]);
        }

        return new Vector(arr);
    }


    /**
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    sub(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        const n = this.arr.length;
        const arr = [];

        for (let i = 0; i < n; i += 1) {
            arr.push(this.arr[i] - that.arr[i]);
        }

        return new Vector(arr);
    }

    /**
     * 
     * @param {Vector} that 
     */
    minus(that) {
        return this.sub(that);
    }




    /**
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    add(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        const n = this.arr.length;
        const arr = [];

        for (let i = 0; i < n; i += 1) {
            arr.push(this.arr[i] + that.arr[i]);
        }
        
        return new Vector(arr);
    }

    /**
     * 
     * @param {Vector} that 
     */
    plus(that) {
        return this.add(that);
    }


    /**
     *
     * @param {number} s
     * @returns {Vector}
     */
    scale(s) {
        assert(typeof s === "number");

        const n = this.arr.length;
        const arr = [];

        for (let i = 0; i < n; i += 1) {
            arr.push(this.arr[i] * s);
        }
        
        return new Vector(arr);
    }


    /**
     *
     * @param {Vector} that
     * @returns {number}
     */
    dot(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        const n = this.arr.length;

        let sum = 0;

        for (let i = 0; i < n; i += 1) {
            sum += this.arr[i] * that.arr[i];
        }

        return sum;
    }


    /**
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    cross(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");
        assert(this.dimensions() === 3);

        const c = [
            this.arr[1] * that.arr[2] - this.c[2] * that.arr[1],
            this.arr[2] * that.arr[0] - this.c[0] * that.arr[2],
            this.arr[0] * that.arr[1] - this.c[1] * that.arr[0]
        ];

        return new Vector(c);

    }


    /**
     *
     * @returns {number}
     */
    dimensions() {
        return this.arr.length;
    }

    getDimensions() {
        return this.dimensions();
    }


    /**
     *
     * @returns {Vector}
     */
    unit() {
        const arr = [];
        const len = this.magnitude();

        for (let i = 0; i < this.arr.length; i += 1) {
            arr[i] = this.arr[i] / len;
        }

        return new Vector(c);
    }


    /**
     * 
     */
    magnitude() {
        let sum = 0;

        for (let i = 0; i < this.arr.length; i += 1) {
            sum += this.arr[i] * this.arr[i];
        }

        return Math.sqrt(sum);
    }

    /**
     *
     * @returns {number}
     */
    length() {
        return this.magnitude();
    }


    /**
     * Vector Projection
     *
     * Projects `this' vector onto `that' vector
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    project(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        return that.scalar(this.dot(that) / that.dot(that));
    }


    /**
     * Vector Rejection
     *
     * Rejects `this' vector from `that' vector
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    reject(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        return this.sub(this.project(that));
    }


    /**
     * Vector reflection.
     *
     * This vector is the reflector vector and that is the reflected vector.
     *
     * @param {Vector} that
     * @returns {Vector}
     */
    reflect(that) {
        assert(that instanceof Vector);
        assert(this.dimensions() === that.dimensions(), "Incompatible vectors");

        return that.sub(this.project(that).scalar(2));
    }


    /**
     *
     * @param {Vector} p0 - any point on the plane
     * @param {Vector} l0 - is a point on the line
     * @param {Vector} n - normal vector to the plane
     * @param {Vector} l - vector in the direction of the line
     */
    static linePlaneIntersection(p0, l0, n, l) {
        assert(p0 instanceof Vector);
        assert(l0 instanceof Vector);
        assert(n instanceof Vector);
        assert(l instanceof Vector);

        const dim = p0.dimensions();

        assert(dim === 3, "Need 3 dimensions.");

        assert(p0.dimensions() === dim, "Incompatible vectors");
        assert(l0.dimensions() === dim, "Incompatible vectors");
        assert(n.dimensions() === dim, "Incompatible vectors");
        assert(l.dimensions() === dim, "Incompatible vectors");

        const d = p0.sub(l0).dot(n) / (l.dot(n));

        return d;
    }
}

export { Vector };



if (DO_UNIT_TESTS) {


}


