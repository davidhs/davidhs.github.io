import { assert } from './lib/utils/utils.js';


/*
 * 
 * 
 * Example of CFG:
 * 
 * E -> T E'
 * E' -> + T E'
 * E' -> #
 * 
 * T -> F T'
 * T' -> * F T'
 * T' -> #
 * 
 * F -> ( E )
 * F -> num
 * 
 * where # is epsilon (empty)
 * 
 */




var EPSILON = "#";
var END_MARKER = "$";

let global_rg2 = null;

let global_rg = null;

let source = "";

let grammar = [];

let table_first = {};
let table_follow = {};

/** @type Object.<string, string[]> */
let table_rules = {};

const DEFAULT_ROUNDS = 500;


let rounds_first = DEFAULT_ROUNDS;
let rounds_follow = DEFAULT_ROUNDS;

let failed = false;

let error_message = "";

let railroad_source = "";






function updateBundle(bundle) {
    bundle.grammar = grammar;
    bundle.table_first = table_first;
    bundle.table_follow = table_follow;
    bundle.table_rules = table_rules;
    bundle.rounds_first = rounds_first;
    bundle.rounds_follow = rounds_follow;
    bundle.failed = failed;
    bundle.error_message = error_message;
    bundle.parsing_table = parsing_table;
    bundle.global_rg = global_rg;
    bundle.global_rg2 = global_rg2;
    bundle.railroad_source = railroad_source;
}


function clear() {
    source = "";
    grammar = [];
    table_first = {};
    table_follow = {};
    table_rules = {};
    rounds_first = DEFAULT_ROUNDS;
    rounds_follow = DEFAULT_ROUNDS;
    global_rg2 = null;
    failed = false;
    error_message = "";
    global_rg = null;
    parsing_table = null;
    railroad_source = "";
}



function isNonterminal(symbol) {

    if (symbol[0] === '_') return true;

    var l = symbol[0].toLowerCase();
    var u = symbol[0].toUpperCase();

    if (l === u) {
        return false;
    }

    return symbol[0] === u;
}

function isEpsilon(symbol) {
    return symbol === EPSILON;
}

function isArrow(symbol) {

    return symbol === "->";
}

function isTerminal(symbol) {
    return !isNonterminal(symbol) && !isEpsilon(symbol) && !isArrow(symbol);
}

/**
 * 
 * @param {string} text 
 */
function parse(text) {
    return text.split(/[\n]+/).map(x=>x.split(/\s+/).filter(x=>x)).filter(x=>x.length > 0);
}

/**
 * Again, I regret this `rounds` thing, look at `compute_FOLLOW`.
 * 
 * @param {undefined|number} rounds 
 */
function compute_FIRST(rounds=100) {
    if (failed) return;

    let i = 0;

    const nonterminal_names = Object.keys(table_first);

    while (i < rounds) {
        if (failed) return;

        for (let j = 0; j < nonterminal_names.length; j += 1) {
            if (failed) return;
            const nonterminal_name = nonterminal_names[j];
            // console.log(nonterminal_name);
            const ret_st = FIRST(nonterminal_name);
            if (failed) return;
            // console.log("Out: ", ret_st);
            // console.log("Before: ", table_first[nonterminal_name]);
            const union = new Set([...table_first[nonterminal_name], ...ret_st]);
            // union new Set([...a, ...b])
            table_first[nonterminal_name] = union;
            // console.log("After: ", table_first[nonterminal_name]);
        }

        i += 1;
    }
}

function addToSet(source, target) {
    if (failed) return;
    if (typeof target === "undefined") {
        failed = true;
        return;
    }

    source.forEach(el => {
        if (failed) return;
        

        target.add(el)
    });
}

// X is a grammar symbol
//

/**
 * 
 * @param {string} X is a grammar symbol
 */
function FIRST(X) {
    if (failed) return;

    /** @type {Set.<string>} */
    const ret = new Set();

    if (isTerminal(X)) {
        ret.add(X);
        return ret;
    }

    if (!isNonterminal(X)) {
        failed = true;
        return;
    }

    const rules = table_rules[X];

    // Complex production

    for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];

        if (!(rule.length >= 1))
            continue;

        // Check epsilon production
        if (rule.length === 1 && isEpsilon(rule[0])) {
            ret.add(EPSILON);
            continue;
        }

        // No epsilons at this point!

        let epsilon_trail = true;

        for (let j = 0; j < rule.length; j += 1) {
            // Symbol
            const y = rule[j];

            if (!epsilon_trail)
                break;

            if (isTerminal(y)) {
                epsilon_trail = false;
                ret.add(y);
            } else {

                if (!isNonterminal(y)) {
                    failed = true;
                    return;
                }


                const nts = table_first[y];

                if (!(nts instanceof Set)) {
                    failed = true;
                    return;
                }

                /** @type {Set.<string>} */
                const nts_copy = new Set(nts);
                nts_copy.delete(EPSILON);
                nts_copy.forEach(el=>ret.add(el));

                if (!nts.has(EPSILON)) {
                    epsilon_trail = false;
                }
            }
        }

        // All intermediates can be epsilon, so can this.
        if (epsilon_trail)
            ret.add(EPSILON);
    }

    return ret;
}

/**
 * I really regret this rounds garbage.  What it should've done is
 * compute the FOLLOW table until no changes are in the FOLLOW table.
 * 
 * Here, instead, I just do it `round` many times.
 * 
 * @param {undefined|number} rounds 
 */
function compute_FOLLOW(rounds=20) {

    // YOU HAVE TO HAVE CALCULATED FIRST first

    let i = 0;

    const nonterminal_names = Object.keys(table_first);

    // 1. Add end-marker in start symbol.
    table_follow[grammar[0][0]].add(END_MARKER);

    while (i < rounds) {

        for (let j = 0; j < nonterminal_names.length; j += 1) {
            const nonterminal_name = nonterminal_names[j];
            FOLLOW(nonterminal_name);
        }

        i += 1;
    }
}

/**
 * 
 * @param {string} X grammar symbol
 */
function FOLLOW(X) {

    const rules = table_rules[X];
    for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];

        const A = X;
        const A_follow = table_follow[A];

        // Search for B

        for (let j = 0; j < rule.length; j += 1) {
            const B = rule[j];

            if (!isNonterminal(B)) continue;

            const B_follow = table_follow[B];

            if (j < rule.length - 1) {
                // 2.

                // Handles
                //
                // A -> alpha B beta
                //
                //   Everything in FIRST(beta) also in FOLLOW(B),
                //   excluding EPSILON
                //
                // and if EPSILON in FIRST(beta) (no early stop)
                // then everything in FOLLOW(A) is in FOLLOW(B)
                // 

                let all_epsilons = true;

                // Remainder of string
                for (let k = j + 1; k < rule.length; k += 1) {
                    const y = rule[k];

                    if (isTerminal(y)) {
                        if (failed) return;
                        addToSet(new Set(y), B_follow);
                        all_epsilons = false;
                        break;
                    }

                    if (isEpsilon(y)) continue;

                    if (!isNonterminal(y)) {
                        failed = true;
                        return;
                    }

                    const y_first = table_first[y];

                    if (typeof y_first === "undefined") {
                        failed = true;
                        return;
                    }

                    const y_first_copy = new Set(y_first);
                    y_first_copy.delete(EPSILON);

                    if (y_first_copy.has(EPSILON)) {
                        failed = true;
                        return;
                    }

                    if (failed) return;
                    addToSet(y_first_copy, B_follow);

                    if (!y_first.has(EPSILON)) {
                        all_epsilons = false;
                        break;
                    }
                }

                // Check if EPSILON in FIRST(beta)
                if (all_epsilons) {
                    const A_follow_copy = new Set(A_follow);

                    if (failed) return;
                    addToSet(A_follow_copy, B_follow);
                }

            } else {

                if (!(j === rule.length - 1)) {
                    failed = true;
                    return;
                }
                // 3

                // Handles
                //
                //  A -> alpha B

                if (!isNonterminal(B)) {
                    failed = true;
                    return;
                }

                const A_follow_copy = new Set(A_follow);

                if (failed) return;
                addToSet(A_follow_copy, B_follow);
            }
        }
    }
}

// Gets a copy
function getFirstSymbol(grammar_symbol) {
    const X = grammar_symbol;

    if (isTerminal(X)) {
        return new Set([X]);
    } else if (isNonterminal(X)) {
        return new Set(table_first[X]);
    } else if (isEpsilon(X)) {
        return new Set([EPSILON]);
    } else {
        throw grammar_symbol;
    }
}


// FIRST table needs have been calculated.
// [X_1, X_2, ...]
function getFirstString(grammar_symbols) {

    const string_first = new Set();

    let had_epsilon = false;

    for (let i = 0; i < grammar_symbols.length; i += 1) {
        const grammar_symbol = grammar_symbols[i];

        const X = grammar_symbol;

        // Add non-epsilon symbols of FIRST(X1)
        const X_first = getFirstSymbol(X);

        had_epsilon = X_first.has(EPSILON);

        X_first.delete(EPSILON);

        addToSet(X_first, string_first);

        if (!had_epsilon) break;
    }

    if (had_epsilon) {
        string_first.add(EPSILON);
    }

    return string_first;
}

function getSetDifference(set1, set2) {
    const diff = new Set([...set1].filter(x => !set2.has(x)));;
    return diff;
}

function getSetIntersection(set1, set2) {
    const inter = new Set([...set1].filter(x => set2.has(x)));
    return inter;
}

function areDisjoint(set1, set2) {
    const inter = getSetIntersection(set1, set2);
    return inter.size === 0;
}


function setToString(set) {
    const list = [];
    set.forEach(x => list.push(x));
    return list.join(" ");
}

function arrayToString(arr) {
    return arr.join(" ");
}

////////////////////////////////////////////////////////////////////////////////

function verifyIsLL1Grammar() {


    // "reduced" grammar
    const rg = {};

    for (let i = 0; i < grammar.length; i += 1) {
        const rule = grammar[i];
        const nonterminal = rule[0];
        const production = rule.slice(2)

        if (!rg.hasOwnProperty(nonterminal)) {
            rg[nonterminal] = [];
        }

        rg[nonterminal].push(production);
    }

    const nonterminals = Object.keys(rg);

    // Ensure no repeating production

    let repetition = false;
    let term = null;
    let rep1 = null;
    let rep2 = null;

    label1: for (let i = 0; i < nonterminals.length; i += 1) {
        const nonterminal = nonterminals[i];
        const productions = rg[nonterminal];
        term = nonterminal;

        for (let j = 0; j < productions.length - 1; j += 1) {
            const prodA = productions[j];
            rep1 = prodA;
            for (let k = j + 1; k < productions.length; k += 1) {
                const prodB = productions[k];
                rep2 = prodB;
                // Compare

                if (prodA.length !== prodB.length) continue;

                // prodA and prodB are of same length

                assert(prodA.length === prodB.length);

                let all_alike = true;

                for (let h = 0; h < prodA.length; h += 1) {
                    const symbolA = prodA[h];
                    const symbolB = prodB[h];

                    if (symbolA !== symbolB) {
                        all_alike = false;
                        break;
                    }
                }

                if (all_alike) {
                    repetition = true;
                    break label1;
                }
            }
        }

    }

    if (repetition) {
        error_message = "Contains repetitions" + "\n";
        error_message += "\n";
        error_message += "Nonterminal: " + term + "\n"
        error_message += "\n";
        error_message += "Production 1: " + rep1 + "\n"
        error_message += "Production 2: " + rep2 + "\n"

        failed = true;
        return;
    }

    // Here guaranteed to not contain any repeating rules

    // Grammar G is LL(1) <=> A -> alpha | beta are two
    // distinct productions of G, then the following holds

    

    label2: for (let i = 0; i < nonterminals.length; i += 1) {
        const nonterminal = nonterminals[i];
        const productions = rg[nonterminal];

        const A_follow = new Set(table_follow[nonterminal]);

        for (let j = 0; j < productions.length - 1; j += 1) {
            const prodA = productions[j];
            const prodA_first = getFirstString(prodA);

            for (let k = j + 1; k < productions.length; k += 1) {
                const prodB = productions[k];
                const prodB_first = getFirstString(prodB);

                // 1. For no terminal a do both alpha and beta derive strings beginning with a.
                // 2. At most one of alpha and beta can derive the empty string. 
                // This is equivalent that FIRST(alpha) and FIRST(beta) are
                // disjoint sets.
                if (!areDisjoint(prodA_first, prodB_first)) {
                    error_message = "";

                    error_message += "Contains intersection" + "\n";
                    error_message += "\n";
                    error_message += "Nonterminal: " + nonterminal + "\n";
                    error_message += "\n";
                    error_message += "Production 1: " + arrayToString(prodA) + "\n";
                    error_message += "First prod 1: " + setToString(prodA_first) + "\n";
                    error_message += "\n";
                    error_message += "Production 2: " + arrayToString(prodB) + "\n";
                    error_message += "First prod 2: " + setToString(prodB_first) + "\n";
                    error_message += "\n";
                    error_message += "Intersection: " +  setToString(getSetIntersection(prodA_first, prodB_first)) + "\n";
                    
                    failed = true;
                    return;
                }

                const cA = prodA_first.has(EPSILON);
                const cB = prodB_first.has(EPSILON);

                if (cA && cB) {
                    error_message += "Both can derive epsilons" + "\n";
                    error_message += "\n";
                    error_message += "Nonterminal: " + nonterminal + "\n";
                    error_message += "\n";
                    error_message += "Production 1: " + arrayToString(prodA) + "\n";
                    error_message += "First prod 1: " + setToString(prodA_first) + "\n";
                    error_message += "\n";
                    error_message += "Production 2: " + arrayToString(prodB) + "\n";
                    error_message += "First prod 2: " + setToString(prodB_first) + "\n";
                    error_message += "\n";
                    error_message += "Intersection: " +  setToString(getSetIntersection(prodA_first, prodB_first)) + "\n";

                    failed = true;
                    return;
                }

                // 3.

                if (cA) {
                    if (!areDisjoint(prodB_first, A_follow)) {

                        const eprod      = prodA;
                        const prod       = prodB;
                        const prod_first = prodB_first;

                        error_message = "";
                        error_message += "Assertion FIRST(" + arrayToString(prod)  + ") and FOLLOW(" + nonterminal + ") are disjoint failed.\n";
                        error_message += "\n";
                        error_message += "Nonterminal: " + nonterminal + "\n";
                        error_message += "\n";
                        error_message += "Production with epsilon: " + arrayToString(eprod) + "\n";
                        error_message += "\n";
                        error_message += "FIRST(" + arrayToString(prod) + "): " + setToString(prod_first) + "\n";
                        error_message += "\n";
                        error_message += "FOLLOW(" + nonterminal + "): " + setToString(A_follow) + "\n";
                        error_message += "\n";
                        error_message += "Intersection: " + setToString(getSetIntersection(prod_first, A_follow)) + "\n";
                        
                        failed = true;
                        return;
                    }
                } else if (cB) {
                    if (!areDisjoint(prodA_first, A_follow)) {
                        const eprod      = prodB;
                        const prod       = prodA;
                        const prod_first = prodA_first;

                        error_message = "";
                        error_message += "Assertion FIRST(" + arrayToString(prod)  + ") and FOLLOW(" + nonterminal + ") are disjoint failed.\n";
                        error_message += "\n";
                        error_message += "Nonterminal: " + nonterminal + "\n";
                        error_message += "\n";
                        error_message += "Production with epsilon: " + arrayToString(eprod) + "\n";
                        error_message += "\n";
                        error_message += "FIRST(" + arrayToString(prod) + "): " + setToString(prod_first) + "\n";
                        error_message += "\n";
                        error_message += "FOLLOW(" + nonterminal + "): " + setToString(A_follow) + "\n";
                        error_message += "\n";
                        error_message += "Intersection: " + setToString(getSetIntersection(prod_first, A_follow)) + "\n";
                        
                        failed = true;
                        return;;
                    }
                }
            }
        }
    }

    // 3. If beta eventually derives epsilon, then alpha does not derive
    //    any string beginning with a terminal in FOLLOW(A)
}

////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////




// parse "tree"
function verify(pt) {

    if (!Array.isArray(pt)) {
        error_message = "Parsed source isn't an array";
        return false;
    }

    if (pt.length <= 0) {
        error_message = "Parsed source doesn't contain any entries.";
        return false;
    }

    for (let i = 0; i < pt.length; i += 1) {
        const prod = pt[i];

        if (prod.length < 3) {
            error_message = "Production has to contain at least 3 entries: " + arrayToString(prod);
            return false;
        }

        if (prod[0].length === 0) {
            error_message = "First symbol is empty";
            return false;
        }
        if (prod[1].length === 0) {
            error_message = "Second symbol is empty";
            return false;
        }
        if (!isNonterminal(prod[0])) {
            error_message = "First symbol is not a nonterminal";
            return false;
        }
        if (!isArrow(prod[1])) {
            error_message = "Second symbol is not an arrow.";
            return false;
        }

        for (let j = 2; j < prod.length; j += 1) {

            const y = prod[j];

            const c1 = isTerminal(y);
            const c2 = isNonterminal(y);
            const c3 = isEpsilon(y);

            if (!(c1 || c2 || c3)) {
                error_message = "Some of the symbols in the production were unrecognized";
                return false;
            }
        }
    }

    return true;
}


function setup() {

    grammar = parse(source);

    if (!verify(grammar)) {
        /*
        console.error({
            stuff: stuff,
            source: source
        });
        */
        return false;
    }

    // check if correct form

    for (let i = 0; i < grammar.length; i += 1) {
        const nonterminal = grammar[i][0];
    
        if (!table_first.hasOwnProperty(nonterminal)) {
            table_first[nonterminal] = new Set();
        }
    
        if (!table_follow.hasOwnProperty(nonterminal)) {
            table_follow[nonterminal] = new Set();
        }
    
        if (!table_rules.hasOwnProperty(nonterminal)) {
            table_rules[nonterminal] = [];
        }

        const probably_a_rule = grammar[i].slice(2);
    
        table_rules[nonterminal].push(probably_a_rule);
    }

    return true;
}



function accountForAllNonTerminals() {

    const rg = {};

    for (let i = 0; i < grammar.length; i += 1) {
        const rule = grammar[i];
        const nonterminal = rule[0];
        const production = rule.slice(2);

        if (!rg.hasOwnProperty(nonterminal)) {
            rg[nonterminal] = [];
        }

        rg[nonterminal].push(production);
    }
    const nonterminals = Object.keys(rg);

    global_rg = rg;

    let unaccounted = new Set();

    

    for (let i = 0; i < grammar.length; i += 1) {
        const rule = grammar[i];
        const nonterminal = rule[0];
        const production = rule.slice(2)

        for (let j = 0; j < production.length; j += 1) {

            const symbol = production[j];

            if (isNonterminal(symbol)) {
                if (!rg.hasOwnProperty(symbol)) {
                    unaccounted.add(symbol);
                }
            }
        }
    }

    if (unaccounted.size !== 0) {

        error_message = "Unaccounted nonterminals: " + setToString(unaccounted) + "\n";

        failed = true;
        return false;
    }

    return true;
}





function checkForOrphanedNonterminals() {

    // Maintains insertion order
    const rg = new Map();

    for (let i = 0; i < grammar.length; i += 1) {
        const rule = grammar[i];
        const nonterminal = rule[0];
        const production = rule.slice(2);

        if (!rg.has(nonterminal)) {
            rg.set(nonterminal, []);
        }

        rg.get(nonterminal).push(production);
    }

    global_rg2 = rg;

    // rg contains all nonterminals

    const rgl = [];

    rg.forEach((value, key) => {
        rgl.push(key);
    });


    const all = new Set(rgl);

    const accounted = new Set();


    const queue = [rgl[0]];

    let ITER = 0;

    while (queue.length > 0) {

        const el = queue.shift();

        if (accounted.has(el)) continue;

        accounted.add(el);

        const productions = rg.get(el);

        for (let i = 0; i < productions.length; i += 1) {
            const production = productions[i];
            for (let j = 0; j < production.length; j += 1) {
                const symbol = production[j];

                if (isNonterminal(symbol)) {
                    if (!accounted.has(symbol)) {
                        queue.push(symbol);
                    }
                }
            }
        }
    }

    const diff = getSetDifference(all, accounted);


    if (diff.size !== 0) {

        error_message = "Orphaned nonterminals: " + setToString(diff);

        failed = true;
        return false;
    }

    return true;
}

let parsing_table = null;


function strArrAreSame(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i += 1) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}


function SymbolTable() {
    this._table = {};
}


SymbolTable.prototype.add = function (row_sym, col_sym, val) {
    if (!this._table.hasOwnProperty(row_sym)) {
        this._table[row_sym] = {};
    }

    if (typeof col_sym === "undefined") return;

    if (!this._table[row_sym].hasOwnProperty(col_sym)) {
        this._table[row_sym][col_sym] = [];
    }

    if (typeof val === "undefined") return;

    // No duplicate rules

    const l = this._table[row_sym][col_sym];

    for (let i = 0; i < l.length; i += 1) {
        const sa = l[i];
        
        if (strArrAreSame(sa, val)) return;
    }

    // strArrAreSame

    this._table[row_sym][col_sym].push(val);
};

SymbolTable.prototype.get = function (row_sym, col_sym) {
    if (!this._table.hasOwnProperty(row_sym)) return undefined;
    if (!this._table[row_sym].hasOwnProperty(col_sym)) return undefined;
    return this._table[row_sym][col_sym];
}

SymbolTable.prototype.getTable = function () {
    return this._table;
};



function createParsingTable() {


    // getFirstString

    

    const st = new SymbolTable();

    let terminal_set = new Set();

    const nonterminals = Object.keys(global_rg);

    for (let i = 0; i < nonterminals.length; i += 1) {
        const nonterminal = nonterminals[i];

        const A_follow = new Set(table_follow[nonterminal]);

        const rules = global_rg[nonterminal];
        for (let j = 0; j < rules.length; j += 1) {
            const rule = rules[j];

            // Contains terminals
            const alpha = getFirstString(rule);

            alpha.forEach(terminal => {
                terminal_set.add(terminal);
                st.add(nonterminal, terminal, rule);
            });

            // If epsilon in alpha

            if (alpha.has(EPSILON)) {
                const A_follow = new Set(table_follow[nonterminal]);
                A_follow.forEach(terminal => {
                    terminal_set.add(terminal);
                    st.add(nonterminal, terminal, rule);
                });
            }

            if (alpha.has(EPSILON) && A_follow.has(END_MARKER)) {
                terminal_set.add(END_MARKER);
                st.add(nonterminal, END_MARKER, rule);
            }

        }
    }

    const ptp = st.getTable();

    const terminals = [];
    terminal_set.forEach(terminal => {
        if (!isEpsilon(terminal)) {
            terminals.push(terminal);
        }
    });

    const m = nonterminals.length;
    const n = terminals.length;


    const the_table = [];

    for (let i = 0; i < m; i += 1) {
        the_table.push([]);
        for (let j = 0; j < n; j += 1) {
            the_table[i].push("");
        }
    }

    // console.log(st);

    for (let i = 0; i < nonterminals.length; i += 1) {
        const nonterminal = nonterminals[i];
        for (let j = 0; j < terminals.length; j += 1) {
            const terminal = terminals[j];

            const rules = st.get(nonterminal, terminal);
            

            if (typeof rules === "undefined") continue;



            for (let k = 0; k < rules.length; k += 1) {
                const rule = rules[k];
                the_table[i][j] += nonterminal + " -> " + rule.join(" ");
                if (k < rules.length - 1) {
                    the_table[i][j] += "\n";
                }
            }
        }
    }

    // Add nonterminal column

    for (let i = 0; i < the_table.length; i += 1) {
        const nonterminal = nonterminals[i];

        const row = the_table[i];
        row.unshift(nonterminal);
    }


    // Add new row

    const new_row = [];
    for (let i = 0; i < the_table[0].length; i += 1) {
        new_row.push("");
    }
    the_table.unshift(new_row);


    // Add terminals

    for (let j = 1; j < the_table[0].length; j += 1) {
        const row = the_table[0];
        row[j] = terminals[j - 1];
    }

    parsing_table = the_table;
}


function generateSourceForRailroadDiagram() {

    const rg = global_rg2;

    let rrs = "";

    rg.forEach((productions, nonterminal) => {


        let add_epsilon = false;

        let msg_rule = nonterminal + " ::= ";

        for (let i = 0; i < productions.length; i += 1) {
            const production = productions[i];

            let add_separator = i !== 0;

            for (let j = 0; j < production.length; j += 1) {
                const symbol = production[j];


                const c1 = isTerminal(symbol);
                const c2 = isNonterminal(symbol);

                if ((c1 || c2) && !isEpsilon(symbol)) {
                    if (add_separator) {
                        msg_rule += "| ";
                        add_separator = false;
                    }
                }
                

                if (isTerminal(symbol)) {
                    msg_rule += "\"" + symbol + "\"" + " ";
                } else if (isNonterminal(symbol)) {
                    msg_rule += symbol + " ";
                } else if (isEpsilon(symbol)) {
                    add_epsilon = true;
                }

            }
        }

        if (add_epsilon) {
            msg_rule += "|";
        }

        rrs += msg_rule + "\n";
        
    });

    railroad_source = rrs;
}



function generateJavaScriptCode(bundle) {
    console.log(bundle);



    let exported_code = "";



    const parts_to_string = [


        "// This variable contains the lexeme",
        "var lexeme;",

        "// Current token",
        "var lexeme1;",
        "var token1;",
        "var line1;",
        "var column1;",
        
        "// Next token",
        "var lexeme2;",
        "var token2;",
        "var line2;",
        "var column2",

        "// Next token",

        function advance() {

            var res = lexeme1;

            // Make next token current token.

            lexeme1 = lexeme2;

            token1  = token2;
            line1   = line2;
            column1 = column2;

            // Check if reached EOF
            if (token2 === 0) {
                return res;
            }

            token2  = lexer.yylex();
            line2   = lexer.yyline;
            column2 = lexer.yycolumn;

            return res;
        },

        function getLine() {
            return line1 + 1;
        },

        function getColumn() {
            return column1 + 1;
        },

        function getToken1() {
            return token1;
        },

        function getToken2() {
            return token2;
        },

        function getLexeme() {
            return lexeme1;
        },

        "// tokens are suppsed to be var args (TODO)",

        function expected(tokens) {

            var expected = "";

            for (var i = 0; i < tokens.length; i += 1) {
                if (i !== 0) {
                    if (i < tokens.length - 1) {
                        expected += ", ";
                    } else {
                        expected += ", or ";
                    }
                }
                expected += "" + tokenName(tokens[i]);
            }

            var tokenName = tokenName(getToken1());

            var msg = "Expected token(s) " + expected + ", found token " + tokenName + " (lexeme: ´" + getLexeme() + "´) near line " + getLine() + ", column " + getColumn() + ".";

            throw new Error(msg);
        },

        function tokenName(token) {
            // token is a number

            // returns the name, otherwise throws an exception
        },

        function over(token) {
            if (token1 !== token) {
                expected(token);
            }

            var res = lexeme1;
            advance();

            return res;
        },

        // ^^^^ LEXER PART, MAYBE DELETE

        "// ------------------------------------------------------------",

        function advance() {
            // advance lexer
        },

        function over(token) {
            // lexer overt
        },

        function nextToken() {
            var next_token; // put next token here
            return next_token;
        },

        "// ----- STATES ---------------------------------------------"


    ];


    for (let i = 0; i < parts_to_string.length; i += 1) {


        const string_part = String(parts_to_string[i]);

        exported_code += string_part;
        exported_code += "\n";

        console.log(string_part);
    }




    console.log(exported_code);


    bundle.code = exported_code;


    
}


function post(bundle) {
    generateJavaScriptCode(bundle);
}


function getFirstAndFollow(pkg) {

    clear();

    const bundle = {};

    source = pkg.source;

    updateBundle(bundle);

    if (!setup()) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    if (!accountForAllNonTerminals()) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    if (!checkForOrphanedNonterminals()) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    generateSourceForRailroadDiagram();

    if (!checkForOrphanedNonterminals()) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    
    compute_FIRST();

    if (failed) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    compute_FOLLOW();

    if (failed) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    createParsingTable();

    if (failed) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    verifyIsLL1Grammar();

    if (failed) {
        updateBundle(bundle);
        clear();
        return bundle;
    }

    updateBundle(bundle);

    post(bundle);


    return bundle;
}


export { getFirstAndFollow };

