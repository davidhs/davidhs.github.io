import { assert } from '../utils/utils.js';


const UNKNOWN_TYPE = "UNKNOWN";


class Lexer {

    constructor (rules) {
        this._rules = rules;
        this.UNKNOWN_TYPE = UNKNOWN_TYPE;
    }

    input(text) {
        this._text = text || "";
    }

    lex() {
        const rules = this._rules;
        let text = this._text;

        const tokens = [];

        const rule_names = Object.keys(rules);
        let progress = true;
        let iter = 0;
        // Position in text
        let text_pos = 0;


        let error_pos_lock = false;
        let error_pos = -1;
        let in_error = false;

        let accumulated_error = "";

        while (text.length > 0 && progress) {

            iter += 1;

            progress = false;

            let biggest_matched_string = "";
            let biggest_k = -1;
            let biggest_j = -1;

            for (let j = 0; j < rule_names.length; j += 1) {
                const rule_name = rule_names[j];
                const rule = rules[rule_name];

                assert("rgx" in rule, `${iter}, ${j} missing rgxs.`);
                assert(rule.rgx.length > 0, `${iter}, ${j} rgx length 0.`);

                for (let k = 0; k < rule.rgx.length; k += 1) {
                    const rgx = rule.rgx[k];
                    const match = text.match(rgx);

                    if (match === null) continue;
                    if (match.index !== 0) continue;

                    const matched_string = match[0];

                    // TODO, maybe conflict

                    if (matched_string.length > biggest_matched_string.length) {
                        biggest_matched_string = matched_string;
                        biggest_j = j;
                        biggest_k = k;
                    }
                }
            }

            // Post processing

            // Check if was in error
            if (biggest_k !== -1 && biggest_j !== -1) {

                if (accumulated_error.length !== 0) {
                    // Flush
                    const token = {
                        name: UNKNOWN_TYPE,
                        value: accumulated_error,
                        pos: error_pos
                    }
                    accumulated_error = "";
                    tokens.push(token);
                    error_pos_lock = false;
                    in_error = false;
                }

                if (rules[rule_names[biggest_j]].fn) {
                    const pps = rules[rule_names[biggest_j]].fn(biggest_matched_string);
                    if (pps && pps.length > 0) {
                        const token = {
                            name: rule_names[biggest_j],
                            value: pps,
                            pos: text_pos
                        }
    
                        tokens.push(token);
                    }
                }
            } else {
                if (!error_pos_lock) {
                    error_pos = text_pos;
                    error_pos_lock = true;
                }
                accumulated_error += text.substring(0, 1);
                in_error = true;
            }

            const length_before = text.length;

            if (in_error) {
                text = text.substr(1);
            } else {
                text = text.substr(biggest_matched_string.length);
            }

            const difference = length_before - text.length;
            text_pos += difference;

            if (text.length < length_before) progress = true;
        }

        // assert(text.length === 0);

        // rest

        if (!(text.length === 0) || accumulated_error.length > 0) {
           const token = {
                name: UNKNOWN_TYPE,
                value: accumulated_error,
                pos: error_pos
           }
    
           tokens.push(token);
        }


        return tokens;
    }
}



export { Lexer } 





