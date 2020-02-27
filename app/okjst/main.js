import GrowthQueue from './GrowthQueue.js';


// TODO Redefinition of 'global', what?
let global = (() => {
    return window;
})();


var body = document.getElementsByTagName('body')[0];

let queue = new GrowthQueue();

// Source code
var ta = document.getElementById('tasource');
var ta2 = document.getElementById('tainput');
var ta3 = document.getElementById('taoutput'); 


let btn = document.getElementById('process');




btn.onclick = (e) => {
    ta3.value = "";
    var sourceCode = ta.value;
    var inputText = ta2.value;
    
    queue.setList(inputText.split('\n'));

    // I know, I know.
    eval(sourceCode);
};




function _ptc(t) {
    ta3.value = ta3.value + t + "\n";
}


function readline() {
    return queue.pop();
}

var old = {
    log: console.log,
    print: print
}

console.log = _ptc;
print = _ptc;
