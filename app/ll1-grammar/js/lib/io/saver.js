
const el_a = document.createElement('a');

let root_data_string = "";
let root_filename    = "";

const queue = [];
let running = false;

el_a.onclick = evt => {
    el_a.href = "data:text/json;charset=utf-8," + encodeURIComponent(root_data_string);
    el_a.download = root_filename;
};

// Usage: run();
// Pre:   saves all the "files" that are in the queue.
// Post:  once done, should have saved all the files in the queue.
function run() {

    running = true;

    while (queue.length > 0) {
        const item = queue.shift();
        root_data_string = item.string;
        root_filename    = item.filename;
        el_a.click();
    }

    running = false;
}

// PUBLIC

// Usage: save(string, filename);
// Pre:   `string` is a string that will be written to a a file,
//        `filename` is a string that is the filename of the file. 
// Post:  saves a file to your computer with the file name `filename`
//        with the content in `string`.  Usually this downloads to your
//        download directory.
function save(string, filename) {

    queue.push({ string, filename });

    if (!running) {
        run();
    }
}


export { save };
