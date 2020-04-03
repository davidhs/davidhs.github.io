var wordList = [
    'cleanse',
    'grouped',
    'gaining',
    'wasting',
    'dusters',
    'letting',
    'endings',
    'fertile',
    'seeking',
    'certain',
    'stating',
    'bandits',
    'wanting',
    'parties',
    'waiting',
    'station',
    'maliase',
    'monster'
];

function sim(s1, s2) {
    if (s1.length === s2.length) {
        var count = 0;
        for (var i = 0; i < s1.length; i += 1) {
            if (s1[i] === s2[i]) {
                count += 1;
            }
        }
        return count;
    } else {
        return -1;
    }
}

// choose word with greatest variation
function cwwgw(list) {

    var buffer = new Array(list[0].length);

    var index = 0;
    var value = Number.MAX_VALUE;

    for (var i = 0; i < list.length; i += 1) {
        for (var k = 0; k < buffer.length; k += 1) {
            buffer[k] = 0;
        }
        for (var j = 0; j < list.length; j += 1) {
            if (j === i) {
                continue;
            }
            var d = sim(list[i], list[j]);
            buffer[d] += 1;
        }
        var distance = 0;
        for (var w = 0; w < buffer.length; w += 1) {
            distance += buffer[w] * buffer[w];
        }
        //console.log(buffer, distance);
        if (distance < value) {
            index = i;
            value = distance;
        }
    }

    return index;
}

function getFilteredList(idx, list, distance) {
    var newList = [];
    for (var i = 0; i < list.length; i += 1) {
        if (i === idx) {
            continue;
        }
        var s = sim(list[idx], list[i]);
        if (s === distance) {
            newList.push(list[i]);
        }
    }
    return newList;
}

function playground() {


    var choiceIndex = 5;
    var choiceWord = wordList[choiceIndex];

    console.log('Winning word:', choiceWord)

    var MAX_ITERATION = 12;
    var ITERATION = 0;
    var SOLVED = false;

    var l = wordList.slice();

    var WORD_LENGTH = choiceWord.length;



    while (!SOLVED && ITERATION < MAX_ITERATION) {

        var idx = cwwgw(l);
        var w = l[idx];
        var d = sim(w, choiceWord);

        if (d === WORD_LENGTH) {
            SOLVED = true;
        } else {
            l = getFilteredList(idx, l, d);
            console.log(w, d, l);
        }



        ITERATION += 1;
    }



}
//playground();

// time stamps
var taS = new Date().getTime(); // new Date().getTime()
var iaS = new Date().getTime();
var initial = true;

var timeout = 750; // milliseconds


var ta2 = document.getElementById('ta2');

var textarea = document.getElementById('ta1');
textarea.style.backgroundColor = '#efe';
textarea.addEventListener('keyup', function (event) {
    inProgress = false;

    textarea.style.backgroundColor = '#fee';
    initial = true;
    taS = new Date().getTime() + timeout;
    setTimeout(process, timeout);
});

var chooseDiv = document.getElementById('choice');

var inputarea = document.getElementById('chin');
inputarea.style.backgroundColor = '#fee';
inputarea.addEventListener('keypress', function (event) {

    if (event.charCode === 13) {
        if (inProgress) {
            var val = inputarea.value;
            var v = parseInt(val);

            if (!isNaN(v)) {
                inputarea.style.backgroundColor = '#efe';

                var distance = v;


                wordList = getFilteredList(THE_IDX, wordList, distance);
                furtherProcess();


            } else {
                inputarea.style.backgroundColor = '#fcc';
            }
        }
    }
});

setTimeout(process, timeout);

var inProgress = false;

function process() {

    var time = new Date().getTime();
    if (time < taS) {
        setTimeout(process, timeout);
    } else {
        if (initial) {
            initial = false;
            textarea.style.backgroundColor = '#efe';

            // Get list
            var v = textarea.value;
            v = v.trim();
            v = v.split(/\n| /);

            var everythingFits = true;

            var l = v[0].length;
            for (var i = 1; i < v.length; i += 1) {
                if (v[i].length !== l) {
                    textarea.style.backgroundColor = '#fcc';
                    i = v.length;
                    everythingFits = false;
                }
            }

            if (everythingFits && v[0] !== "") {
                wordList = v;
                inProgress = true;

                furtherProcess();
            }
        }
    }
}

var THE_IDX = -1;

function _process() {

}

function furtherProcess() {

    THE_IDX = cwwgw(wordList);
    var w = wordList[THE_IDX];
    //console.log(wordList);

    var msg = "";
    for (var i = 0; i < wordList.length; i += 1) {
        msg += wordList[i] + '\n';
    }
    ta2.innerText = msg;



    chooseDiv.innerHTML = "Choose: " + w;
}






