/**
 * @type {(condition: any, message?: string) => asserts condition}
 */
function assert(condition, message = "") {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
}

/**
 * @template A
 * @template B
 * @param {A} x 
 * @returns {B}
 */
function unsafe_transform(x) {
	return x;
}

/**
 * @template T
 * @param {undefined | null | T} x 
 * @returns {T}
 */
function unwrap(x) {
	assert(x !== undefined && x !== null);
	return x;
}


/** @type {HTMLTextAreaElement} */
const dom_code_editor_original = unwrap(document.getElementById("code-editor-original"));

/** @type {HTMLTextAreaElement} */
const dom_code_editor_stringified = unwrap(document.getElementById("code-editor-stringified"));;

/** @type {HTMLButtonElement} */
const dom_button_stringify = unwrap(document.getElementById("button-stringify"));;

/** @type {HTMLButtonElement} */
const dom_button_parse = unwrap(document.getElementById("button-parse"));;


dom_button_stringify.onclick = () => {
	try {
		const text = dom_code_editor_original.value;
		const text_stringified = JSON.stringify(text);
		
		dom_code_editor_stringified.value = text_stringified;	
	} catch (e) {
		alert(e);
	}
};

dom_button_parse.onclick = () => {
	try {
		const text = dom_code_editor_stringified.value;
		const text_parsed = JSON.parse(text);
		
		dom_code_editor_original.value = text_parsed;
	} catch (e) {
		alert(e);
	}
};
