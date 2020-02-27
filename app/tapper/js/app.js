
import { tapper } from './tapper.js';


let canvas = document.getElementById("canvas");
let size1 = window.innerWidth - 2;
let size2 = 512;
let chosenSize = Math.min(size1, size2);

canvas.width = chosenSize;
canvas.height = chosenSize;



let ctx = canvas.getContext("2d");


ctx.fillStyle = "#ccc";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.font = "30px Arial";
ctx.textAlign="center";
ctx.fillStyle = "#000";
ctx.fillText("Touch to begin",canvas.width/2,canvas.height/2);


let c = tapper;

c.attach("div-tapper", "#tapper");

c.attach("tap-from", "#inpf");
c.attach("tap-to", "#inpt");
c.attach("stat-pane", "#stat");

c.attach("pauseBtn", "#pauseBtn");

c.attach("canvas", "#canvas");

document.body.onkeyup = function (e) {
    if (e.keyCode === 32) {
        c.tap();
    }
};


