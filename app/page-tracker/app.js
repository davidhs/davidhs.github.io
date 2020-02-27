

var MIN_PAGE_NR = 1;
var MAX_PAGE_NR = 100;



function parse() {
    
    var ta = document.getElementById('input');

    var tokens = ta.value.replace(/ /g, '');
    var terms = tokens.split(',');
    for (var i = 0; i < terms.length; i += 1) {
        var term = terms[i];

        if (term.includes('{')) {
            var st = term.replace(/[\{|\}]/g, '').split('-');
            MIN_PAGE_NR = parseInt(st[0]);
            MAX_PAGE_NR = parseInt(st[1]);
        } else {
            var range = term.split('-');
            if (range.length > 1) {
                for (var j = 0; j < range.length; j += 1) {
                    range[j] = parseInt(range[j]) - MIN_PAGE_NR;
                }
                terms[i] = range;
            } else {
                terms[i] = parseInt(terms[i]) - MIN_PAGE_NR;
            }
        }
    }

    var l = new Array(MAX_PAGE_NR - MIN_PAGE_NR + 1);
    for (var i = 0; i < l.length; i += 1) {
        l[i] = 0;
    }

    // Saturate
    for (var i = 0; i < terms.length; i += 1) {
        var term = terms[i];
        if (typeof term === "number") {
            // Number
            l[term] += 1;
        } else {
            // range
            var a = term[0];
            var b = term[1];
            for (var j = a; j <= b; j += 1) {
                l[j] += 1;
            }
        }
    }
    
    console.log(l);
    console.log(l.length);
    console.log(MIN_PAGE_NR, MAX_PAGE_NR, MAX_PAGE_NR - MIN_PAGE_NR + 1);

    return l;
}


function color(list) {

    var out = document.getElementById('out');
    while (out.firstChild) {
        out.removeChild(out.firstChild);
    }

    var min = Math.min.apply(null, list);
    var max = Math.max.apply(null, list);

    var diff = max - min;

    if (diff === 0) {
        diff = 1;
    }


    var idx1 = 0;
    var idx2 = 0;
    var v = list[idx1];
    var done = false;

    for (var i = 1; i < list.length; i += 1) {
        var value = list[i];

        if (value === v) {
            idx2 = i;
        } else {

            var span = document.createElement('span');

            var magnitude = (v - min) / diff;

            var mf = Math.round(magnitude * 138);


            var r = 240 - mf;
            var g = 240 - mf * 0.7;
            var b = 240 - mf * 0.38;

            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);

            span.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
            var msg = "";
            for (var j = idx1; j <= idx2; j += 1) {
                msg += (j + MIN_PAGE_NR) + ((j < list.length-1) ? ", " : "")
            }
            span.innerHTML = msg;
            out.appendChild(span);

            idx1 = i;
            idx2 = i;
            v = value;
        }
    }

    if (true) {

        var span = document.createElement('span');

        
        var magnitude = (v - min) / diff;

        var mf = Math.round(magnitude * 138);



        var r = 240 - mf;
        var g = 240 - mf * 0.7;
        var b = 240 - mf * 0.38;

        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);

        span.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
        var msg = "";
        for (var j = idx1; j <= idx2; j += 1) {
            msg += (MIN_PAGE_NR + j) +((j < list.length-1) ? ", " : "")
        }
        span.innerHTML = msg;
        out.appendChild(span);
    }
}



