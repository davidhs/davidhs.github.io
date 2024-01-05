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
/** @type {HTMLInputElement} */
const dom_split_lines = unsafe_transmute(unwrap(document.getElementById("split-lines")));
/** @type {HTMLTextAreaElement} */
const dom_test_string = unsafe_transmute(unwrap(document.getElementById("test-string")));
/** @type {HTMLTextAreaElement} */
const dom_results = unsafe_transmute(unwrap(document.getElementById("results")));


dom_split_lines.oninput = () => {
	process();
};

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
	
	/** @type {RegExp} */
	let regex;
	
	try {
		regex = new RegExp(regex_string, regex_flags);
	} catch (e) {
		dom_results.value = "Regular Expression Error: " + e;
		return;
	}
	
	if (dom_split_lines.checked) {
		dom_results.value = "";
			
		/** @type {string[]} */
		const msg = [];
		
		for (const line of test_string.split("\n")) {
			const match = regex.exec(line);
			
			if (match !== null) {
				const result = {
					matches: [...match]
				};
				
				if (match.groups) {
					result.groups = match.groups;
				}
				
				msg.push(JSON.stringify(result, null, 2));
			}
		}
		
		if (msg.length === 0) {
			dom_results.value = "No match!";
		} else {
			dom_results.value = msg.join("\n");
		}
	}
	else {
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
	}
}

process();
