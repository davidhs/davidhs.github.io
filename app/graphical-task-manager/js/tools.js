


// stuff gets merged into source object
// s: source object
// t: target object
// Stuff in source object gets replaced with stuff from
// target object.
// Destructive replacement.
function mergeObjects(s, t) {
    if (Array.isArray(t)) {
        const t_keys = Object.keys(t);
        for (let i = 0; i < t_keys.length; i += 1) {

            const t_key = t_keys[i];
            const t_value = t[t_key];

            if (!s[t_key]) {
                s[t_key] = t_value;
            } else {
                const s_value = s[t_key];
                if (Array.isArray(s_value) || typeof s_value === "object") {
                    mergeObjects(s_value, t_value);
                } else {
                    s[t_key] = t_value;
                }
            }
        }

    } else if (typeof t !== "object") {
        s = t;
    } else {
        const t_keys = Object.keys(t);
        for (let i = 0; i < t_keys.length; i += 1) {
            const t_key = t_keys[i];
            const t_value = t[t_key];

            if (!s[t_key]) {
                s[t_key] = t_value;
            } else {
                const s_value = s[t_key];
                if (Array.isArray(s_value) || typeof s_value === "object") {
                    mergeObjects(s_value, t_value);
                } else {
                    s[t_key] = t_value;
                }
            }
        }
    }

    return s;
}


const generateUniqueID = ((number_of_symbols) => {


    const lower_case_letters = "abcdefghijklmnopqrstuvwxyz";
    const upper_case_letters = lower_case_letters.toUpperCase();
    const decimal_digits = "0123456789";


    const first_letter_alphabet = (lower_case_letters + upper_case_letters).split("");
    const alphabet = (lower_case_letters + upper_case_letters + decimal_digits).split("");

    function generateUniqueID() {

        let id = "";

        if (number_of_symbols > 0) {
            // First symbol
            const idx = Math.floor(Math.random() * first_letter_alphabet.length);
            const symbol = first_letter_alphabet[idx];
            id += symbol;
        }
        
        for (let i = 1; i < number_of_symbols; i += 1) {
            const idx = Math.floor(Math.random() * alphabet.length);
            const symbol = alphabet[idx];
            id += symbol;
        }
        
        return id;
    }

    return generateUniqueID;
})(8);


export { mergeObjects, generateUniqueID };

