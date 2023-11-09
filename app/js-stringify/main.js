console.clear();

const dom_textarea_input = document.createElement("textarea");
dom_textarea_input.rows = 10;
dom_textarea_input.cols = 60;
document.body.appendChild(dom_textarea_input);

document.body.appendChild(document.createElement("br"));

const dom_button = document.createElement("button");
dom_button.innerText = "Convert";
document.body.appendChild(dom_button);

document.body.appendChild(document.createElement("br"));

const dom_textarea_output = document.createElement("textarea");
dom_textarea_output.rows = 10;
dom_textarea_output.cols = 60;
document.body.appendChild(dom_textarea_output);

dom_button.onclick = (e) => {
	const x = dom_textarea_input.value;
	dom_textarea_output.value = JSON.stringify(dom_textarea_input.value);
};
