'use strict';

/* global document :true */

/* eslint prefer-const: [0] */

/* jshint browser: true, devel: true, globalstrict: true */

// Global variables?

// Game specific globals.

// =======
// GLOBALS
// =======

const g_canvas = document.getElementById('myCanvas');
const g_ctx = g_canvas.getContext('2d');


// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//
const NOMINAL_UPDATE_INTERVAL = 1000 / 60;

// Multiply by this to convert seconds into "nominals"
const SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

// ========
// KEYBOARD
// ========

const TOGGLE_NOCLIP = 'K'.charCodeAt(0);
let g_noClip = false;


// NOT CONSTANTS
// NOT CONSTAN
const TOGGLE_MUTED = 'M'.charCodeAt(0);
let g_muted = false;
