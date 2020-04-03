'use strict';

/* global Audio g_muted :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =============
// AUDIO MANAGER
// =============

// The audio manager is responsible for playing sounds.  Currently plays sounds
// whos URL is passed to the play "method".
//
// Later on the URL might take position and occlusion map as parameter to
// modify the sound, e.g. sound that is farther away isn't as loud,  sound
// that is blocked by some corner or "outside" is muffled.
// d s
// NB: if it caches audio, then it doesn't do it for very long...
const audioManager = (function () {
  const aa = {};

  let muted = false;

  const audioCtx = new AudioContext();


  // Create a compressor node
  // Totally not stolen code
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0;
  compressor.release.value = 0.25;
  compressor.connect(audioCtx.destination);

  function mute() {
    if (muted) return;
    muted = true;
    console.log('muted');

    for (let i = 0, urls = Object.keys(aa); i < urls.length; i += 1) {
      const url = urls[i];
      const audioList = aa[url];
      for (let j = 0; j < audioList.length; j += 1) {
        const audio = audioList[j];
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
        }
      }
    }
  }

  function unmute() {
    if (!muted) return;
    muted = false;
    console.log('unmuted');
  }

  function play(url) {
    let buffer;

    if (g_muted) {
      if (!muted) mute();
      return null;
    }

    if (muted) unmute();

    // Fix this.
    const audioNames = Object.keys(g_url.audio);
    for (let i = 0; i < audioNames.length; i += 1) {
      const audioName = audioNames[i];
      const _url = g_url.audio[audioName];
      if (_url === url) {
        buffer = g_asset.raw.audio[audioName];
        break;
      }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(compressor);
    source.start();

    return source;
  }


  // Expose properties and functions.
  return {
    play,
    debug: aa,
    ctx: audioCtx,
    isMuted: () => {
      return muted;
    }
  };
}());
