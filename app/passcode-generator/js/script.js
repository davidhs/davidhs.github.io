(() => {
	const _english_alphabet = "abcdefghijklmnopqrstuvwxyz";
	const _binary_numbers = "01";
	const _decimal_numbers = "0123456789";
	const _hex_numbers = "0123456789abcdef";
	const _special_symbols = " !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";

	const word_list_2 = [
		{
			id: "rl-english-alphabet",
			data: (() => {
				const l1 = _english_alphabet.split("");
				const l2 = _english_alphabet.split("").map((x) => x.toUpperCase());
				return l1.concat(l2);
			})()
		},
		{
			id: "rl-english-alphabet-lower-case",
			data: (() => {
				return _english_alphabet.split("");
			})()
		},
		{
			id: "rl-english-alphabet-upper-case",
			data: (() => {
				return _english_alphabet.split("").map((x) => x.toUpperCase());
			})()
		},
		{
			id: "rl-binary-numbers",
			data: (() => {
				return _binary_numbers.split("");
			})()
		},
		{
			id: "rl-decimal-numbers",
			data: (() => {
				return _decimal_numbers.split("");
			})()
		},
		{
			id: "rl-hexadecimal-numbers-lower-case",
			data: (() => {
				return _hex_numbers.split("");
			})()
		},
		{
			id: "rl-hexadecimal-numbers-upper-case",
			data: (() => {
				return _hex_numbers.toUpperCase().split("");
			})()
		},
		{
			id: "rl-alphanumeric-lower-case",
			data: (() => {
				return (_english_alphabet + _decimal_numbers).split("");
			})()
		},
		{
			id: "rl-alphanumeric-upper-case",
			data: (() => {
				return (_english_alphabet.toUpperCase() + _decimal_numbers).split("");
			})()
		},
		{
			name: "rl-alphanumeric",
			data: (() => {
				return (_english_alphabet + _english_alphabet.toUpperCase() + _decimal_numbers).split("");
			})()
		},
		{
			id: "rl-special-symbols",
			data: (() => {
				return _special_symbols.split("");
			})()
		},
		{
			id: "rl-alphanumeric-with-special-symbols",
			data: (() => {
				return (_english_alphabet + _english_alphabet.toUpperCase() + _decimal_numbers + _special_symbols).split("");
			})()
		}
	];

	let custom_list = [];

	let words = [];



	/** Radio (button) group IDs */
	const rg = [
		"rl-custom",

		"rl-diceware",

		"rl-eff-long",
		"rl-eff-short-general",
		"rl-eff-short-unique-3-prefix",

		"rl-my-big-list",

		"rl-english-alphabet",
		"rl-english-alphabet-lower-case",
		"rl-english-alphabet-upper-case",

		"rl-binary-numbers",
		"rl-decimal-numbers",

		"rl-hexadecimal-numbers-lower-case",
		"rl-hexadecimal-numbers-upper-case",

		"rl-alphanumeric",
		"rl-alphanumeric-lower-case",
		"rl-alphanumeric-upper-case",

		"rl-special-symbols",

		"rl-alphanumeric-with-special-symbols",
	];

	const dom = {
		file: document.getElementById("file"),
		list_size: document.getElementById("list_size"),
		words: document.getElementById("words"),
		passphrase: document.getElementById("passphrase"),
		generate: document.getElementById("generate"),
		symbol_entropy: document.getElementById("symbol_entropy"),
		passphrase_entropy: document.getElementById("passphrase_entropy"),
		symbol_separator: document.getElementById("symbol_seperator"),

		rl: rg.map((id) => {
			const dom_input = document.getElementById(id);
			if (dom_input === undefined || dom_input === null) throw new Error();
			return [dom_input, id];
		}),
	};

	/**
	 * @returns Name of selected list
	 * @throws If no selected list is found.
	 */
	function getSelectedList() {
		for (const [dom_input, id] of dom.rl) {
			if (dom_input.checked) return id;
		}

		throw new Error("No selected list!");
	}

	/** @param {string} id */
	function selectList(id) {
		if (id !== "__custom__") {
			let found = false;

			for (let j = 0; j < window.word_list.length; j += 1) {
				const wl = window.word_list[j];
				if (wl.id === id) {
					updateList(wl.data);
					found = true;
					break;
				}
			}

			if (!found) {
				for (let j = 0; j < word_list_2.length; j += 1) {
					const wl = word_list_2[j];
					if (wl.id === id) {
						updateList(wl.data);
						found = true;
						break;
					}
				}
			}
		} else {
			updateList(custom_list);
		}
	}

	for (let i = 0; i < dom.rl.length; i += 1) {
		const pair = dom.rl[i];
		const rl = pair[0];
		const id = pair[1];

		rl.onclick = () => {
			selectList(id);
			generatePassphrase();
		};
	}

	const getSecureInt = (() => {
		const BATCH_SIZE = 2 ** 10;
		const MAX_ALLOWED_NUMBER = 2 ** 32 - 1;

		let used = BATCH_SIZE;
		let bytes;

		function getNext32() {
			if (used >= BATCH_SIZE) {
				used = 0;
				bytes = new Uint32Array(BATCH_SIZE);
				window.crypto.getRandomValues(bytes);
			}

			const idx = used;
			used += 1;

			return bytes[idx];
		}

		// From from (inclusive) to to (exclusive)
		function getSecureInt(from, to) {
			if (!Number.isSafeInteger(from)) {
				throw new Error("from value is not a safe integer: " + from);
			}

			if (!Number.isSafeInteger(to)) {
				throw new Error("to value is not a safe integer: " + to);
			}

			if (from >= to) {
				throw new Error("from value has to be less than to value: " + from + " < " + to);
			}

			if (from < 0) {
				throw new Error("from is a negative number, non-negative numbers only: " + from);
			}

			if (to < 0) {
				throw new Error("to is a negative number, non-negative numbers only: " + to);
			}

			if (from > MAX_ALLOWED_NUMBER) {
				throw new Error("from has to be less than " + MAX_ALLOWED_NUMBER + ": " + from);
			}

			if (to > MAX_ALLOWED_NUMBER) {
				throw new Error("to has to be less than " + MAX_ALLOWED_NUMBER + ": " + to);
			}

			const diff = to - from;
			const bit_mask = 2 ** Math.ceil(Math.log2(diff + 1)) - 1;

			let choice = diff;

			while (choice >= diff) {
				// 32 bit integer, masked
				choice = getNext32() % bit_mask;
			}

			return from + choice;
		}

		return getSecureInt;
	})();

	dom.generate.onclick = () => {
		generatePassphrase();
	};

	dom.file.onchange = (evt) => {
		const files = evt.target.files;

		if (!files) return;

		for (let i = 0; i < files.length; i += 1) {
			const f = files[i];
			const r = new FileReader();
			r.onload = (evt2) => {
				const text = evt2.target.result;

				custom_list = processText(text);
				document.getElementById("rl1").click();
				// updateList(processText(text));
			};
			r.readAsText(f);
		}
	};

	function generatePassphrase() {
		if (words.length === 0) return;

		if (dom.words.value.trim() === "") return;

		const nr_of_symbols = +dom.words.value;

		const symbol_separator = dom.symbol_separator.value;

		let passphrase = "";

		for (let i = 0; i < nr_of_symbols; i += 1) {
			if (i > 0) {
				passphrase += symbol_separator;
			}
			passphrase += words[getSecureInt(0, words.length)];
		}

		dom.passphrase.value = passphrase;

		const symbol_entropy = Math.log2(words.length);
		const passphrase_entropy = nr_of_symbols * symbol_entropy;
		dom.passphrase_entropy.innerText = passphrase_entropy;
	}

	function processText(text) {
		return text
			.split("\n")
			.map((x) => x.trim())
			.filter((x) => x.length > 0);
	}

	function updateList(word_list) {
		dom.passphrase_entropy.innerText = 0;

		words = word_list;
		dom.list_size.innerText = words.length;
		const symbol_entropy = words.length > 0 ? Math.log2(words.length) : 0;
		dom.symbol_entropy.innerText = symbol_entropy;
	}

	
	setTimeout(() => {
		selectList(getSelectedList());
		generatePassphrase();
	}, 1);
})();
