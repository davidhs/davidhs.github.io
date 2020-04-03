import { LZString } from './lz-string.js';


function deflate(obj, is_string = false) {

    // Make sure obj at this point is obj.  Clone object.

    if (is_string) {
        obj = JSON.parse(obj);
    } else {
        obj = JSON.parse(JSON.stringify(obj));
    }

    

    let next_number = 1;

    const key_to_number = {};
    const number_to_key = {};

    // Acquire dictionary information
    // Breath-first

    const Q = [obj];

    while (Q.length > 0) {
        const node = Q.pop();

        const is_array = Array.isArray(node);

        const is_object = (typeof node === "object") && !is_array;

        let pass = (is_array || is_object) && (node !== null && typeof node !== "undefined");

        if (!pass) {
            continue;
        }

        Object.keys(node).forEach((key) => {

            if (is_object) {
                if (!key_to_number.hasOwnProperty(key)) {
                    key_to_number[key] = next_number;
                    next_number += 1;
                }

            }

            const child = node[key];
            Q.unshift(child);
        }
        );

    }

    Object.keys(key_to_number).forEach((key) => {
        const value = key_to_number[key];

        if (!number_to_key.hasOwnProperty(value)) {
            number_to_key[value] = key;
        }
    }
    );

    // Rewrite object keys.

    while (Q.length > 0) {
        Q.pop();
    }

    Q.push(obj);

    while (Q.length > 0) {
        const node = Q.pop();

        const is_array = Array.isArray(node);

        const is_object = (typeof node === "object") && !is_array;

        let pass = (is_array || is_object) && (node !== null && typeof node !== "undefined");

        if (!pass) {
            continue;
        }

        // Walk children.

        // Add children.
        Object.keys(node).forEach((key) => {
            const child = node[key];
            Q.unshift(child);
        }
        );

        // Translate keys
        if (is_object) {
            Object.keys(node).forEach((key) => {
                const translated_key = key_to_number[key];
                const value = node[key];
                delete node[key];
                node[translated_key] = value;
            }
            );

        }

    }

    const bundle = {
        dict: number_to_key,
        obj: obj
    };

    const json_string = JSON.stringify(bundle);
    const compressed_code = LZString.compressToBase64(json_string);

    return compressed_code;
}

/**
 * 
 * @param {*} deflated_obj 
 */
function inflate(compressed_code) {

    // assert(is string)

    const uncompressed_code = LZString.decompressFromBase64(compressed_code);

    const bundle = JSON.parse(uncompressed_code);

    const dict = bundle.dict;
    const obj = bundle.obj;

    const Q = [obj];

    while (Q.length > 0) {
        const node = Q.pop();

        const is_array = Array.isArray(node);

        const is_object = (typeof node === "object") && !is_array;

        let pass = (is_array || is_object) && (node !== null && typeof node !== "undefined");

        if (!pass) {
            continue;
        }

        // Add children.
        Object.keys(node).forEach((key) => {
            const child = node[key];
            Q.unshift(child);
        }
        );

        // Translate keys
        if (is_object) {
            Object.keys(node).forEach((key) => {
                const translated_key = dict[key];
                const value = node[key];
                delete node[key];
                node[translated_key] = value;

            }
            );

        }

    }




    return obj;
}



export { deflate, inflate };

