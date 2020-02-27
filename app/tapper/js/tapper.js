import { regression } from './regression.js';
import { dateFormat } from './dateformat.js';
import { Utils } from './utils.js';

let startTime = -1;
let running = false;
let initialized = false;
let element = null;
let spec = {
    from: 1,
    to: 100
};
let painter = null;
let cfg = {
    statisticalData: {},
    statPane: null
};


let _hist = {};
let history = [];


// accumulated duration
let _redDur = {

    iter: 2,
    arrD: [], // distinct
    arrC: [], // cumulative
    cs: 0,  // cumulative sum
    pp: false  // previous pause
};



let canvas;
let ctx;


let mouse = {
    x: null,
    y: null,
    t: null
};

let mouseListener = evt => {

    var rect = canvas.getBoundingClientRect();

    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;

    mouse.x = x;
    mouse.y = y;
    mouse.t = (new Date()).getTime();
};

/**
 *
 * @param item
 */
function addHistoryItem(item) {
    let type = item.type;

    if (!_hist.hasOwnProperty(type)) {
        _hist[type] = [];
    }

    _hist[type].push(item);

    history.push(item);

    // Increment reading duration here!

    if (type === "tap") {

        let taps = filterHistory("tap");


        if (initialized && taps.length > 1 && _redDur.pp ) {


            let time1 = Date.parse(arrLast(filterHistory("resume")).date); // resume event
            let time2 = Date.parse(taps[taps.length - 1].date); // tap event
            let dt =   time2 - time1;
            console.log("RENTRY", dt);


            _redDur.cs += dt;
            _redDur.arrD.push([_redDur.iter, dt]);
            _redDur.arrC.push([_redDur.iter, _redDur.cs]);
            _redDur.iter++;


            _redDur.pp = false;
        } else if (taps.length > 1) {

            let time1 = Date.parse(taps[taps.length - 2].date);
            let time2 = Date.parse(taps[taps.length - 1].date);
            let dt =   time2 - time1;

            _redDur.cs += dt;
            _redDur.arrD.push([_redDur.iter, dt]);
            _redDur.arrC.push([_redDur.iter, _redDur.cs]);
            _redDur.iter++;
        }
    } else if (type === "pause") {

        let taps = filterHistory("tap");

        if (initialized && !_redDur.pp && taps.length > 1) {

            // flush

            let time1 = Date.parse(taps[taps.length - 1].date);
            let time2 = Date.parse(arrLast(filterHistory("pause")).date); // pause
            // event
            let dt =   time2 - time1;
            console.log("FLUSH", dt);

            _redDur.cs += dt;
            _redDur.arrD.push([_redDur.iter, dt]);
            _redDur.arrC.push([_redDur.iter, _redDur.cs]);
            _redDur.iter++;
        }

        _redDur.pp = true;
    } else if (type === "resume") {}
}


/**
 *
 * @param typeFilter
 * @returns {*}
 */
function filterHistory(typeFilter) {

    if (_hist.hasOwnProperty(typeFilter)) {
        return _hist[typeFilter];
    } else if (typeFilter === "data_cumulative") {
        return _redDur.arrC;
    } else if (typeFilter === "data_distinct") {
        return _redDur.arrD;
    } else {
        console.log("ERROR!");

        return null;
    }

}

/**
 *
 * @returns {number}
 */
function getNrOfTaps() {
    return _hist["tap"].length;
}








/**
 *
 */
function attach(type, selection) {

    addHistoryItem({
        type: "attach",
        date: (new Date()).toJSON(),
        attachment: {
            type: type,
            selection: selection
        }
    });

    let id, button, div, el;

    if (type === "painter") {
        painter = selection;
    } else if (type === "tap-button") {
        id = selection.substr(1, selection.length);
        button = document.getElementById(id);
        button.addEventListener("click", function () {
            tap();
        });
    } else if (type === "div-tapper") {
        id = selection.substr(1, selection.length);
        div = document.getElementById(id);
        element = div;
    } else if (type === "stat-pane") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        cfg.statPane = el;
    } else if (type === "set-from-to-button") {
        id = selection.substr(1, selection.length);
        button = document.getElementById(id);
        button.addEventListener("click", function () {
            let from = parseInt(cfg.inputTapFrom.value);
            let to = parseInt(cfg.inputTapTo.value);
            let loc = parseInt(cfg.inputTapLoc.value);
            console.log("Applying...", from, to, loc);
            setSpec({
                from: from,
                to: to
            });
        });
    } else if (type === "tap-from") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        cfg.inputTapFrom = el;
    } else if (type === "tap-to") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        cfg.inputTapTo = el;
    } else if (type === "tap-loc") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        cfg.inputTapLoc = el;
    } else if (type === "pauseBtn") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        el.addEventListener("click", function () {
            toggle();
        });
        cfg.pauseBtn = el;
    } else if (type === "canvas") {
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        el.onclick = function () {
            tap();
        };
        canvas = el;
        ctx = canvas.getContext("2d");

        canvas.onmousedown = mouseListener;
    } else {
        console.log("!!!! ELSE");
        id = selection.substr(1, selection.length);
        el = document.getElementById(id);
        cfg[type] = el;
    }
}


/**
 *
 */
function toggle() {
    if (running) {
        pause();
    } else {
        resume();
    }
}


/**
 *
 */
function start() {
    let d = new Date();
    addHistoryItem({
        type: "start",
        date: d.toJSON()
    });
    startTime = d.getMilliseconds();
    running = true;
    initialized = true;
    mainloop();
}


/**
 *
 */
function pause() {
    if (!initialized) { return; }
    addHistoryItem({
        type: "pause",
        date: (new Date()).toJSON()
    });
    running = false;
    console.log("Pausing...");

    cfg.pauseBtn.style.backgroundColor = "#bba0e6";
    cfg.pauseBtn.innerText = "Resume";
}


/**
 *
 */
function resume() {
    if (!initialized) { return; }
    addHistoryItem({
        type: "resume",
        date: (new Date()).toJSON()
    });
    running = true;
    console.log("Resuming...");

    cfg.pauseBtn.style.backgroundColor = "#e6e6e6";
    cfg.pauseBtn.innerText = "Pause";
}


/**
 *
 */
function stop() {
    addHistoryItem({
        type: "stop",
        date: (new Date()).toJSON()
    });
    running = false;
    initialized = false;
}


function arrLast(arr) {
    return arr[arr.length - 1];
}


/**
 *
 */
function displayInfo() {

    if (!_hist.hasOwnProperty("tap")) return;

    let msg = "";
    function out(str) {
        if (typeof str === "undefined") {
            msg += "\n";
        } else {
            msg += str;
        }
    }

    let currentRelLoc = getNrOfTaps() - 1;
    let range = spec.to - spec.from + 1;

    out();
    out("Current time: " + dateFormat((new Date()).getTime(), "HH:MM:ss"));
    out();
    out("Taps: " + currentRelLoc + " / " + range + " (" + (spec.from + getNrOfTaps() - 1) + "/" + spec.to + ")");
    out();

    if (getNrOfTaps() >= 3) {

        let toGo = (spec.to - spec.from + 1) - (getNrOfTaps() - 1);

        let eq = arrLast(filterHistory("regression"));


        let totalMilliseconds    = eq.mols.slope * toGo + eq.mols.yintercept;
        let totalMillisecondsTSE = eq.tse.slope  * toGo + eq.tse.yintercept;


        out();
        out("Least squares (red)");
        out();
        out("Remaining: " + dateFormat(totalMilliseconds, "HH:MM:ss"));
        out();
        out("Finished: " + dateFormat(totalMilliseconds + (new Date()).getTime(), "HH:MM:ss"));
        out();
        out();
        out("Equation: " + eq.mols.string);
        out();
        out();
        out();
        out("Theil-Sen estimator (blue)");
        out();
        out("Remaining: " + dateFormat(totalMillisecondsTSE, "HH:MM:ss"));
        out();
        out("Finished: " + dateFormat(totalMillisecondsTSE + (new Date()).getTime(), "HH:MM:ss"));
        out();
        out();
        out("Equation: " + eq.tse.string);
        out();
    }

    cfg.statPane.innerText = msg;
}


/**
 *
 */
function computeRegressions() {

    if (!_hist.hasOwnProperty("tap")) return;

    if (getNrOfTaps() < 3) {
        return;
    }

    let cumulative_data = filterHistory("data_cumulative");

    // Method of Least Squares
    let mols = regression("linear", cumulative_data);

    // Theil-Sen Estimator
    let tse = Utils.theilSenEstimator(cumulative_data);

    addHistoryItem({
        type: "regression",
        date: (new Date()).toJSON(),
        mols: {
            slope: mols.equation[0],
            yintercept: mols.equation[1],
            string: mols.string
        },
        tse: {
            slope: tse.equation[0],
            yintercept: tse.equation[1],
            string: tse.string
        }
    });
}





/**
 *
 */
function tap() {
    
    if (!initialized) start();

    if (!running) {
        console.log("Currently not running!");
        return;
    }

    addHistoryItem({
        type: "tap",
        date: (new Date()).toJSON()
    });

    setSpec();
    computeRegressions();
    displayInfo();
    paintStatistics();
}


/**
 *
 * @param argSpec
 */
function setSpec(argSpec) {

    if (typeof argSpec === "undefined") {

        let sf = cfg.inputTapFrom.value.trim();
        let st = cfg.inputTapTo.value.trim();

        if (sf === "") {
            sf = "1";
        }

        if (st === "") {
            st = "100";
        }

        let from = parseInt(sf);
        let to = parseInt(st);
        spec = {
            from: from,
            to: to
        };
    } else {
        spec = argSpec;
    }
}



function clear() {

    let w = canvas.width;
    let h = canvas.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
}

/**
 *
 */
function paintStatistics() {


    if (!_hist.hasOwnProperty("tap")) return;

    if (getNrOfTaps() < 3) {
        return;
    }


    ctx.save();

    let w = canvas.width;
    let h = canvas.height;

    let data = filterHistory("data_cumulative");
    let eq = arrLast(filterHistory("regression"));

    let xmin = Number.MAX_VALUE;
    let ymin = Number.MAX_VALUE;

    let xmax = Number.MIN_VALUE;
    let ymax = Number.MIN_VALUE;

    for (let i = 0; i < data.length; i += 1) {
        let x = data[i][0];
        let y = data[i][1];

        xmin = Math.min(xmin, x);
        ymin = Math.min(ymin, y);

        xmax = Math.max(xmax, x);
        ymax = Math.max(ymax, y);

    }

    let xrange = xmax - xmin;
    let yrange = ymax - ymin;


    let px = 0;
    let py = h;

    let cx = 0;
    let cy = 0;


    let firstTime = true;

    for (let i = 0; i < data.length; i += 1) {

        let x = data[i][0];
        let y = data[i][1];


        cx = w * (x - xmin) / xrange;
        cy = h * (1 - (y - ymin) / yrange);

        //console.log("Coordinate", cx, cy);

        if (firstTime) {
            px = cx;
            py = cy;
            firstTime = false;
        }

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        px = cx;
        py = cy;

    }

    // Draw equations

    // -----------------------------------------------------------------

    // MLS



    let slope = eq.mols.slope;
    let yint = eq.mols.yintercept;

    let p1 = {
        x: (ymin - yint) / slope,
        y: ymin
    };
    let p2 = {
        x: (ymax - yint) / slope,
        y: ymax
    };

    let q1 = {
        x: xmin,
        y: slope * xmin + yint
    };
    let q2 = {
        x: xmax,
        y: slope * xmax + yint
    };

    let err = 1;

    let a = {
        x: 0,
        y: 0
    };
    let b = {
        x: 0,
        y: 0
    };

    let ablist = [];

    if (p1.x + err > xmin && p1.x - err < xmax) {
        ablist.push([p1.x, p1.y]);
    }

    if (p2.x + err > xmin && p2.x - err < xmax) {
        ablist.push([p2.x, p2.y]);
    }

    if (q1.y + err > ymin && q1.y - err < ymax) {
        ablist.push([q1.x, q1.y]);
    }

    if (q2.y + err > ymin && q2.y - err < ymax) {
        ablist.push([q2.x, q2.y]);
    }

    if (ablist.length >= 2) {
        a.x = ablist[0][0];
        a.y = ablist[0][1];

        b.x = ablist[1][0];
        b.y = ablist[1][1];

        if (a.x > b.x) {
            let t = 0;

            t = a.x;
            a.x = b.x;
            b.x = t;

            t = a.y;
            a.y = b.y;
            b.y = t;
        }
    }

    let x1 = w * (a.x - xmin) / xrange;
    let y1 = h - h * (a.y - ymin) / yrange;


    let x2 = w * (b.x - xmin) / xrange;
    let y2 = h - h * (b.y - ymin) / yrange;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#ff0000";
    ctx.stroke();

    // -----------------------------------------------------------------

    firstTime = true;


    slope = eq.tse.slope;
    yint = eq.tse.yintercept;

    p1 = {
        x: (ymin - yint) / slope,
        y: ymin
    };
    p2 = {
        x: (ymax - yint) / slope,
        y: ymax
    };

    q1 = {
        x: xmin,
        y: slope * xmin + yint
    };
    q2 = {
        x: xmax,
        y: slope * xmax + yint
    };

    err = 1;

    a = {
        x: 0,
        y: 0
    };
    b = {
        x: 0,
        y: 0
    };

    ablist = [];

    if (p1.x + err > xmin && p1.x - err < xmax) {
        ablist.push([p1.x, p1.y]);
    }

    if (p2.x + err > xmin && p2.x - err < xmax) {
        ablist.push([p2.x, p2.y]);
    }

    if (q1.y + err > ymin && q1.y - err < ymax) {
        ablist.push([q1.x, q1.y]);
    }

    if (q2.y + err > ymin && q2.y - err < ymax) {
        ablist.push([q2.x, q2.y]);
    }

    if (ablist.length >= 2) {
        a.x = ablist[0][0];
        a.y = ablist[0][1];

        b.x = ablist[1][0];
        b.y = ablist[1][1];

        if (a.x > b.x) {
            let t = 0;

            t = a.x;
            a.x = b.x;
            b.x = t;

            t = a.y;
            a.y = b.y;
            b.y = t;
        }
    }

    //console.log(p1, p2, q1, q2);

    x1 = w * (a.x - xmin) / xrange;
    y1 = h - h * (a.y - ymin) / yrange;


    x2 = w * (b.x - xmin) / xrange;
    y2 = h - h * (b.y - ymin) / yrange;

    //console.log("translated", x1, y1, x2, y2);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#0000ff";
    ctx.stroke();

    ctx.restore();

    // -----------------------------------------------------------------
}

function circle(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
}


function renderPropagationWave() {

    const maxTime = 1500;

    let now = (new Date()).getTime();

    if (mouse.t === null) return;

    let dt = Math.abs(now - mouse.t);

    if (dt > maxTime) return;

    // t is from 0 to 1
    let t = dt / maxTime;

    let w = canvas.width;
    let h = canvas.height;

    let x0 = mouse.x;
    let y0 = mouse.y;
    let radius = 1.414 * t * Math.max(w, h);

    

    ctx.save();



    let area = 200 ** 2;

    let radiusMin = Math.sqrt(area / Math.PI)

    let thickness = 1;


    if (t > 0) {
        circle(x0, y0, radius);
        thickness = area / (4 * radius * Math.PI)
        ctx.lineWidth = thickness;
        ctx.stroke();
    }


    ctx.restore();


}

function clamp(value, min, max) {
    return (value < min) ? min : ((value > max) ? max : value);
}

function rgba2str(r, g, b, a) {
    r = clamp(~~r, 0, 255);
    g = clamp(~~g, 0, 255);
    b = clamp(~~b, 0, 255);
    
    r = clamp(r, 0, 1);

    return 'rgba(' + r +', ' + g + ', ' + b + ', ' + a + ')';
}

function fillText(text, x, y, w, h) {

    let tw = 0;
    let th = 100;

    ctx.font = th + "px Arial";

    tw = ctx.measureText(text).width;


    let s1 = w / tw;
    let s2 = h / th;

    let s = Math.min(s1, s2);

    th = ~~(th * s);

    ctx.font = th + "px Arial";

    let hPad = (h - 0.7 * th) / 2;


    let xPos = x + w / 2;
    let yPos = y + h - hPad;

    xPos = ~~xPos;
    yPos = ~~yPos;


    ctx.fillText(text, xPos, yPos);
}

function renderPagePosition() {


    if (!_hist.hasOwnProperty("tap")) return;

    var currentPage = spec.from + getNrOfTaps() - 1;


    ctx.save();


    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0.1;

    
    
    ctx.fillStyle = rgba2str(r, g, b, a);
    fillText(currentPage, 0, 0, canvas.width, canvas.height)

    ctx.restore();
}


function update() {}

function render() {

    clear();

    renderPagePosition();

    renderPropagationWave();

    paintStatistics();

}

var mainloopID;


function mainloop(timestamp) {

    // Check for user input

    update();

    // Draw graphics
    render();

    // Play sounds


    mainloopID = window.requestAnimationFrame(mainloop);
}

// Assemble -----

let tapper = {
    attach: attach,
    start: start,
    tap: tap
};


export { tapper };
