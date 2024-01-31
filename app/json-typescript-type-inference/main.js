import React from "../../js/3rd/es-react/react.js";
import jsx from "../../js/3rd/es-react/jsx.js";
import ReactDOM from "../../js/3rd/es-react/react-dom.js";

const { useState } = React;

function App() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	
	function handleInputChange(e) {
		const value = e.target.value;
		setInput(value);
		
		try {
			rti.forget();
		
			const jsonInput = JSON.parse(value);
			
			
			
			const type = rti.turn_type_into_typescript(
				rti.sample_value("value", jsonInput, {
					experimentalInterpretArrayAsArray: true
				}), {
					fmt: false
				}
			);
			
			setOutput(type);			
		} catch (e) {
			setOutput("Invalid JSON")
		}
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
