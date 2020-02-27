(() => {

	/*
		<input id="rl7" type="radio" name="lists">Lower-case english alphabet<br>
		<input id="rl8" type="radio" name="lists">Upper-case english alphabet<br>
		<input id="rl9" type="radio" name="lists">English alphabet<br>
		<input id="rl10" type="radio" name="lists">Binary numbers<br>>
		<input id="rl11" type="radio" name="lists">Decimal numbers<br>>
		<input id="rl12" type="radio" name="lists">Lower-case hexadecimal numbers<br>
		<input id="rl13" type="radio" name="lists">Upper-case hexadecimal numbers<br>
		<input id="rl14" type="radio" name="lists">Lower-case alphanumeric<br>
		<input id="rl15" type="radio" name="lists">Upper-case alphanumeric<br>
		<input id="rl16" type="radio" name="lists">Alphanumeric<br>
		<input id="rl17" type="radio" name="lists">Special symbols<br>
		<input id="rl18" type="radio" name="lists">Alphanumeric with special symbols<br>
	*/

	const _english_alphabet = "abcdefghijklmnopqrstuvwxyz";
	const _binary_numbers = "01";
	const _decimal_numbers = "0123456789";
	const _hex_numbers = "0123456789abcdef";
	const _special_symbols = " !\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";


	const word_list_2 = [
		{
			name: "Lower-case english alphabet", 
			data: (() => {
				return _english_alphabet.split("");
			})()
		}, {
			name: "Upper-case english alphabet", 
			data: (() => {
				return _english_alphabet.split("").map((x) => x.toUpperCase());
			})()
		}, {
			name: "English alphabet", 
			data: (() => {
				const l1 = _english_alphabet.split("");
				const l2 = _english_alphabet.split("").map((x) => x.toUpperCase());
				return l1.concat(l2);
			})()
		}, {
			name: "Binary numbers", 
			data: (() => {
				return _binary_numbers.split("");
			})()
		}, {
			name: "Decimal numbers", 
			data: (() => {
				return _decimal_numbers.split("");
			})()
		}, {
			name: "Lower-case hexadecimal numbers", 
			data: (() => {
				return _hex_numbers.split("");
			})()
		}, {
			name: "Upper-case hexadecimal numbers", 
			data: (() => {
				return _hex_numbers.toUpperCase().split("");
			})()
		}, {
			name: "Lower-case alphanumeric", 
			data: (() => {
				return (_english_alphabet + _decimal_numbers).split("");
			})()
		}, {
			name: "Upper-case alphanumeric", 
			data: (() => {
				return (_english_alphabet.toUpperCase() + _decimal_numbers).split("");
			})()
		}, {
			name: "Alphanumeric", 
			data: (() => {
				return (_english_alphabet + _english_alphabet.toUpperCase() + _decimal_numbers).split("");
			})()
		}, {
			name: "Special symbols", 
			data: (() => {
				return _special_symbols.split("");
			})()
		}, {
			name: "Alphanumeric with special symbols", 
			data: (() => {
				return (_english_alphabet + _english_alphabet.toUpperCase() + _decimal_numbers + _special_symbols).split("");
			})()
		}
	];


	let custom_list = [];

	let words = [];

	const dom = {
		file: document.getElementById("file"),
		list_size: document.getElementById("list_size"),
		words: document.getElementById("words"),
		passphrase: document.getElementById("passphrase"),
		generate: document.getElementById("generate"),
		symbol_entropy: document.getElementById("symbol_entropy"),
		passphrase_entropy: document.getElementById("passphrase_entropy"),
		symbol_separator: document.getElementById('symbol_seperator')
		
	};

	dom.rl = [
		[ document.getElementById("rl1"), "__custom__"],
		[ document.getElementById("rl2"), "diceware_wordlist"],
		[ document.getElementById("rl3"), "eff_large_wordlist"],
		[ document.getElementById("rl4"), "eff_short_wordlist_1"],
		[ document.getElementById("rl5"), "eff_short_wordlist_2_0"],
		[ document.getElementById("rl6"), "my_big_list"],
		[ document.getElementById("rl7"), "Lower-case english alphabet"],
		[ document.getElementById("rl8"), "Upper-case english alphabet"],
		[ document.getElementById("rl9"), "English alphabet"],
		[ document.getElementById("rl10"), "Binary numbers"],
		[ document.getElementById("rl11"), "Decimal numbers"],
		[ document.getElementById("rl12"), "Lower-case hexadecimal numbers"],
		[ document.getElementById("rl13"), "Upper-case hexadecimal numbers"],
		[ document.getElementById("rl14"), "Lower-case alphanumeric"],
		[ document.getElementById("rl15"), "Upper-case alphanumeric"],
		[ document.getElementById("rl16"), "Alphanumeric"],
		[ document.getElementById("rl17"), "Special symbols"],
		[ document.getElementById("rl18"), "Alphanumeric with special symbols"],
	];

	for (let i = 0; i < dom.rl.length; i += 1) {
		const pair = dom.rl[i];
		const rl = pair[0];
		const name = pair[1];

		rl.onclick = () => {
			const the_name = name;

			if (the_name !== "__custom__") {

				let found = false;
				for (let j = 0; j < window.word_list.length; j += 1) {
					const wl = window.word_list[j];
					if (wl.name === the_name) {
						updateList(wl.data);
						found = true;
						break;
					}
				}

				if (!found) {
					for (let j = 0; j < word_list_2.length; j += 1) {
						const wl = word_list_2[j];
						if (wl.name === the_name) {
							updateList(wl.data);
							found = true;
							break;
						}
					}
				}

			} else {
				updateList(custom_list);
			}
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
		return text.split("\n").map((x) => x.trim()).filter((x) => x.length > 0);
	}

	function updateList(word_list) {

		dom.passphrase_entropy.innerText = 0;

		words = word_list;
		dom.list_size.innerText = words.length;
		const symbol_entropy = (words.length > 0) ? Math.log2(words.length) : 0;
		dom.symbol_entropy.innerText = symbol_entropy;
	}
})();
