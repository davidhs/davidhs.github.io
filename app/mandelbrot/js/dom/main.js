import App from "./app.js";
import { assert } from "../common/utils.js";

async function main() {
  // TODO: maybe wait for window to load?
  
  /** @type {HTMLCanvasElement} */
  let canvas;

  {
    const element = document.getElementById("myCanvas");
    assert(element !== null);
    assert(element instanceof HTMLCanvasElement);
    canvas = element;
  }
  
  new App(canvas);
}

main();
