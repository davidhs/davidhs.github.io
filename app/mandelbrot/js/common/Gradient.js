import { assert, lerp } from "./utils.js";
export default class Gradient {
    constructor() {
        this.#positionColors = [];
        this.#needToSort = false;
    }
    #positionColors;
    #needToSort;
    setPositionColor(position, rgba) {
        position = ((position % 1.0) + 1.0) % 1.0;
        assert(position >= 0.0 && position <= 1.0, `Got: ${position}`);
        if (rgba.length === 3) {
            const temp = [0, 0, 0, 1.0];
            temp[0] = rgba[0];
            temp[1] = rgba[1];
            temp[2] = rgba[2];
            rgba = temp;
        }
        this.#positionColors.push({
            pos: position,
            rgba: rgba
        });
        this.#needToSort = true;
    }
    /**
     * Position *MUST* be finite
     *
     * @param position
     * @param rgba
     */
    getColorAt(position, rgba) {
        position = ((position % 1.0) + 1.0) % 1.0;
        // assert(position >= 0.0 && position <= 1.0, `Got: ${position}`);
        let p = position;
        const pcs = this.#positionColors;
        const n = pcs.length;
        if (n === 0) {
            rgba[0] = 0.0;
            rgba[1] = 0.0;
            rgba[2] = 0.0;
            rgba[3] = 1.0;
            return;
        }
        if (n === 1) {
            rgba[0] = pcs[0].rgba[0];
            rgba[1] = pcs[0].rgba[1];
            rgba[2] = pcs[0].rgba[2];
            rgba[3] = pcs[0].rgba[3];
            return;
        }
        if (this.#needToSort) {
            this.#needToSort = false;
            pcs.sort((a, b) => a.pos - b.pos);
        }
        let t = 0.0;
        let i1 = 0;
        let i2 = 0;
        let found = false;
        for (let i = 0; i < n - 1; i += 1) {
            const pc1 = pcs[i + 0];
            const pc2 = pcs[i + 1];
            const p1 = pc1.pos;
            const p2 = pc2.pos;
            if (p1 <= p && p < p2) {
                // assert((p >= p1) && (p < p2));
                i1 = i;
                i2 = i + 1;
                t = (p - p1) / (p2 - p1);
                found = true;
                break;
            }
        }
        if (!found) {
            const pc1 = pcs[n - 1];
            const pc2 = pcs[0];
            const p1 = pc1.pos;
            const p2 = pc2.pos;
            if (p >= p1) {
                p -= p1;
            }
            else if (p <= p2) {
                p += 1.0 - p1;
            }
            else {
                throw new Error(``);
            }
            const span = 1.0 - (p1 - p2);
            t = p / span;
            i1 = n - 1;
            i2 = 0;
        }
        const c1 = pcs[i1].rgba;
        const c2 = pcs[i2].rgba;
        for (let i = 0; i < 4; i += 1) {
            // Color channel
            const cc1 = c1[i];
            const cc2 = c2[i];
            const cc = lerp(cc1, cc2, t);
            rgba[i] = cc;
        }
    }
}
