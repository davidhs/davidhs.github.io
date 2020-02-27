

function leftPad(string, size, pad) {

    string = "" + string;

    return pad.repeat((size - string.length) / pad.length) + string;
}


function formatTime(time) {

    let s = "";

    const milliseconds = Math.floor(time % 1000)
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor(time / 1000 / 60 / 60); 

    s += hours;
    s += ":";
    s += leftPad(minutes, 2, "0");
    s += ":";
    s += leftPad(seconds, 2, "0");
    s += ".";
    s += leftPad(milliseconds, 3, "0");

    return s;
}


function formatDate(time) {

    const d = new Date(time);


    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    const millisecond = d.getMilliseconds();


    let s = "";

    s += year;
    s += "-";
    s += leftPad(month, 2, "0");
    s += "-";
    s += leftPad(day, 2, "0");

    s += " ";

    s += leftPad(hour, 2, "0");
    s += ":";
    s += leftPad(minute, 2, "0");
    s += ":";
    s += leftPad(second, 2, "0");
    s += ".";
    s += leftPad(millisecond, 3, "0");


    return s;
}


export { leftPad, formatTime, formatDate };
