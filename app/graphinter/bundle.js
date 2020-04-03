(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var css = "/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\nhtml,\nbody,\ndiv,\nspan,\napplet,\nobject,\niframe,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nblockquote,\npre,\na,\nabbr,\nacronym,\naddress,\nbig,\ncite,\ncode,\ndel,\ndfn,\nem,\nimg,\nins,\nkbd,\nq,\ns,\nsamp,\nsmall,\nstrike,\nstrong,\nsub,\nsup,\ntt,\nvar,\nb,\nu,\ni,\ncenter,\ndl,\ndt,\ndd,\nol,\nul,\nli,\nfieldset,\nform,\nlabel,\nlegend,\ntable,\ncaption,\ntbody,\ntfoot,\nthead,\ntr,\nth,\ntd,\narticle,\naside,\ncanvas,\ndetails,\nembed,\nfigure,\nfigcaption,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\noutput,\nruby,\nsection,\nsummary,\ntime,\nmark,\naudio,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol,\nul {\n  list-style: none;\n}\nblockquote,\nq {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n"; (require("browserify-css").createStyle(css, { "href": "css/reset.css"})); module.exports = css;
},{"browserify-css":14}],2:[function(require,module,exports){

// Functionality that I want to add.
//
// * Select and drag a rectangle and every vertex that's within it gets
//   selected such that if I move one of them I move all of them.  To
//   cancel this effect I would select some empty/unoccupied region.
// * By selecting a vertex it gets highlighted and "in focus" until I
//   select some unoccupied region.
// * Once I have select list of vertices selected (with this drag method)
//   then I could copy it and paste it under my cursor, creating a new graph
//   (or vertices and edges) such that the edges connecting them in the
//   original are copied, others are not included (edges which extend to
//   vertices which are not selected).
//
// * Be able to delete vertices and edges.
// * Be able to select an edge, but the edge should not be dragable.

// TODO: if I modify a graph then import a different one I get an error
// at line 787 in bundle.


////////////////////////////////////////////////////////////////////////////////
// START OF IMPORTS
////////////////////////////////////////////////////////////////////////////////

var MouseController = require('./mouse-controller.js');
var KeyboardController = require('./keyboard-controller.js');
var Vertex = require('./vertex.js');
var Graphics2D = require('./graphics2d.js');

var SpringSystem = require('./spring-system.js');

var graph = new (require('./graph.js'));
var gu = require('./general-utils.js');

var Edge = require('./edge.js');

////////////////////////////////////////////////////////////////////////////////
// END OF IMPORTS
////////////////////////////////////////////////////////////////////////////////
// START OF FIELDS
////////////////////////////////////////////////////////////////////////////////

var g2d = new Graphics2D();


var PREFERED_DISTANCE = 100;
var ss = new SpringSystem(graph, PREFERED_DISTANCE);

var kbc = new KeyboardController();

var mouse = {

    selection: {
        obj: undefined,
        available: true,
        rectangle: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            active: false
        },
        initial: {
            x: 0,
            y: 0
        },
        offset: {
            x: 0,
            y: 0
        },
        index: -1,
        list: []

    },

    // special field for tracking edges and vertices and 
    // modifying their description
    sel: {
        e: null,
        v: null
    },

    // current
    c: {
        x: 0,
        y: 0
    },
    // previous
    p: {
        x: 0,
        y: 0
    },

    // mouse down
    md: {
        x: 0,
        y: 0
    },

    // mouse up
    mu: {
        x: 0,
        y: 0
    },

    l: {
        pressed: false
    },
    r: {
        pressed: false
    },
    middle: {
        pressed: false
    },
    dragged: false,
    canvas: {
        focus: false
    }
};

var PANNED_X = 0;
var PANNED_Y = 0;

var TAU = 2 * Math.PI;
var SELECTION_RADIUS_EXTENSION = 4;

var app = {};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
g2d.attachContext(ctx);


var copiedGraph = {};


var EDGE_DESCRIPTION = document.getElementById('edgedescription');
var VERTEX_DESCRIPTION = document.getElementById('vertexdescription');

var data = {
    closestVertex: {
        distanceSquared: -1,
        distance: -1,
        index: -1
    }
};

var aexp = document.getElementById("export");
var imprt = document.getElementById("import");

////////////////////////////////////////////////////////////////////////////////
// END OF FIELDS
////////////////////////////////////////////////////////////////////////////////
// START OF FIELD MODIFICATIONS
////////////////////////////////////////////////////////////////////////////////



canvas.style.backgroundColor = gu.color.rgbToHex(255, 255, 255);
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;


var timeoutVertex = 750; // milliseconds
var taSVertex = new Date().getTime();
var activeVertex = false;

var timeoutEdge = 750; // milliseconds
var taSEdge = new Date().getTime();
var activeEdge = false;

VERTEX_DESCRIPTION.addEventListener('keyup', function (e) {
    VERTEX_DESCRIPTION.style.backgroundColor = '#fee';
    activeVertex = true;
    taSVertex = new Date().getTime() + timeoutVertex;
    setTimeout(processVertexDescription, timeoutVertex);
});

EDGE_DESCRIPTION.addEventListener('keyup', function (e) {
    EDGE_DESCRIPTION.style.backgroundColor = '#fee';
    activeEdge = true;
    taSEdge = new Date().getTime() + timeoutVertex;
    setTimeout(processEdgeDescription, timeoutEdge);
});

function processVertexDescription() {
    var time = new Date().getTime();
    if (time < taSVertex) {
        setTimeout(processVertexDescription, timeoutVertex);
    } else {
        if (activeVertex) {
            activeVertex = false;
            VERTEX_DESCRIPTION.style.backgroundColor = '#efe';
            if (mouse.sel.v) {
                console.log("saving...");
                mouse.sel.v.data.description = VERTEX_DESCRIPTION.value;
            } else {
                console.log("Vertex doesn't exist");
            }
        }
    }
}

function processEdgeDescription() {
    var time = new Date().getTime();
    if (time < taSEdge) {
        setTimeout(processEdgeDescription, timeoutEdge);
    } else {
        if (activeEdge) {
            activeEdge = false;
            EDGE_DESCRIPTION.style.backgroundColor = '#efe';
            if (mouse.sel.e) {
                console.log("saving...");
                mouse.sel.e.data.description = EDGE_DESCRIPTION.value;
            } else {
                console.log("Edge doesn't exist");
            }
        }
    }
}

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = 'It looks like you have been editing something. '
            + 'If you leave before saving, your changes will be lost.';

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});



var BUTTON_VERTEX_DEL = document.getElementById('btnvdel');
BUTTON_VERTEX_DEL.addEventListener('click', function (event) {
    var vertex = mouse.sel.v;
    if (vertex) {
        graph.removeVertex(vertex.id);
        mouse.sel.v = null;
        paint();
    }
});

var BUTTON_EDGE_DEL = document.getElementById('btnedel');
BUTTON_EDGE_DEL.addEventListener('click', function (event) {
    var edge = mouse.sel.e;
    console.log(edge);
    if (edge) {
        graph.removeEdge(edge.id);
        mouse.sel.e = null;
        paint();
    }
});


window.onkeydown = function (event) {
    // hmm
    //event.preventDefault();
    kbc.captureEvent(event);

    // BAD IDEA
    if (false && mouse.canvas.focus) {
        console.log("Does this work?");
        console.log(event);
        console.log(kbc);

        var kc = event.keyCode;


        // metaKey
        // ctrlKey

        if (event.altKey && kbc.isEqual("v")) {

        }


        if (kbc.isEqual("d", kc) || kbc.isEqual("backspace", kc)) {
            // d

            console.log("works3?");

            for (var i = 0; i < mouse.selection.list.length; i += 1) {
                var vertexID = mouse.selection.list[i];
                graph.removeVertex(vertexID);
                console.log("Removing...");
            }



            mouse.selection.list = [];
            console.log("d");
        } else if ((event.metaKey || event.ctrlKey) && kbc.isEqual("c", kc)) {
            // ctrl/cmd c
            console.log("ctrl/cmd c");
            copiedGraph = graph.copy(mouse.selection.list);
        } else if ((event.metaKey || event.ctrlKey) && kbc.isEqual("v", kc)) {
            // ctrl/cmd v
            console.log("ctrl/cmd v");
            graph.paste(copiedGraph);
        } else if (kbc.isEqual("s", kc)) {
            graph.standardConfiguration(canvas.width, canvas.height);
        } else if (kbc.isEqual("i", kc)) {
            graph.getIdiophilicVertices();
        }

        paint();
    }
};


canvas.onmouseout = function (event) {
    mouse.canvas.focus = false;
};

canvas.onmousedown = function (event) {



    // Capture location on canvas.
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    mouse.c.x = x;
    mouse.c.y = y;

    mouse.p.x = x;
    mouse.p.y = y;

    mouse.md.x = x;
    mouse.md.y = y;

    mouse.l.pressed = (event.button === MouseController.BUTTON.LEFT);
    mouse.r.pressed = (event.button === MouseController.BUTTON.RIGHT);
    mouse.middle.pressed = (event.button === MouseController.BUTTON.MIDDLE);

    // New vertex

    if (event.ctrlKey) {
    
        if (x === mouse.md.x && y === mouse.md.y) {
            // This should solve the problem where you double-click and then
            // immediately move your mouse (the computer thinks you're dragging)
            // and after you release the button you create a vertex.
            var v = new Vertex();
            v.data.x = x - PANNED_X;
            v.data.y = y - PANNED_Y;
            v.data.r = 4;
            graph.addVertex(v);
        }
    }


    var vertices = graph.getVertexList();



    // Search for vertices or edges to move around.

    // --- --- --- Search for a vertex. --- --- ---


    var n = graph.getNearestVertex(mouse.c.x - PANNED_X, mouse.c.y - PANNED_Y);

    if (mouse.l.pressed && n !== null && n.index >= 0) {
        var v = vertices[n.index];
        if (n.distance < v.data.r + SELECTION_RADIUS_EXTENSION) {
            mouse.selection.initial.x = mouse.c.x;
            mouse.selection.initial.y = mouse.c.y;
            mouse.selection.offset.x = v.data.x - mouse.c.x;
            mouse.selection.offset.y = v.data.y - mouse.c.y;
            mouse.selection.index = n.index;
            mouse.selection.obj = v;
            mouse.selection.available = false;

            if (mouse.selection.list.indexOf(v.id) === -1) {
                mouse.selection.list = [v.id];
            }
        }
    }

    if (n !== null && n.index < 0) {

        mouse.selection.list = [];
    }

    figureOutSelected();
    paint();
};

canvas.onmousemove = function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;



    mouse.canvas.focus = true;

    mouse.c.x = x;
    mouse.c.y = y;

    // Panning view
    if (mouse.middle.pressed) {
        PANNED_X += mouse.c.x - mouse.p.x;
        PANNED_Y += mouse.c.y - mouse.p.y;
    }


    if (mouse.l.pressed) {
        mouse.dragged = (mouse.c.x !== mouse.md.x) || (mouse.c.y !== mouse.md.y);
    } else {
        mouse.dragged = false;
    }


    if (!mouse.selection.available) {


        for (var i = 0; i < mouse.selection.list.length; i += 1) {
            var vertexID = mouse.selection.list[i];
            var vertex = graph.vertices[vertexID];

            vertex.data.x += mouse.c.x - mouse.p.x;
            vertex.data.y += mouse.c.y - mouse.p.y;

        }
    }

    mouse.p.x = mouse.c.x;
    mouse.p.y = mouse.c.y;

    paint();
};

canvas.onfocusout = function (event) {
    mouse.middle.pressed = false;
}

canvas.onmouseup = function (event) {

    var vertices = graph.getVertexList();

    // Graph new mouse coordinates.
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    mouse.c.x = x;
    mouse.c.y = y;


    mouse.mu.x = x;
    mouse.mu.y = y;

    if (event.button === 2) {
        // Connect two vertices if applicable.
        var n1 = graph.getNearestVertex(mouse.md.x - PANNED_X, mouse.md.y - PANNED_Y);
        var n2 = graph.getNearestVertex(mouse.mu.x - PANNED_X, mouse.mu.y - PANNED_Y);


        // check for any index in proximity and is not the same index.
        if (n1 && n2 && n1.index !== -1 && n2.index !== -1 && n1.index !== n2.index) {
            var v1 = vertices[n1.index];
            var v2 = vertices[n2.index];

            // check if sufficiently close to target vertex
            if (n1.distance < v1.data.r + SELECTION_RADIUS_EXTENSION && n2.distance < v2.data.r + SELECTION_RADIUS_EXTENSION) {
                graph.addEdge(v1, v2);
            }
        }

    }




    if (false && event.detail === 2 && event.button === MouseController.BUTTON.RIGHT) {
        // Right mouse button double-click

        var nv = graph.getNearestVertex(x, y);

        if (nv.index >= 0) {
            var v = graph.vertices[nv.id];


            // Vertex has a higher priority for deletion.

            if (nv.distance < v.data.r + SELECTION_RADIUS_EXTENSION) {
                graph.removeVertex(nv.id);
            } else {

                var ne = graph.getNearestEdge(x, y);

                if (ne.index >= 0 && ne.distance < 6) {
                    graph.removeEdge(ne.id);
                }
            }

        }
    }


    // If dragging and selection
    if (mouse.l.pressed && mouse.selection.available && mouse.dragged) {
        // Get selected list.

        var x0 = mouse.md.x - PANNED_X;
        var y0 = mouse.md.y - PANNED_Y;
        var x1 = mouse.mu.x - PANNED_X;
        var y1 = mouse.mu.y - PANNED_Y;
        var list = [];

        for (var key in graph.vertices) {
            if (graph.vertices.hasOwnProperty(key)) {
                var x = graph.vertices[key].data.x;
                var y = graph.vertices[key].data.y;

                if (gu.geo.inRectangularBounds(x, y, x0, y0, x1, y1)) {
                    list.push(key);
                }
            }
        }

        mouse.selection.list = list;
    }

    if (!mouse.dragged) {
        mouse.selection.list = [];
    }


    // Reset values


    // clear values

    mouse.p.x = mouse.c.x;
    mouse.p.y = mouse.c.y;

    mouse.selection.available = true;

    mouse.l.pressed = false;
    mouse.r.pressed = false;
    mouse.middle.pressed = false;

    mouse.dragged = false;

    paint();
};

canvas.oncontextmenu = function (event) {
    event.preventDefault();
};

canvas.onmousewheel = function (event) {
    event.preventDefault();
};

canvas.ondblclick = function (event) {

    paint();
};

aexp.onclick = function (event) {

    var xprt = graph.export(true, true);
    var data = "text/json;charset=utf-8," + encodeURIComponent(xprt);

    // date
    var d = new Date();

    var ds = ""; // date string
    ds += leftpad(d.getFullYear(), "0000") + "-";
    ds += leftpad(d.getMonth(), "00") + "-";
    ds += leftpad(d.getDate(), "00") + "-";
    ds += leftpad(d.getHours(), "00");
    ds += leftpad(d.getMinutes(), "00");
    ds += leftpad(d.getSeconds(), "00");

    aexp.href = 'data:' + data;
    aexp.download = 'graph-' + ds + '.json';
};

imprt.onchange = function (event) {
    var reader = new FileReader();
    reader.onload = function (evt2) {
        var obj = JSON.parse(evt2.target.result);
        graph.import(obj);
    };
    reader.readAsText(event.target.files[0]);
};


////////////////////////////////////////////////////////////////////////////////
// END OF FIELD MODIFICATIONS
////////////////////////////////////////////////////////////////////////////////
// START OF FUNCTIONS
////////////////////////////////////////////////////////////////////////////////


var VERTEX_INFO = document.getElementById('vertexinfo');
var EDGE_INFO = document.getElementById('edgeinfo');

function figureOutSelected() {

    // VERTEX

    var nv = graph.getNearestVertex(mouse.c.x - PANNED_X, mouse.c.y - PANNED_Y);

    var vertexSelected = false;

    if (nv !== null) {
        var v = graph.vertices[nv.id];
    
        if (nv.distance < v.data.r + 5) {

            vertexSelected = true;

            mouse.sel.v = v;
            VERTEX_DESCRIPTION.value = v.data.description;
    
            var msg = "";
    
            var counter = 0;
    
            for (var edgeID in v.edges) {
                if (v.edges.hasOwnProperty(edgeID)) {
                    var e = graph.edges[edgeID];
                    counter++;
                    msg += counter + " " + e.id + "\n";
                }
            }
    
            VERTEX_INFO.value = msg;
        }
    }



    // EDGE

    if (!vertexSelected) {
        var ne = graph.getNearestEdge(mouse.c.x - PANNED_X, mouse.c.y - PANNED_Y);
        if (ne === null) {
            return;
        }
        var e = graph.edges[ne.id];
    
        if (ne.distance < 8) {
            EDGE_DESCRIPTION.value = e.data.description;
            mouse.sel.e = e;
            EDGE_INFO.value = e.source + "\n" + e.target;
        }
    }
}


function old() {

        for (var edgeID in vertex.edges) {
            var edge = graph.edges[edgeID];
            var vertexID2 = edge.getOppositeID(vertex.id);
            var v2 = graph.vertices[vertexID2];

            // calculate force from edges to v2
            for (var ei2 in v2.edges) {
                if (ei2 !== edgeID) {
                    var e = graph.edges[ei2];
                    var vid2 = e.getOppositeID(vertexID2);
                    var v3 = graph.vertices[vid2];
                    var dx = v3.data.x - vertex.data.x;
                    var dy = v3.data.y - vertex.data.y;
        
                    var distSq = dx * dx + dy * dy
                    var distance = Math.sqrt(distSq);
        
                    if (distance > PREFERED_DISTANCE) {
                        dx /= distSq;
                        dy /= distSq;
                    } else {
                        dx = -dx/distance;
                        dy = -dy/distance;
                    }
        
                    sdx += dx;
                    sdy += dy;
                }
            }

            var dx = v2.data.x - vertex.data.x;
            var dy = v2.data.y - vertex.data.y;

            var distSq = dx * dx + dy * dy
            var distance = Math.sqrt(distSq);

            if (distance > PREFERED_DISTANCE) {
                dx /= distSq;
                dy /= distSq;
            } else {
                dx = -dx/distance;
                dy = -dy/distance;
            }

            sdx += dx;
            sdy += dy;
        }
}

function doForce(timestep) {

    timestep = (typeof timestep !== 'undefined') ? timestep : 0.1;

    // Make sure every vertex has an dx, dy value
    graph.forEachVertex(function (vertex) {
        if (!vertex.data.dx) {
            vertex.data.dx = 0;
        }

        if (!vertex.data.dy) {
            vertex.data.dy = 0;
        }

        if (!vertex.data.vdx) {
            vertex.data.vdx = 0;
        }
        
        if (!vertex.data.vdy) {
            vertex.data.vdy = 0;
        }

        if (!vertex.data.adx) {
            vertex.data.adx = 0;
        }
        
        if (!vertex.data.ady) {
            vertex.data.ady = 0;
        }

    });

    if (false) {
        console.log("Calculating Force");
        // calculate local force (spring system)
        graph.forEachVertex(function (vertex) {
            var sdx = 0;
            var sdy = 0;
    
            for (var vertexID in graph.vertices) {
                if (graph.vertices.hasOwnProperty(vertexID) && vertexID !== vertex.id) {
                    var v2 = graph.vertices[vertexID];
    
                    var dx = v2.data.x - vertex.data.x;
                    var dy = v2.data.y - vertex.data.y;
        
                    var distSq = dx * dx + dy * dy
                    var distance = Math.sqrt(distSq);
    
    
        
                    if (distance > PREFERED_DISTANCE) {
                        dx /= distSq;
                        dy /= distSq;
                    } else {
                        dx = -dx/distSq;
                        dy = -dy/distSq;
                    }
        
                    sdx += dx;
                    sdy += dy;
                }
            }
    
            // Attract to center
    
            var dx = 0 - vertex.data.x;
            var dy = 0 - vertex.data.y;
        
            var distSq = dx * dx + dy * dy
            var distance = Math.sqrt(distSq);
            if (distance > PREFERED_DISTANCE) {
                dx /= distSq;
                dy /= distSq;
            } else {
                dx = -dx/distSq;
                dy = -dy/distSq;
            }
        
            sdx += dx;
            sdy += dy;
    
    
            vertex.data.dx = sdx;
            vertex.data.dy = sdy;
    
        });
    
    
        console.log("Applying force!");
        // apply force
        graph.forEachVertex(function (vertex) {
    
            vertex.data.x += vertex.data.dx;
            vertex.data.y += vertex.data.dy;
    
            vertex.data.dx = 0;
            vertex.data.dy = 0;
        });
    } else {
        ss.tick(timestep);
    }

    paint();
}

window.doForce = doForce;


function forceResize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    paint();
}

function leftpad(str, pad) {
    return String(pad + str).slice(-pad.length);
}

var COLOR = {
    SELECTION: {
        RECTANGLE: gu.color.rgbToHex(100, 100, 255)
    },
    CLEAR: {
        CANVAS: "#ffffff"
    },
    DEFAULT: {
        STROKE_STYLE: "#000000",
        FILL_STYLE: "#000000"
    },
    EDGE: {
        IN: gu.color.rgbToHex(8, 0, 255),
        OUT: gu.color.rgbToHex(109, 172, 227),
        NEAREST_CURSOR: gu.color.rgbToHex(160, 160, 255),
        SELECTED: gu.color.rgbToHex(255, 0, 102),
        DEFAULT: gu.color.rgbToHex(0, 0, 0)
    },
    VERTEX: {
        SELECTED: gu.color.rgbToHex(255, 0, 102),
        ILLUMINATED: gu.color.rgbToHex(160, 160, 255),
        NEAREST_CURSOR_FILL: 'yellow',
        DEFAULT: {
            STROKE: "#003",
            FILL: 'green'
        }
    }
};

function paint() {
    var vertices = graph.getVertexList();
    var edges = graph.getEdgeList();

    var nv = graph.getNearestVertex(mouse.c.x - PANNED_X, mouse.c.y - PANNED_Y);
    var ne = graph.getNearestEdge(mouse.c.x - PANNED_X, mouse.c.y - PANNED_Y);

    var DEFAULT_RADIUS_BOOST = 5;

    // clear canvas
    if (true) {
        ctx.fillStyle = COLOR.CLEAR.CANVAS;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Some reset
    ctx.strokeStyle = COLOR.DEFAULT.STROKE_STYLE;
    ctx.fillStyle = COLOR.DEFAULT.FILL_STYLE

    if (mouse.selection.available && (mouse.r.pressed)) {
        // Draw edge that is being deployed.
        ctx.beginPath();
        ctx.moveTo(mouse.md.x, mouse.md.y);
        ctx.lineTo(mouse.c.x, mouse.c.y);
        ctx.strokeStyle = COLOR.EDGE.DEFAULT;
        ctx.stroke();
    }


    for (var i = 0; i < mouse.selection.list.length; i += 1) {
        // Draw illuminated vertices.
        var vertexID = mouse.selection.list[i];
        var v = graph.vertices[vertexID];
        var x = v.data.x;
        var y = v.data.y;
        var r = v.data.r;
        ctx.beginPath();
        ctx.arc(x - r / 2 + PANNED_X, y - r / 2 + PANNED_Y, 5 + r, 0, TAU, false);
        ctx.fillStyle = COLOR.VERTEX.ILLUMINATED;
        ctx.fill();
    }


    // Draw edges
    for (var i = 0; i < edges.length; i += 1) {
        var e = edges[i];

        var v1 = graph.vertices[e.source];
        var v2 = graph.vertices[e.target];

        //getNearestEdge(mouse.c.x, mouse.c.y, graph);
        var x1 = v1.data.x - v1.data.r / 2 + PANNED_X;
        var y1 = v1.data.y - v1.data.r / 2 + PANNED_Y;

        var x2 = v2.data.x - v2.data.r / 2 + PANNED_X;
        var y2 = v2.data.y - v2.data.r / 2 + PANNED_Y;

        // Selected edge
        var cond1 = mouse.sel.e && mouse.sel.e.id === e.id

        // Remaining, but don't draw over edges above

        var condz = mouse.sel.v;

        var cond3 = (condz) ? (mouse.sel.v.id !== v1.id && mouse.sel.v.id !== v2.id) : true;

        if (cond1) {
            // This illuminates the selected edge.
            var plw = ctx.lineWidth;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            var lineWidth = 4;

            g2d.drawArchedArrow(x1, y1, x2, y2, 15, 15 * Math.PI / 180, v1.data.r);

            ctx.strokeStyle = COLOR.EDGE.SELECTED;
            ctx.fillStyle = COLOR.EDGE.SELECTED;
            ctx.lineWidth = lineWidth;

            ctx.stroke();
            ctx.fill();

            ctx.lineWidth = plw;
        } else if (e.id === ne.id) {
            // This illuminates the edge closest to the cursor.
            var plw = ctx.lineWidth;

            g2d.drawArchedArrow(x1, y1, x2, y2, 15, 15 * Math.PI / 180, v1.data.r);

            ctx.strokeStyle = COLOR.EDGE.NEAREST_CURSOR;
            ctx.fillStyle = COLOR.EDGE.NEAREST_CURSOR;
            ctx.lineWidth = 3;

            ctx.stroke();
            ctx.fill();

            ctx.lineWidth = plw;
        } else if (cond3) {
            // Draws remaining edges.
            g2d.drawArchedArrow(x1, y1, x2, y2, 15, 15 * Math.PI / 180, v1.data.r);
            ctx.strokeStyle = COLOR.EDGE.DEFAULT;
            ctx.fillStyle = COLOR.EDGE.DEFAULT;
            ctx.stroke();
            ctx.fill();
        }
    }

    // Draws edges coming in and out of the selected vertex.
    var plw = ctx.lineWidth;
    if (mouse.sel.v && mouse.sel.v.id) {
        var theVertex = mouse.sel.v;
        for (edgeID in theVertex.edges) {
            if (theVertex.edges.hasOwnProperty(edgeID)) {
                var edge = graph.edges[edgeID];
                var v1 = graph.vertices[edge.source];
                var v2 = graph.vertices[edge.target];

                g2d.drawArchedArrow(
                    v1.data.x - v1.data.r / 2 + PANNED_X,
                    v1.data.y - v1.data.r / 2 + PANNED_Y,
                    v2.data.x - v2.data.r / 2 + PANNED_X,
                    v2.data.y - v2.data.r / 2 + PANNED_Y,
                    15, 15 * Math.PI / 180,
                    v1.data.r
                );

                if (theVertex.id === v1.id) {
                    // outgoing edges
                    ctx.strokeStyle = COLOR.EDGE.OUT;
                    ctx.fillStyle = COLOR.EDGE.OUT;
                } else {
                    // incoming edges
                    ctx.strokeStyle = COLOR.EDGE.IN;
                    ctx.fillStyle = COLOR.EDGE.IN;
                }
                
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fill();
            }
        }
    }
    ctx.lineWidth = plw;


    // Draw vertices
    for (var i = 0; i < vertices.length; i += 1) {

        var v = vertices[i];

        var x = v.data.x;
        var y = v.data.y;
        var r = v.data.r;


        // Draw vertex
        ctx.beginPath();
        ctx.arc(x - r / 2 + PANNED_X, y - r / 2 + PANNED_Y, r, 0, TAU, false);
        ctx.fillStyle = COLOR.VERTEX.DEFAULT.FILL; // COLOR.VERTEX.DEFAULT
        if (i === nv.index) {
            // Closest vertex to the cursor.
            ctx.fillStyle = COLOR.VERTEX.NEAREST_CURSOR_FILL;
        }
        if (mouse.sel.v && mouse.sel.v.id === v.id) {
            // Selected vertex.
            ctx.fillStyle = COLOR.VERTEX.SELECTED;
        }

        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = COLOR.VERTEX.DEFAULT.STROKE
        ctx.stroke();
    }

    if (false && data.closestVertex.index >= 0) {
        // Don't remember...
        ctx.beginPath();
        ctx.arc(mouse.c.x - 2 + PANNED_X, mouse.c.y - 2 + PANNED_Y, 4, 0, 2 * Math.PI, false);
        var satr = 0.5;
        if (data.closestVertex.distance > vertices[data.closestVertex.index].r) {
            satr = 0.2;
        } else {
            satr = 0.9;
        }
        var l1 = hslToRgb(data.closestVertex.index / vertices.length, satr, 0.5);
        ctx.fillStyle = rgbToHex(l1[0], l1[1], l1[2]);
        ctx.fill();
    }


    if (mouse.l.pressed && mouse.selection.available) {
        // Draw selection rectangle.
        var x1 = mouse.md.x;
        var y1 = mouse.md.y;
        var x2 = mouse.c.x;
        var y2 = mouse.c.y;

        var x0 = Math.min(x1, x2);
        var y0 = Math.min(y1, y2);

        var w = Math.abs(x2 - x1);
        var h = Math.abs(y2 - y1);

        // 

        ctx.beginPath();
        ctx.rect(x0, y0, w, h);
        ctx.strokeStyle = COLOR.SELECTION.RECTANGLE;
        ctx.stroke();
    }
}

////////////////////////////////////////////////////////////////////////////////
// END OF FUNCTIONS
////////////////////////////////////////////////////////////////////////////////
// START OF MISCELLANEOUS
////////////////////////////////////////////////////////////////////////////////

window.onresize = forceResize;

////////////////////////////////////////////////////////////////////////////////
// END OF MISCELLANEOUS
////////////////////////////////////////////////////////////////////////////////
// START OF MODULE EXPORT
////////////////////////////////////////////////////////////////////////////////

app.forceResize = forceResize;

module.exports = app;

////////////////////////////////////////////////////////////////////////////////
// END OF MODULE EXPORT
////////////////////////////////////////////////////////////////////////////////

},{"./edge.js":3,"./general-utils.js":4,"./graph.js":5,"./graphics2d.js":6,"./keyboard-controller.js":7,"./mouse-controller.js":9,"./spring-system.js":10,"./vertex.js":12}],3:[function(require,module,exports){

var gu = require('./general-utils.js');

function Edge(edgeId, vertex1, vertex2, graph, data) {
    this.id = edgeId || gu.random.guid();
    this.graph = (typeof graph !== 'undefined') ? graph : null;
    this.data = (typeof data !== 'undefined') ? data : {
        description: ""
    };

    // vertices
    this.source = vertex1;
    this.target = vertex2;
}

Edge.prototype.getOppositeID = function (vertexID) {

    if (this.source === vertexID) {
        return this.target;
    } else if (this.target === vertexID) {
        return this.source;
    } else {
        console.log("Error: " + vertexID);
        return null;
    }
};


module.exports = Edge;

},{"./general-utils.js":4}],4:[function(require,module,exports){
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    } else if (t > 1) {
        t -= 1;
    }

    if (t < 1/6) {
        return p + (q - p) * 6 * t;
    } else if (t < 1/2) {
        return q;
    } else if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
    } else {
        return p;
    }
}

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0){
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {

    var rh = r.toString(16);
    rh = (rh.length < 2) ? "0" + rh : rh;

    var gh = g.toString(16);
    gh = (gh.length < 2) ? "0" + gh : gh;

    var bh = b.toString(16);
    bh = (bh.length < 2) ? "0" + bh : bh;

    return "#" + rh + gh + bh;
}

function hypot(a, b) {
    return Math.sqrt(a * a + b * b);
}

function listOwnObjects(object) {
    var list = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            list.push(object[key]);
        }
    }
    return list;
}

function inRectangularBounds(x, y, x1, y1, x2, y2) {
    var t;

    if (x1 > x2) {
        t = x1;
        x1 = x2;
        x2 = t;
    }

    if (y1 > y2) {
        t = y1;
        y1 = y2;
        y2 = t;
    }

    return (x >= x1 && x <= x2) && (y >= y1 && y <= y2);
}

////////////////////////////////////////////////////////////////////////////

var GeneralUtils = {};

GeneralUtils.random = {};
GeneralUtils.random.s4 = s4;
GeneralUtils.random.guid = guid;

GeneralUtils.color = {};
GeneralUtils.color.hue2rgb = hue2rgb;
GeneralUtils.color.hslToRgb = hslToRgb;
GeneralUtils.color.rgbToHex = rgbToHex;

GeneralUtils.math = {};
GeneralUtils.math.hypot = hypot;

GeneralUtils.misc = {};
GeneralUtils.misc.listOwnObjects = listOwnObjects;

GeneralUtils.geo = {};
GeneralUtils.geo.inRectangularBounds = inRectangularBounds;

module.exports = GeneralUtils;

},{}],5:[function(require,module,exports){

// Program

var gu = require('./general-utils.js');

var Edge = require('./edge.js');
var Vertex = require('./vertex.js');

var Vector = require('./vector.js');

/**
 *
 * @constructor
 */
function Graph(id) {
    this.id = id || gu.random.guid();
    this.edges = {};
    this.vertices = {};

    // Private variables and methods?

    this._edgeList = []; // List of edges belonging to this graph.
    this._vertexList = []; // List of vertices belonging to this graph.
    this._idiophilicVertices = []; // List of idiophilic vertices
    this._autoIdiophilicVertices = [];
}


Graph.prototype.getEdgeList = function () {
    return gu.misc.listOwnObjects(this.edges);
};

Graph.prototype.getVertexList = function () {
    return gu.misc.listOwnObjects(this.vertices);
};

/**
 * Checks whether an edge connects these two vertices.
 *
 * @param vertex1
 * @param vertex2
 */
Graph.prototype.isAdjacent = function (vertex1, vertex2) {};

/**
 * Lists all vertices connected to this vertex.
 *
 * @param vertex
 */
Graph.prototype.getNeighbors = function (vertex) {};

/**
 * Adds a vertex to this graph.
 *
 * @param vertex
 */
Graph.prototype.addVertex = function (vertex) {

    // Create new vertex object if not supplied.
    if (typeof vertex === "undefined") {
        vertex = new Vertex();
    }

    // Adds this vertex to the list of vertices if it isn't already there.
    if (!this.vertices[vertex.id]) {
        this.vertices[vertex.id] = vertex;
        vertex.graph = this;
    }
};

/**
 * Removes a vertex from this graph.  Possibly also just deletes the
 * vertex?
 *
 * @param vertex
 */
Graph.prototype.removeVertex = function (vertex) {

    if (typeof vertex === "string") {

        var id = vertex;
        vertex = this.vertices[id];

        // Iterating through other vertices

        for (var edgeID in vertex.edges) {
            if (vertex.edges.hasOwnProperty(edgeID)) {
                var edge = this.edges[edgeID];
                var vertex2ID = (edge.source !== id) ? edge.source : edge.target;
                var vertex2 = this.vertices[vertex2ID];

                delete vertex.edges[edgeID];
                delete vertex2.edges[edgeID];
                delete this.edges[edgeID];
            }
        }

        delete this.vertices[id];
    }
};

/**
 * Gets vertex object from ID?
 *
 * @param vertex
 */
Graph.prototype.getVertex = function (vertex) {};

/**
 * Adds edge between two vertices.
 *
 * @param vertex1
 * @param vertex2
 */
Graph.prototype.addEdge = function (vertex1, vertex2) {

    var id1 = vertex1.id;
    var id2 = vertex2.id;
    var edgeId = "";

    if (id1 < id2) {
        edgeId = id1 + "." + id2;
    } else {
        edgeId = id2 + "." + id1;
    }

    // Create edge if it doesn't exist.

    if (!this.edges[edgeId]) {
        var edge = new Edge(edgeId, vertex1.id, vertex2.id);
        edge.graph = this;
        this.edges[edgeId] = edge;
        vertex1.edges[edgeId] = true;
        vertex2.edges[edgeId] = true;
    }
};

/**
 * Removes an edge connecting the two vertices.
 *
 * @param vertex1
 * @param vertex2
 */
Graph.prototype.removeEdge = function (vertex1, vertex2) {

    if (typeof vertex1 === "string" && typeof vertex2 === "undefined") {
        var edgeId = vertex1;
        var edge = this.edges[edgeId];

        var v1 = this.vertices[edge.source];
        var v2 = this.vertices[edge.target];

        delete v1.edges[edgeId];
        delete v2.edges[edgeId];
        delete this.edges[edgeId];
    }

};

/**
 * Gets the edge object connecting these two vertices.
 *
 * @param vertex1
 * @param vertex2
 */
Graph.prototype.getEdge = function (vertex1, vertex2) {};

/**
 * Applies this function to each and every vertex in this graph.
 *
 * @param func
 */
Graph.prototype.forEachVertex = function (func) {
    for (var vertexID in this.vertices) {
        if (this.vertices.hasOwnProperty(vertexID)) {
            func(this.vertices[vertexID]);
        }
    }
};

/**
 * Applies this function to each and every edge in this graph.
 *
 * @param func
 */
Graph.prototype.forEachEdge = function (func) {
    for (var edgeID in this.edges) {
        if (this.edges.hasOwnProperty(edgeID)) {
            func(this.edges[edgeID]);
        }
    }
};

Graph.prototype.import = function (json, translate) {
    var key, i;

    translate = translate || false;

    // Remove all vertex objects from this graph
    for (key in this.vertices) {
        if (this.vertices.hasOwnProperty(key)) {
            delete this.vertices[key];
        }
    }

    // Remove all edge objects from this graph
    for (key in this.edges) {
        if (this.edges.hasOwnProperty(key)) {
            delete this.edges[key];
        }
    }

    // Adding vertices
    var vl = json.graph.vertices;
    for (i = 0; i < vl.length; i += 1) {
        var v = vl[i];

        var vid = v.id;
        var vdata = v.data;


        this.vertices[v.id] = new Vertex(vid, this, vdata);
    }

    // Adding edges
    var el = json.graph.edges;
    for (i = 0; i < el.length; i += 1) {
        var e = el[i];
        this.vertices[e.source].edges[e.id] = true;
        this.vertices[e.target].edges[e.id] = true;



        this.edges[e.id] = new Edge(e.id, e.source, e.target, this, e.data);
    }
};

Graph.prototype.export = function (stringify, useDictionary) {

    // ID translation should be optional

    stringify = stringify || false;
    useDictionary = useDictionary || false;

    var key;

    var struct = {
        graph: {
            directed: false,
            type: "graph type",
            vertices: [],
            edges: []
        }
    };

    // Vertex dictionary
    var vdict = {};
    var iter = 1;
    for (key in this.vertices) {
        if (this.vertices.hasOwnProperty(key)) {
            vdict[key] = "v" + iter;
            iter += 1;
        }
    }

    // Edge dictionary
    var edict = {};
    iter = 1;
    for (key in this.edges) {
        if (this.edges.hasOwnProperty(key)) {
            edict[key] = "e" + iter;
            iter += 1;
        }
    }

    // Add vertices
    for (key in this.vertices) {
        if (this.vertices.hasOwnProperty(key)) {
            var vertex = {};

            vertex.id = (useDictionary) ? vdict[key] : key;
            vertex.data = this.vertices[key].data;

            struct.graph.vertices.push(vertex);
        }
    }

    // Add edges
    for (key in this.edges) {
        if (this.edges.hasOwnProperty(key)) {
            var edge = {};

            edge.id = (useDictionary) ? edict[key] : key;
            edge.source = (useDictionary) ? vdict[this.edges[key].source] : this.edges[key].source;
            edge.target = (useDictionary) ? vdict[this.edges[key].target] : this.edges[key].target;
            edge.data = this.edges[key].data;

            struct.graph.edges.push(edge);
        }
    }

    if (stringify) {
        return JSON.stringify(struct);
    } else {
        return struct;
    }
};


Graph.prototype.copy = function (vertexIDs) {

    // Create vertex dictionary
    // Vertex dictionary
    var vdict = {};
    var iter = 1;
    for (var i = 0; i < vertexIDs.length; i += 1) {
        var vertexID = vertexIDs[i];
        var v = this.vertices[vertexID];
        vdict[v.id] = "v" + iter;
        iter += 1;
    }


    // List edges which are connected to these vertices
    var edgesToTake = {};

    for (var key in this.edges) {
        if (this.edges.hasOwnProperty(key)) {
            var edge = this.edges[key];
            if (vdict.hasOwnProperty(edge.source) && vdict.hasOwnProperty(edge.target)) {
                edgesToTake[edge.id] = edge;
            }
        }
    }

    // Translate edges and vertices.

    var vertices = [];
    iter = 1;
    for (var i = 0; i < vertexIDs.length; i += 1) {
        var v = {};
        v.id = "v" + iter;
        v.data = this.vertices[vertexIDs[i]].data;
        vertices.push(v);
        iter += 1;
    }


    var edges = [];
    iter = 1;
    for (var key in edgesToTake) {
        if (edgesToTake.hasOwnProperty(key)) {
            var edge = edgesToTake[key];

            var newEdge = {};
            newEdge.id = "e" + iter;
            newEdge.source = vdict[this.edges[key].source];
            newEdge.target = vdict[this.edges[key].target];

            edges.push(newEdge);
            iter += 1;
        }
    }



    var subgraph = {};
    subgraph.vertices = vertices;
    subgraph.edges = edges;


    return subgraph;
};

Graph.prototype.paste = function (subgraph) {

};

Graph.prototype.standardConfiguration = function (width, height, settings) {

    settings = settings || {};

    console.log(settings);

    var vl = [];

    for (var vertexID in this.vertices) {
        if (this.vertices.hasOwnProperty(vertexID)) {
            var vertex = this.vertices[vertexID];
            vl.push(vertexID);
        }
    }

    var self = this;

    console.log(vl);

    vl.sort(function (vertexID1 ,vertexID2) {
        var vertex1 = self.vertices[vertexID1];
        var vertex2 = self.vertices[vertexID2];

        // Return in ascending order

        return Object.keys(vertex1.edges).length - Object.keys(vertex2.edges).length;
    });

    // Lay vertices into a circle.

    var msg = "";
    for (var i = 0; i < vl.length; i += 1) {
        msg += "v1:" + Object.keys(this.vertices[vl[i]].edges).length + ", "
    }
    console.log(msg);

    var angleIncrement = Math.PI * 2 / vl.length;

    var centerX = width / 2;
    var centerY = height / 2;
    var radius = Math.min(width, height) / 2 - 20;

    console.log(vl);


    for (var i = 0; i < vl.length; i += 1) {

        var angle = angleIncrement * i;

        var vertex = this.vertices[vl[i]];

        var newX = centerX + radius * Math.cos(Math.PI / 2 - angle);
        var newY = centerY - radius * Math.sin(Math.PI / 2 - angle);

        console.log(newX, newY);

        vertex.data.x = newX;
        vertex.data.y = newY;

    }

};

/**
 *
 */
Graph.prototype.getIdiophilicVertices = function () {

    var result = {};

    var list = this.getVertexList();

    var resultList = [];

    console.log(resultList);
    console.log(list);

    for (var i = 0; i < list.length - 1; i += 1) {

        var v1 = list[i];
        var v1k = Object.keys(v1).sort();

        console.log()

        resultList.push([]);
        for (var j = i + 1; j < list.length; j += 1) {
            resultList[i].push(1);

            var v2 = list[j];
            var v2k = Object.keys(v2).sort();



            // Are not idiophilic nor autoidiophilic



            // Is idiophilic

            // Is autoidiophilic


        }
    }

    console.log(resultList);

    return result;
};

Graph.prototype.getAutoIdiophilicVertices = function () {

};

/**
 * TODO fix me
 *
 * This function should work by returning the nearest vertex to the
 * given coorindates.
 *
 * @param x
 * @param y
 * @param graph
 * @returns {*[]} - ID of vertex,
 */
Graph.prototype.getNearestVertex = function (x, y) {
    var idx = -1;
    var cdsq = Number.MAX_VALUE;

    var vertices = this.getVertexList();

    var nv = null;

    for (var i = 0; i < vertices.length; i += 1) {
        var v = vertices[i];
        var dx = v.data.x - x;
        var dy = v.data.y - y;
        var dsq = dx * dx + dy * dy;

        if (dsq < cdsq) {
            idx = i;
            cdsq = dsq;
        }
    }

    if (vertices.length > 0) {
        nv = {
            id: (idx > -1) ? vertices[idx].id : undefined,
            index: idx,
            distance: Math.sqrt(cdsq)
        }
    }

    return nv;
};

/**
 *  TODO fixme
 *
 *  This function should return the nearest edge to the given coordinates
 *
 * @param x
 * @param y
 * @param graph
 * @returns {{id: *, index: number, distance: Number}}
 */
Graph.prototype.getNearestEdge = function (x, y) {
    var idx = -1;
    var cdist = Number.MAX_VALUE;

    var edges = this.getEdgeList();

    var ne = null;

    for (var i = 0; i < edges.length; i += 1) {
        var e = edges[i];

        var sourceID = e.source;
        var targetID = e.target;

        var sourceVertex = this.vertices[sourceID];
        var targetVertex = this.vertices[targetID];

        var x1 = sourceVertex.data.x;
        var y1 = sourceVertex.data.y;

        var x2 = targetVertex.data.x;
        var y2 = targetVertex.data.y;

        var ab = new Vector(x2 - x1, y2 - y1);
        var ap = new Vector(x - x1, y - y1);

        // Vector from the point in between a and b to b.
        var mab = ab.scalar(0.5);

        // A vector from the middle point between a and b and P.
        var mp = new Vector(x - (x2 + x1) / 2, y - (y2 + y1) / 2);

        var proj = mp.project(mab);
        var rej = mp.reject(mab);

        var dist;

        if (proj.length() < mab.length()) {
            // The point is inside the area perpendicular to the line
            // segment.
            dist = rej.length();
        } else {
            var bp = new Vector(x - x2, y - y2);
            dist = Math.min(ap.length(), bp.length());
        }

        if (dist < cdist) {
            idx = i;
            cdist = dist;
        }
    }

    if (edges.length > 0) {
        ne = {
            id: (idx > -1) ? edges[idx].id : undefined,
            index: idx,
            distance: cdist
        }
    }

    return ne;
};

// EXPORT

module.exports = Graph;

},{"./edge.js":3,"./general-utils.js":4,"./vector.js":11,"./vertex.js":12}],6:[function(require,module,exports){


function Graphics2D() {
    this.ctx = null;
}

Graphics2D.prototype.hasContext = function () {
    return this.ctx !== null;
};

Graphics2D.prototype.attachContext = function (ctx) {
    this.ctx = ctx;
};

Graphics2D.prototype.drawArrow = function (x1, y1, x2, y2, arrowHeadLength, arrowHeadArcRadians) {

    var ctx = this.ctx;

    var len = 15;

    // direction
    var dx = x2 - x1;
    var dy = y2 - y1;
    var ul = Math.sqrt(dx * dx + dy * dy);
    dx /= ul;
    dy /= ul;

    // reflect around (0, 0)
    dx = -dx;
    dy = -dy;

    var cosp = Math.cos(arrowHeadArcRadians);
    var sinp = Math.sin(arrowHeadArcRadians);
    
    var cosm = cosp;
    var sinm = -sinp;


    var ux = cosp * dx - sinp * dy;
    var uy = sinp * dx + cosp * dy;

    var vx = cosm * dx - sinm * dy;
    var vy = sinm * dx + cosm * dy;

    var ax1 = x2 + arrowHeadLength * ux;
    var ay1 = y2 + arrowHeadLength * uy;

    var ax2 = x2 + arrowHeadLength * vx;
    var ay2 = y2 + arrowHeadLength * vy;

    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.moveTo(x2, y2);
    ctx.lineTo(ax1, ay1);

    ctx.moveTo(x2, y2);
    ctx.lineTo(ax2, ay2);
};

Graphics2D.prototype.drawLine = function (x1, y1, x2, y2) {
        var ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
};

Graphics2D.prototype.drawArchedArrow = function (x1, y1, x2, y2, 
        arrowHeadLength, arrowHeadArcRadians, radiusTailOffset, radiusHeadOffset) {

    // If an arrow is being point from a vertex to another it should lie on
    // its border, not inside it.
    radiusTailOffset = (typeof radiusTailOffset === "undefined") ? 0 : radiusTailOffset;
    radiusHeadOffset = (typeof radiusHeadOffset === "undefined") ? ( typeof radiusTailOffset !== "undefined" ? radiusTailOffset : 0 ) : radiusHeadOffset;

    var ctx = this.ctx;

    // direction
    var dx = x2 - x1;
    var dy = y2 - y1;
    var ul = Math.sqrt(dx * dx + dy * dy);
    dx /= ul;
    dy /= ul;

    x1 += dx * radiusTailOffset;
    y1 += dy * radiusTailOffset;

    x2 -= dx * radiusHeadOffset;
    y2 -= dy * radiusHeadOffset;

    // reflect around (0, 0)
    dx = -dx;
    dy = -dy;

    var centerAngle = Math.atan2(dy, dx);

    var radius = arrowHeadLength;    
    var startAngle = centerAngle - arrowHeadArcRadians;
    var endAngle = centerAngle + arrowHeadArcRadians;
    var counterclockwise = false;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x2, y2);
    ctx.arc(x2, y2, radius, startAngle, endAngle, counterclockwise);
};



module.exports = Graphics2D;



},{}],7:[function(require,module,exports){

var keyToValue = {
    "backspace": 8,
    "tab": 9,
    "enter": 13,
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "0": 48,
    "1": 49,
    "2": 50,
    "3": 51,
    "4": 52,
    "5": 53,
    "6": 54,
    "7": 55,
    "8": 56,
    "9": 57,
    "a": 65,
    "b": 66,
    "c": 67,
    "d": 68,
    "e": 69,
    "f": 70,
    "g": 71,
    "h": 72,
    "i": 73,
    "j": 74,
    "k": 75,
    "l": 76,
    "m": 77,
    "n": 78,
    "o": 79,
    "p": 80,
    "q": 81,
    "r": 82,
    "s": 83,
    "t": 84,
    "u": 85,
    "v": 86,
    "w": 87,
    "x": 86,
    "y": 89
};

function KeyboardController() {
    this.test = "test";
}

KeyboardController.prototype.getValue = function (key) {
    return keyToValue[key];
};

KeyboardController.prototype.isEqual = function (key, value) {
    return keyToValue[key] === value;
};


KeyboardController.prototype.attachDevice = function (device) {};


KeyboardController.prototype.captureEvent = function (event, callback) {
    var keyCode = event.keyCode;
};

module.exports = KeyboardController;

},{}],8:[function(require,module,exports){

require('../css/reset.css');

require('../less/style.less');


var app = require('./app.js');

app.forceResize();

},{"../css/reset.css":1,"../less/style.less":13,"./app.js":2}],9:[function(require,module,exports){


function MouseController(x, y) {
    x = x || 0;
    y = y || 0;
    this.misc = {};
    // private
    this._ = {
        dragging: false,
        leftPressed: false,
        rightPressed: false,
        coordinates: {
            current: {
                x: this.x,
                y: this.y
            },
            previous: {
                x: this.x,
                y: this.y
            },
            mouseDown: {
                x: this.x,
                y: this.y
            },
            mouseUp: {
                x: this.x,
                y: this.y
            },
            mouseOut: {
                x: this.x,
                y: this.y
            }
        }
    };
}

MouseController.BUTTON = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
}

MouseController.prototype.captureEvent = function (event, callback) {
    var type = event.type;


    if (type === "mousemove") {
        // Update location


    } else if (type === "mousedown") {
    } else if (type === "mouseup") {
    } else if (type === "dbclick") {
    } else if (type === "mouseout") {
    } else if (type === "mousewheel") {
    }
};

MouseController.prototype.setCurrent = function (x, y) {};

MouseController.prototype.isLeftPressed = function () {};

MouseController.prototype.isRightPressed = function () {};

MouseController.prototype.getSelection = function () {};


MouseController.prototype.attachDevice = function (device) {};


module.exports = MouseController;


},{}],10:[function(require,module,exports){


function SpringSystem(graph, preferedLength) {
    this.graph = graph;
    this.preferedLength = preferedLength;
}

SpringSystem.prototype.applyCoulombsLaw = function () {

    var graph = this.graph;

    graph.forEachVertex(function (vertex1) {
        graph.forEachVertex(function (vertex2) {
            if (vertex1.id !== vertex2.id) {
                var dx = vertex1.data.x - vertex2.data.x;
                var dy = vertex1.data.y - vertex2.data.y;


                var distance = Math.sqrt(dx * dx + dy * dy) + 0.1;


                var udx = dx / distance;
                var udy = dy / distance;

                var repulsion = 400;


                var force_1_dx = udx * repulsion / (distance * distance * 0.5);
                var force_1_dy = udy * repulsion / (distance * distance * 0.5);

                var force_2_dx = udx * repulsion / (distance * distance * -0.5);
                var force_2_dy = udy * repulsion / (distance * distance * -0.5);

                // apply force
                vertex1.data.adx += force_1_dx;
                vertex1.data.ady += force_1_dy;

                vertex2.data.adx += force_2_dx;
                vertex2.data.ady += force_2_dy;
            }
        });
    });
};

SpringSystem.prototype.applyHookesLaw = function () {

    var graph = this.graph;
    var preferedLength = this.preferedLength;

    graph.forEachEdge(function (edge) {

        var vertex1 = graph.vertices[edge.source];
        var vertex2 = graph.vertices[edge.target];

        // direction
        var dirX = vertex2.data.x - vertex1.data.x;
        var dirY = vertex2.data.y - vertex1.data.y;

        var displacement = preferedLength - Math.sqrt(dirX * dirX + dirY * dirY);

        // spring constant
        var k = 400;

        vertex1.data.adx += dirX * k * displacement * -0.5;
        vertex1.data.ady += dirY * k * displacement * -0.5;

        vertex2.data.adx += dirX * k * displacement * 0.5;
        vertex2.data.ady += dirY * k * displacement * 0.5;

    });
};

SpringSystem.prototype.attractToCenter = function () {
    var graph = this.graph;
    graph.forEachVertex(function (vertex) {
        var dirX = -vertex.data.x;
        var dirY = -vertex.data.y;

        var repulsion = 400; // 400

        vertex.data.adx += dirX * repulsion / 50;
        vertex.data.ady += dirY * repulsion / 50;

    });
};

SpringSystem.prototype.updateVelocity = function (timestep) {
    var graph = this.graph;
    graph.forEachVertex(function (vertex) {

        var damping = 0.5;

        vertex.data.vdx += vertex.data.adx * timestep;
        vertex.data.vdy += vertex.data.ady * timestep;

        vertex.data.vdx *= damping;
        vertex.data.vdy *= damping;

        vertex.data.adx = 0;
        vertex.data.ady = 0;
    });
};

SpringSystem.prototype.updatePosition = function (timestep) {
    var graph = this.graph;
    graph.forEachVertex(function (vertex) {
        vertex.data.x += vertex.data.vdx * timestep;
        vertex.data.y += vertex.data.vdy * timestep;
    });
};

SpringSystem.prototype.tick = function (timestep) {
    this.applyCoulombsLaw();
    this.applyHookesLaw();
    this.attractToCenter();
    this.updateVelocity(timestep);
    this.updatePosition(timestep);
};


module.exports = SpringSystem;

},{}],11:[function(require,module,exports){
/**
 *
 * @param {number|Array} components
 * @constructor
 */
function Vector(components) {

    if (!Array.isArray(components)) {
        var comp = new Array(arguments.length);
        for (var i = 0; i < comp.length; i += 1) {
            comp[i] = arguments[i];
        }
        components = comp;
    }

    this.c = components || [];
}


/**
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.neg = function (that) {
    var c = new Array(Math.max(this.c.length, that.c.length));
    for (var i = 0; i < c.length; i += 1) {
        c.push(-this.c[i]);
    }
    return new Vector(c);
};


/**
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.sub = function (that) {
    var c = new Array(Math.max(this.c.length, that.c.length));
    for (var i = 0; i < c.length; i += 1) {
        c[i] = this.c[i] - that.c[i];
    }
    return new Vector(c);
};


/**
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.add = function (that) {
    var c = new Array(Math.max(this.c.length, that.c.length));
    for (var i = 0; i < c.length; i += 1) {
        c[i] = this.c[i] + that.c[i];
    }
    return new Vector(c);
};


/**
 *
 * @param {number} s
 * @returns {Vector}
 */
Vector.prototype.scalar = function (s) {
    var c = new Array(this.c.length);
    for (var i = 0; i < c.length; i += 1) {
        c[i] = this.c[i] * s;
    }
    return new Vector(c);
};


/**
 *
 * @param {Vector} that
 * @returns {number}
 */
Vector.prototype.dot = function (that) {
    var len = Math.max(this.c.length, that.c.length);
    var sum = 0;
    for (var i = 0; i < len; i += 1) {
        sum += this.c[i] * that.c[i];
    }
    return sum;
};


/**
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.cross = function (that) {
    // TODO works only for 3-vector

    var c = [
        this.c[1] * that.c[2] - this.c[2] * that.c[1],
        this.c[2] * that.c[0] - this.c[0] * that.c[2],
        this.c[0] * that.c[1] - this.c[1] * that.c[0]
    ];

    return new Vector(c);
};


/**
 *
 * @returns {number}
 */
Vector.prototype.length = function () {
    var sum = 0;
    for (var i = 0; i < this.c.length; i += 1) {
        sum += this.c[i] * this.c[i];
    }

    return Math.sqrt(sum);
};


/**
 *
 * @returns {Vector}
 */
Vector.prototype.unit = function () {
    var c = new Array(this.c.length);
    var len = this.length();
    for (var i = 0; i < c.length; i += 1) {
        c[i] = this.c[i] / len;
    }
    return new Vector(c);
};


/**
 *
 * @returns {number}
 */
Vector.prototype.dimensions = function () {
    return this.c.length;
};


/**
 * Vector Projection
 *
 * Projects `this' vector onto `that' vector
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.project = function (that) {
    return that.scalar(this.dot(that) / that.dot(that));
};


/**
 * Vector Rejection
 *
 * Rejects `this' vector from `that' vector
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.reject = function (that) {
    return this.sub(this.project(that));
};


/**
 * Vector reflection.
 *
 * This vector is the reflector vector and that is the reflected vector.
 *
 * @param {Vector} that
 * @returns {Vector}
 */
Vector.prototype.reflect = function (that) {
    return that.sub(this.project(that).scalar(2));
};


/* --- Static shit --- */

/**
 *
 * @param p0 - any point on the plane
 * @param l0 - is a point on the line
 * @param n - normal vector to the plane
 * @param l - vector in the direction of the line
 */
Vector.linePlaneIntersection = function (p0, l0, n, l) {
    var d = p0.sub(l0).dot(n) / (l.dot(n));
};


module.exports = Vector;
},{}],12:[function(require,module,exports){

var gu = require('./general-utils.js');

function Vertex(id, graph, data) {
    this.id = (typeof id !== 'undefined') ? id : gu.random.guid();
    this.graph = (typeof graph !== 'undefined') ? graph : null;
    this.data = (typeof data !== 'undefined') ? data : {
        description: ""
    };
    this.edges = {};
}

module.exports = Vertex;



},{"./general-utils.js":4}],13:[function(require,module,exports){
(function() { var head = document.getElementsByTagName('head')[0]; var style = document.createElement('style'); style.type = 'text/css';var css = ".layout{position:absolute;top:0;left:0;right:0;bottom:0;box-sizing:border-box;-webkit-box-sizing:border-box;-moz-box-sizing:border-box}.layout.main{min-width:600px;min-height:400px}.layout.main>.layout.top{height:40px;bottom:auto}.layout.main>.layout.left,.layout.main>.layout.center,.layout.main>.layout.right{top:40px}.layout.main>.layout.left{width:373px;right:auto}.layout.main>.layout.center{left:373px}.layout.main>.layout.bottom{height:40px;top:auto}.layout.main>.layout.left,.layout.main>.layout.center,.layout.main>.layout.right{bottom:40px}.layout.main>.layout.right{width:calc(100% - 373px);left:auto}.layout.main>.layout.center{right:calc(100% - 373px)}.layout.main>.layout.top{background-color:#999;border-bottom:1px solid #666}.layout.main>.layout.right{background-color:#999;border-left:1px solid #666}.layout.main>.layout.left{background-color:#ccc}.layout.main>.layout.bottom{background-color:#999;border-top:1px solid #666}.layout.main>.layout.center{background-color:#fff}#canvas{width:100%;height:100%;margin:0;padding:0}.button{font:bold 11px Arial;text-decoration:none;background-color:#EEEEEE;color:#333333;display:inline-block;padding:6px 12px 6px 12px;cursor:pointer;border:1px solid #aaa}input[type=\"file\"]{display:none}#export:active{background-color:#ccc;border:1px solid #000}#label-input:active{background-color:#ccc}.no-drag{user-drag:none;user-select:none;-moz-user-select:none;-webkit-user-drag:none;-webkit-user-select:none;-ms-user-select:none}.custom-file-upload{font:bold 11px Arial;text-decoration:none;background-color:#eee;color:#333;padding:6px;border:1px solid #ccc;display:inline-block;cursor:pointer;border:1px solid #aaa}html,body{padding:0;margin:0;width:100%;height:100%;background-color:dimgray}body{height:100%}canvas{padding:0;margin:0;cursor:crosshair}div{margin:0;padding:0}.wrapper{width:100%;min-width:780px;min-height:100%;height:auto !important;height:100%}.header{height:50px;background:red}.middle{width:100%;padding:0;position:relative}.middle:after{display:table;clear:both;position:relative}.center{background:blue;width:100%;float:left;overflow:hidden}.left-sidebar{float:left;width:250px;background:green}.right-sidebar{background:yellow}.footer{margin:-100px auto 0;min-width:1000px;height:100px;position:relative;background:cyan}.textbox{border:1px solid black;background-color:white;height:32px;width:100%}.button{font:bold 11px Arial;text-decoration:none;background-color:#EEEEEE;color:#333333;padding:2px 6px 2px 6px;border-top:1px solid #CCCCCC;border-right:1px solid #333333;border-bottom:1px solid #333333;border-left:1px solid #CCCCCC;border:1px solid #ccc;display:inline-block;padding:6px 12px;cursor:pointer}input[type=\"file\"]{display:none}#export:active{background-color:#ccc}#label-input:active{background-color:#ccc}.no-drag{user-drag:none;user-select:none;-moz-user-select:none;-webkit-user-drag:none;-webkit-user-select:none;-ms-user-select:none}.custom-file-upload{font:bold 11px Arial;text-decoration:none;background-color:#eee;color:#333;padding:2px 6px 2px 6px;border-top:1px solid #ccc;border-right:1px solid #333;border-bottom:1px solid #333;border-left:1px solid #ccc;border:1px solid #ccc;display:inline-block;padding:6px 12px;cursor:pointer}";if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style);}())
},{}],14:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }
        
        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            head.appendChild(style);
        } else if (style.styleSheet) { // for IE8 and below
            head.appendChild(style);
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            head.appendChild(style);
        }
    }
};

},{}]},{},[8]);
