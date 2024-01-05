/**
 * Asserts that the variable `conditional` is truthy, otherwise an (assertion) error is thrown.
 * 
 * @param {unknown} condition A condition that is expected to be truthy.
 * @param {(string | () => void)=} message_or_function A message that is displayed or a function that is called if the assertion is violated.
 * @throws If the assertion is violated.
 * @returns {asserts condition}
 */
function assert(condition, message_or_function = "") {
	if (!condition) {
		if (message_or_function === undefined || message_or_function === null || typeof message_or_function === "boolean" || typeof message_or_function === "number" || typeof message_or_function === "string") {
			throw new Error(`Assertion failed: ${message_or_function}`);
		} else {
			if (typeof message_or_function === "function") {
				message_or_function();
				throw new Error("Assertion failed!");
			} else {
				console.error("Assertion failed:", message_or_function);
				throw new Error("Assertion failed!");
			}
		}
	}
}


/**
 * @template T
 * @param {undefined | null | T} x
 * @returns {T}
 */
function unwrap(x) {
	if (x === undefined || x === null) {
		throw new Error(`Unwrap error: x is expected not to be undefined or null, it is: ${x}`);
	}
	
	return x;
}

/**
 * @template T
 * @param {unknown} x 
 * @returns {T}
 */
function unsafe_transmute(x) {
	return x;
}

/** @type {HTMLTextAreaElement} */
const dom_regex_flags = unsafe_transmute(unwrap(document.getElementById("regex-flags")));
/** @type {HTMLTextAreaElement} */
const dom_regex = unsafe_transmute(unwrap(document.getElementById("regex")));
/** @type {HTMLTextAreaElement} */
const dom_test_string = unsafe_transmute(unwrap(document.getElementById("test-string")));
/** @type {HTMLTextAreaElement} */
const dom_results = unsafe_transmute(unwrap(document.getElementById("results")));

dom_regex_flags.oninput = () => {
	process();
};

dom_regex.oninput = () => {
	process();
};

dom_test_string.oninput = () => {
	process();
};


function process() {
	const regex_flags = dom_regex_flags.value;
	const regex_string = dom_regex.value;
	const test_string = dom_test_string.value;
	
	try {
		const regex = new RegExp(regex_string, regex_flags);

		const match = regex.exec(test_string);
		
		if (match !== null) {
			const result = {
				matches: [...match]
			};
			
			if (match.groups) {
				result.groups = match.groups;
			}
			
			dom_results.value = JSON.stringify(result, null, 2);
		} else {
			dom_results.value = "No match!";	
		}
	} catch (e) {
		dom_results.value = "Error: " + e;
	}
}

process();
