import React from "../../js/3rd/es-react/react.js";
import jsx from "../../js/3rd/es-react/jsx.js";
import ReactDOM from "../../js/3rd/es-react/react-dom.js";

const { useState } = React;

function App() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [flagFmt, setFlatFmt] = useState(false);
	
	function updateOutput(input, flagFmt) {
		try {
			rti.forget();
		
			const jsonInput = JSON.parse(input);
			
			const type = rti.turn_type_into_typescript(
				rti.sample_value("value", jsonInput, {
					experimentalInterpretArrayAsArray: true
				}), {
					fmt: flagFmt
				}
			);
			
			setOutput(`type T = ${type}`);
		} catch (e) {
			setOutput("Invalid JSON")
		}
	}
	
	function handleInputChange(e) {
		const input = e.target.value;
		setInput(input);
		updateOutput(input, flagFmt);
	}
	
	function handleCheckFormat(e) {
		const flagFmt = e.target.checked;
		setFlatFmt(flagFmt);
		updateOutput(input, flagFmt);
	}

	return jsx`
		<div>
			Input (JSON)
			<br/>
			<textarea
				cols=80
				rows=20
				placeholder="Enter JSON here"
				value=${input}
				onChange=${handleInputChange}
			/>
			
			<br/>
			<br/>
			
			
			Output (TypeScript)
			${" "} <input type="checkbox" onChange=${handleCheckFormat}/> Format
			<br/>
			<textarea
				cols=80
				rows=20
				placeholder="TypeScript definition"
				value=${output}
				readOnly
			/>
		</div>
	`;
}

ReactDOM.render(
	jsx`<${App} />`,
	document.getElementById("root")
);
