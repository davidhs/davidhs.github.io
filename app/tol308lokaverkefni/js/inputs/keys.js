'use strict';

/* global document window :true */

// =================
// KEYBOARD HANDLING
// =================

const g_keys = [];


function handleKeydown(evt) {
  // Prevent browser scrolling down when pressing SPACE
  if (evt.keyCode === 32 && evt.target === document.body) {
    evt.preventDefault();
  }

  g_keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
  g_keys[evt.keyCode] = false;
}

// A tiny little convenience function
function keyCode(keyChar) {
  return keyChar.charCodeAt(0);
}


// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
  const isDown = g_keys[keyCode];
  g_keys[keyCode] = false;
  return isDown;
}


window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);
