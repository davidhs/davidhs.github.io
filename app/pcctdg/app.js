var GLOBAL = {
    initialized: false,
    dom: {},
    reuse: {},
    history: [],
    mouse: {
        canvas: {
            x: -1,
            y: -1
        }
    }
};


function toCSSRGB(r, g, b) {
    return "rgb(" + r +  ", " + g +  ", " + b + ")";
}


function newSample() {

    var text = GLOBAL.dom.text;
    var rgb1 = GLOBAL.reuse.rgbBackground;
    var rgb2 = GLOBAL.reuse.rgbText;

    for (var i = 0; i < rgb1.length; i++) {
        rgb1[i] = Math.floor(256 * Math.random());
        rgb2[i] = Math.floor(256 * Math.random());
    }

    text.style.backgroundColor = toCSSRGB(rgb1[0], rgb1[1], rgb1[2]);
    text.style.color = toCSSRGB(rgb2[0], rgb2[1], rgb2[2]);
}


function doGrade(x, y) {
    var canvas = GLOBAL.dom.canvas;

    var rect = canvas.getBoundingClientRect();


    var grade = -1;

    var w = canvas.width;
    var h = canvas.height;

    var xbw = GLOBAL.cborder.xbw;

    var xl = xbw;
    var xr = w - xbw;



    if (x <= xl) {
        grade = 0;
    } else if (x >= xr) {
        grade = 1;
    } else {
        grade = (x - xl) / (xr - xl);    
    }

    return grade;
}


function canvasResponse(evt) {

    var canvas = GLOBAL.dom.canvas;

    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;


    var grade = -1;

    var w = canvas.width;
    var h = canvas.height;

    var xbw = GLOBAL.cborder.xbw;

    var xl = xbw;
    var xr = w - xbw;



    if (x <= xl) {
        grade = 0;
    } else if (x >= xr) {
        grade = 1;
    } else {
        grade = (x - xl) / (xr - xl);    
    }

    

    var rgb1 = GLOBAL.reuse.rgbBackground;
    var rgb2 = GLOBAL.reuse.rgbText;

    var snap = [
        rgb1[0]
        , rgb1[1]
        , rgb1[2]
        , rgb2[0]
        , rgb2[1]
        , rgb2[2]
        , grade

    ];

    GLOBAL.history.push(snap);

    newSample();
}

function mouseMotionListen(evt) {
    var canvas = GLOBAL.dom.canvas;

    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;

    GLOBAL.mouse.canvas.x = x;
    GLOBAL.mouse.canvas.y = y;

    document.getElementById("coord").innerText = doGrade(x, y);
    paintCanvas();
}


function paintCanvas() {

    var canvas = GLOBAL.dom.canvas;

    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;




    var xbw = 0.1 * w;


    var xb0 = 0 * w;
    var xb1 = 1 * w - xbw;

    var xc = 0.5 * w;

    var xl = (xc + xb0 + xbw) / 2;
    var xr = (xc + xb1) / 2;

    GLOBAL.cborder = {
        xbw: xbw
        , xb0: xb0
        , xb1: xb1
        , xc:  xc
        , xl:  xl
        , xr:  xr
    }


    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.fillStyle = toCSSRGB(250, 250, 250);
    ctx.fill();


    ctx.beginPath();
    ctx.rect(xb0, 0, xbw, h);
    ctx.fillStyle = toCSSRGB(127, 127, 127);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(xb1, 0, xbw, h);
    ctx.fillStyle = toCSSRGB(127, 127, 127);
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(xb0 + xbw, 0);
    ctx.lineTo(xb0 + xbw, h);
    ctx.strokeStyle = toCSSRGB(0, 0, 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xb1, 0);
    ctx.lineTo(xb1, h);
    ctx.strokeStyle = toCSSRGB(0, 0, 100);
    ctx.stroke();

    // center line
    ctx.beginPath();
    ctx.moveTo(xc, 0);
    ctx.lineTo(xc, h);
    ctx.strokeStyle = toCSSRGB(200, 0, 0);
    ctx.stroke();





    ctx.beginPath();
    ctx.moveTo(xl, 0);
    ctx.lineTo(xl, h);
    ctx.strokeStyle = toCSSRGB(127, 200, 127);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xr, 0);
    ctx.lineTo(xr, h);
    ctx.strokeStyle = toCSSRGB(127, 200, 127);
    ctx.stroke();

    // Text


    ctx.font = "12px Arial";
    ctx.fillStyle = toCSSRGB(255, 255, 255);
    ctx.fillText("0.0", xbw / 2 - 8, h / 2 + 4);


    ctx.font = "12px Arial";
    ctx.fillStyle = toCSSRGB(255, 255, 255);
    ctx.fillText("1.0", xb1 + xbw / 2 - 8, h / 2 + 4);


    var mx = GLOBAL.mouse.canvas.x;
    var my = GLOBAL.mouse.canvas.y;


    ctx.beginPath();
    ctx.moveTo(mx, 0);
    ctx.lineTo(mx, h);
    ctx.strokeStyle = toCSSRGB(0, 0, 0);
    ctx.stroke();

}


function exportFunction(event) {

    var aexp = GLOBAL.aexp;


    var history = GLOBAL.history;

    var msg = "";

    var VERBOSE = false;

    msg += "# The first 3 values are background color red, green and blue.\n"
    msg += "# respectively.  The next 3 values are the color of the text. \n"
    msg += "# the final value is the grading, how legible it is.\n";

    for (var i = 0; i < history.length; i++) {

        var sub = history[i][0];
        for (var j = 1; j < history[i].length; j++) {
            sub += " " + history[i][j];
        }

        msg += sub;

        if (i + 1 < history.length) {
            msg += "\n";
        }
    }

    msg += "\n";


    var data = msg;


    // date
    var d = new Date();

    var ds = ""; // date string
    ds += leftpad(d.getFullYear(), "0000") + "-";
    ds += leftpad(d.getMonth(), "00") + "-";
    ds += leftpad(d.getDate(), "00") + "-";
    ds += leftpad(d.getHours(), "00");
    ds += leftpad(d.getMinutes(), "00");
    ds += leftpad(d.getSeconds(), "00");



    var filename = 'color-' + ds + '.txt';
    var dataOut = "text/txt;charset=utf-8," + encodeURIComponent(data);

    aexp.href = 'data:' + dataOut;
    aexp.download = filename;
}


function main() {

    if (GLOBAL.initialized) {
        return;
    } else {
        initialized = true;
    }

    var canvas = document.getElementById("score");
    var text = document.getElementById('suggestion');

    var dim = canvas.getBoundingClientRect();


    canvas.width = dim.width;
    canvas.height = dim.height;


    canvas.onmousemove = mouseMotionListen;


    GLOBAL.dom.canvas = canvas;
    GLOBAL.dom.text = text;

    GLOBAL.reuse.rgbBackground = [0, 0, 0];
    GLOBAL.reuse.rgbText = [0, 0, 0];


    canvas.onmouseup = canvasResponse;

    var aexp = document.getElementById("export");
    aexp.onclick = exportFunction;

    GLOBAL.aexp = aexp;


    paintCanvas();
    newSample();
}

function leftpad(str, pad) {
    return String(pad + str).slice(-pad.length);
}
