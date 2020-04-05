import App from "./app.js";
import { assert } from "../common/utils.js";
async function main() {
    // TODO: maybe wait for window to load?
    let canvas;
    {
        const element = document.getElementById("myCanvas");
        assert(element !== null);
        assert(element instanceof HTMLCanvasElement);
        canvas = element;
    }
    const app = new App(canvas);
    app.makeAllAvailableWorkersWork();
}
main();
