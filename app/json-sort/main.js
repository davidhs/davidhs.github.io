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

/**
 * @param {unknown} x 
 */
function toSortedJSON(x) {
	if (x === null || typeof x === "boolean" || typeof x === "number" || typeof x === "string") {
		return x;
	}
	else if (Array.isArray(x)) {
		const y = [];
		
		for (let i = 0; i < x.length; i++) {
			y.push(toSortedJSON(x[i]));
		}
		
		return y;
	}
	else if (typeof x === "object") {
		const keys = Object.keys(x);
		
		keys.sort();
		
		const y = {};
		
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			y[key] = toSortedJSON(x[key]);
		}
		
		return y;
	}
	else {
		throw new Error("Not valid JSON.");
	}
}


/** @type {HTMLTextAreaElement} */
const dom_code_editor_original = unwrap(document.getElementById("code-editor-original"));

/** @type {HTMLTextAreaElement} */
const dom_code_editor_sorted = unwrap(document.getElementById("code-editor-stringified"));

/** @type {HTMLButtonElement} */
const dom_button_sort = unwrap(document.getElementById("button-sort"));

dom_button_sort.onclick = () => {
	try {
		const original_json_stringified = dom_code_editor_original.value;
		
		const original_json = JSON.parse(original_json_stringified);
		
		const sorted_json = toSortedJSON(original_json);
		
		const sorted_json_stringified = JSON.stringify(sorted_json, null, 2);
		
		dom_code_editor_sorted.value = sorted_json_stringified;	
	} catch (e) {
		alert(e);
	}
};
