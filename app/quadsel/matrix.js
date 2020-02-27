
import { assert } from './utils.js';
import { Vector } from './vector.js';

class Matrix {

    /**
     * 
     * @param {*} matrix 
     */
    constructor(matrix=[[]]) {

        this.m = matrix;

        /*
        [
            [1, 2],
            [3, 4]
        ]

        */
    }

    getRaw() {
        const matrix = [];

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            const row = [];

            for (let j = 0; j < n; j += 1) {
                row.push(this.m[i][j]);
            }

            matrix.push(row);
        }

        return matrix;
    }


    /**
     * 
     * @param {Matrix} that 
     */
    sub(that) {
        assert(this.getNumberOfRows() === that.getNumberOfRows());
        assert(this.getNumberOfCols() === that.getNumberOfCols());

        const matrix = [];

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            const row = [];

            for (let j = 0; j < n; j += 1) {
                row.push(this.m[i][j] - that.m[i][j]);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }


    /**
     * 
     * @param {Matrix} that 
     */
    add(that) {
        assert(this.getNumberOfRows() === that.getNumberOfRows());
        assert(this.getNumberOfCols() === that.getNumberOfCols());

        const matrix = [];

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {
                row.push(this.m[i][j] + that.m[i][j]);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }


    /**
     * 
     * @param {Matrix} that 
     */
    div(that) {
        throw new Error("Not implemented.");
    }


    /**
     * Classic matrix multiplication
     * @param {Matrix} that 
     */
    mul(that) {

        assert(this.getNumberOfCols() === that.getNumberOfRows());

        const matrix = [];

        const m = this.getNumberOfRows();
        const p = this.getNumberOfCols();
        const n = that.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {

            const row = [];

            for (let j = 0; j < n; j += 1) {

                let sum = 0;

                for (let k = 0; k < p; k += 1) {

                    // Left matrix
                    const a = this.m[i][k];

                    // Right matrix
                    const b = that.m[k][j];

                    sum += a * b;
                }

                row.push(sum);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    /**
     * Equals
     * 
     * @param {Matrix} that 
     */
    eq(that) {

        if (this.getNumberOfRows() !== that.getNumberOfRows()) {
            return false;
        }

        if (this.getNumberOfCols() !== that.getNumberOfCols()) {
            return false;
        }

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            for (let j = 0; j < n; j += 1) {
                if (this.m[i][j] !== that.m[i][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Not equals
     * 
     * @param {Matrix} that 
     */
    ne(that) {
        return !this.eq(that);
    }

    /**
     * 
     * @param {number} scalar 
     */
    scale(scalar) {
        const matrix = [];

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {
                row.push(scalar * this.m[i][j]);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    clone() {
        const matrix = [];

        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {
                row.push(this.m[i][j]);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    isSquareMatrix() {
        return this.getNumberOfRows() === this.getNumberOfCols();
    }


    /**
     * 
     * @param {*} callback 
     */
    forEach(callback) {
        const m = this.getNumberOfRows();
        const n = this.getNumberOfCols();

        for (let i = 0; i < m; i += 1) {
            for (let j = 0; j < n; j += 1) {
                callback(this.m[i][j], i, j, this.m);
            }
        }
    }

    getNumberOfRows() {
        return this.m.length;
    }

    getNumberOfColumns() {
        if (this.m.length > 0) {
            return this.m[0].length;
        } else {
            return 0;
        }
    }

    getNumberOfCols() {
        return this.getNumberOfColumns();
    }

    /**
     * 
     * @param {number} i 
     * @param {number} j 
     */
    swapRow(i, j) {
        assert(i >= 0 && i < this.getNumberOfRows());
        assert(j >= 0 && j < this.getNumberOfRows());

        if (i === j) {
            return;
        }

        for (let k = 0; k < this.getNumberOfCols(); k += 1) {
            const row_1_value = this.m[i][k];
            const row_2_value = this.m[j][k];

            this.m[i][k] = row_2_value;
            this.m[j][k] = row_1_value;
        }
    }

    /**
     * 
     * @param {number} i 
     * @param {number} j 
     */
    swapColumn(i, j) {
        assert(i >= 0 && i < this.getNumberOfCols());
        assert(j >= 0 && j < this.getNumberOfCols());

        if (i === j) {
            return;
        }

        for (let k = 0; k < this.getNumberOfRows(); k += 1) {
            const col_1_value = this.m[k][i];
            const col_2_value = this.m[k][j];

            this.m[k][i] = col_2_value;
            this.m[k][j] = col_1_value;
        }
    }

    inverse() {
        throw new Error("Not supported.");
    }

    /**
     * 
     * @param {number} i 
     * @param {number} j 
     */
    get(i, j) {
        assert(i >= 0 && i < this.getNumberOfRows());
        assert(j >= 0 && j < this.getNumberOfCols());

        return this.m[i][j];
    }

    /**
     * 
     * @param {number} i 
     * @param {number} j 
     * @param {number} value 
     */
    set(i, j, value) {
        assert(i >= 0 && i < this.getNumberOfRows());
        assert(j >= 0 && j < this.getNumberOfCols());

        this.m[i][j] = value;
    }

    /**
     * 
     * @param {number} size 
     */
    static getIdentityMatrix(size) {
        const matrix = [];

        const m = size;
        const n = size;

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {

                if (i === j) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    /**
     * 
     * @param {number} rows 
     * @param {number} columns 
     * @param {number} minValue 
     * @param {number} maxValue 
     */
    static getRandomMatrix(rows, columns, minValue, maxValue) {

        assert(maxValue >= minValue);

        const matrix = [];

        const m = rows;
        const n = columns;

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {

                const value = minValue + Math.random() * (maxValue - minValue);

                row.push(value);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }


    invert2x2() {

        assert(this.getNumberOfRows() === 2, "Has to have 2 rows.");
        assert(this.getNumberOfCols() === 2, "Has to have 2 columns.");

        const a = this.m[0][0];
        const b = this.m[0][1];
        const c = this.m[1][0];
        const d = this.m[1][1];

        const det = a * d - b * c;

        assert(det !== 0, "The determinant can't be 0.");

        const det_inv = 1 / det;

        const matrix = (new Matrix([
            [ d, -b],
            [-c,  a]
        ])).scale(det_inv);

        return matrix;
    }


    invert3x3() {

        assert(this.getNumberOfRows() === 3);
        assert(this.getNumberOfCols() === 3);

        const a = this.m[0][0];
        const b = this.m[0][1];
        const c = this.m[0][2];

        const d = this.m[1][0];
        const e = this.m[1][1];
        const f = this.m[1][2];

        const g = this.m[2][0];
        const h = this.m[2][1];
        const i = this.m[2][2];

        const det = a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;

        assert(det !== 0);

        const det_inv = 1 / det;

        const matrix = (new Matrix([
            [e * i - f * h, c * h - b * i, b * f - c * e],
            [f * g - d * i, a * i - c * g, c * d - a * f],
            [d * h - e * g, b * g - a * h, a * e - b * d]
        ])).scale(det_inv);

        return matrix;
    }


    getAsVector() {
        assert(this.getNumberOfRows() === 1 || this.getNumberOfCols() === 1);

        if (this.getNumberOfRows() === 1) {

            const v = [];

            for (let i = 0; i < this.getNumberOfCols(); i += 1) {
                v.push(this.m[0][i]);
            }

            return new Vector(v);
        } else if (this.getNumberOfCols() === 1) {

            const v = [];

            for (let i = 0; i < this.getNumberOfRows(); i += 1) {
                v.push(this.m[i][0]);
            }

            return new Vector();
        } else {
            throw new Error();
        }
    }


    transpose() {
        const matrix = [];

        const m = this.getNumberOfCols();
        const n = this.getNumberOfRows();

        for (let i = 0; i < m; i += 1) {
            const row = [];
            
            for (let j = 0; j < n; j += 1) {

                const value = this.m[j][i];

                row.push(value);
            }

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    /**
     * 
     * @param {Vector} v 
     */
    static getVectorAsColumnVector(v) {
        const matrix = [];

        for (let i = 0; i < v.length; i += 1) {
            const row = [v[i]];

            matrix.push(row);
        }

        return new Matrix(matrix);
    }

    /**
     * 
     * @param {Vector} v 
     */
    static getVectorAsRowVector(v) {

        const matrix = [];

        const row = [];

        for (let i = 0; i < v.length; i += 1) {
            row.push(v[i]);
        }

        matrix.push(row);

        return new Matrix(matrix);
    }

}

export { Matrix };


