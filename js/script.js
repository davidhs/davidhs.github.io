"use strict";


var load = (function () {

  /** @type {{ [key: number]: string }} */
  const _cache = {};
  const paths = [
    "html/about.html",
    "html/software.html"
  ];

  /**
   * 
   * @param {number} pathNr 
   */
  function load(pathNr) {

    if (pathNr in _cache) {
      document.getElementById("inner").innerHTML = _cache[pathNr];
      return;
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (!(this.readyState == 4 && this.status == 200)) return;

      _cache[pathNr] = this.responseText;

      document.getElementById("inner").innerHTML = this.responseText;
    };
    xhttp.open("GET", paths[pathNr], true);
    xhttp.send();
  }

  return load;
})();


load(0);
