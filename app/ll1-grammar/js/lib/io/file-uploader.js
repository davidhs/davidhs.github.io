


const dom_input_files = document.createElement('input');
dom_input_files.type = "file";
dom_input_files.multiple = true;


let active = false;

const fr = new FileReader();


const queue = [];


const IS_FILE_TYPE_TEXT = {
    "application/json": true
    , "text/plain": true
};


let count = 0;

let current_callback = null;

let the_files = null;


dom_input_files.onchange = evt => {

    if ('files' in dom_input_files) {

        const files = dom_input_files.files;        

        if (files.length > 0) {
            count = files.length;
            the_files = [];
            for (let i = 0; i < files.length; i += 1) {
                const file = files[i];

    
                if (IS_FILE_TYPE_TEXT[file.type]) {
                    const fr = new FileReader();
                    fr.onload = e => {
                        const contents = e.target.result;
                        the_files.push(contents);

                        count -= 1;

                        if (count === 0) {
                            finalize();
                        }
                    };
                    fr.readAsText(files.item(i));
                } else {
                    throw "Type not supported! " + file.type;
                }
            }
        } else {
            finalize();
        }
    } else {
        finalize();
    }
};

function finalize() {

    const callback = current_callback;
    const files = the_files;

    active = false;

    current_callback = null;
    the_files = null;
    count = 0;

    callback(files);
}


function upload(callback) {

    if (active) return;

    current_callback = callback;
    active = true;

    dom_input_files.click();
};


export { upload };
