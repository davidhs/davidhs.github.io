
import { leftPad, rightPad } from './utils-string.js';

// Assumes unix time in milliseconds

// Usage: x = unixTimeToString(unixTime);
// Pre:   unixTime is a number, here the number of milliseconds since 
//        00:00 1. Jan. 1970.
// Post:  x is a string
function unixTimeToString(unixTime) {
    // seconds
    const seconds = Math.floor(unixTime / (1000)) % 60;
    // minutes
    const minutes = Math.floor(unixTime / (1000 * 60)) % 60;
    // hours
    const hours = Math.floor(unixTime / (1000 * 60 * 60)) % 24;
    // days
    const days = Math.floor(unixTime / (1000 * 60 * 60 * 24));
    
    const str = days + " " + leftPad(hours, 2, "0") + ":" + 
      leftPad(minutes, 2, "0") + ":" + leftPad(seconds, 2, "0");
    
    return str;
}

function getISODate(d) {

    const year = ("" + d.getFullYear()).padStart(4, ' ');;
    const month = ("" + (d.getMonth() + 1)).padStart(2, '0');
    const day = ("" + d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// Usage: x = unixTimeToString(unixTime);
// Pre:   unixTime is a number, here the number of milliseconds since 
//        00:00 1. Jan. 1970.
// Post:  x is a string
function unixTimeToStringMS(unixTime) {

    const t = unixTime;

    const milliseconds = t % 1000;
    // seconds
    const seconds = Math.floor(t / (1000)) % 60;
    // minutes
    const minutes = Math.floor(t / (1000 * 60)) % 60;
    // hours
    const hours = Math.floor(t / (1000 * 60 * 60)) % 24;
    // days
    const days = Math.floor(t / (1000 * 60 * 60 * 24));


    const day = ("" + days).padStart(1, '0');

    const h = ("" + hours).padStart(2, '0');
    const m = ("" + minutes).padStart(2, '0');;
    const s = ("" + seconds).padStart(2, '0');;

    const ms = ("" + milliseconds).padStart(4, '0');;

    return `${day} ${h}:${m}:${s}.${ms}`;
}

// Usage: ...
// Pre:   ...
// Post:  ...
const timestamp = d => {
    
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    
    const ms = d.getMilliseconds();
    
    const str = `${year} - ${month} - ${day} ${hour} : ${minute} : ${second} . ${ms}`;
    
    return str;
};


function getISODateString(d) {

    d = typeof d !== 'undefined' ? d : new Date();

    if (typeof d === 'number') {
        d = new Date(d);
    }

    const year = ("" + d.getFullYear()).padStart(4, ' ');;
    const month = ("" + (d.getMonth() + 1)).padStart(2, '0');
    const day = ("" + d.getDate()).padStart(2, '0');

    const h = ("" + d.getHours()).padStart(2, '0');
    const m = ("" + d.getMinutes()).padStart(2, '0');;
    const s = ("" + d.getSeconds()).padStart(2, '0');;

    const ms = ("" + d.getMilliseconds()).padStart(4, '0');;

    return `${year}-${month}-${day} ${h}:${m}:${s}.${ms}`;
}


function getCondensedDateString(d) {

    d = typeof d !== 'undefined' ? d : new Date();

    if (typeof d === 'number') {
        d = new Date(d);
    }

    const year = ("" + d.getFullYear()).padStart(4, ' ');;
    const month = ("" + (d.getMonth() + 1)).padStart(2, '0');
    const day = ("" + d.getDate()).padStart(2, '0');

    const h = ("" + d.getHours()).padStart(2, '0');
    const m = ("" + d.getMinutes()).padStart(2, '0');;
    const s = ("" + d.getSeconds()).padStart(2, '0');;

    const ms = ("" + d.getMilliseconds()).padStart(4, '0');;

    return `${year}-${month}-${day}-${h}${m}${s}`;
}



export { 
    timestamp
    , unixTimeToString
    , getISODateString
    , getCondensedDateString
    , unixTimeToStringMS
    , getISODate
};
