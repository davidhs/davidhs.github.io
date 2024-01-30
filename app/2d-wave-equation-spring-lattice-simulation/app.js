import React from "../../js/3rd/es-react/react.js";
import jsx from "../../js/3rd/es-react/jsx.js";
import { createSimulator } from "./simulator.js";

const { useState, useRef, useEffect } = React;

/**
 * @param {{ callback?: (newValue: number) => void, min?: number, max?: number, step?: number, start?: number, label: string }} props 
 */
function NumberController(props) {
	const [value, setValue] = useState(props.start ?? 50);

	/** @param {Event} e */
	function onChange(e) {
		const newValue = e.target.value;
		setValue(newValue);
		if (props.callback) props.callback(newValue);
	}

	return jsx`
		<div>
			${props.label}: <input type="range" onChange=${onChange} value=${value} step=${props.step ?? 1} min=${props.min ?? 0} max=${props.max ?? 100} />
			<input type="number" onChange=${onChange} value=${value} step=${props.step ?? 1} min=${props.min ?? 1} max=${props.max ?? 100} />
		</div>
	`;
}

/**
 * @param {{ label: string, start?: boolean, callback?: (value: boolean) => void }} props 
 */
function BooleanController(props) {
	const [isChecked, setIsChecked] = useState(props.start ?? false);

	/** @param {Event} e */
	function onChange(e) {
		/** @type {boolean} */
		const value = e.target.checked;
		setIsChecked(value);

		if (props.callback) props.callback(value);
	}

	return jsx`
		<div>
			<input type="checkbox" checked=${isChecked} onChange=${onChange}/>
			<label>${props.label}</label>
		</div>
	`;
}


export function App() {
	const canvasRef = useRef(null);

	const simulator = createSimulator();

	useEffect(() => {
		/** @type {HTMLCanvasElement} */
		const canvas = canvasRef.current;

		const scale = 30;

		canvas.width = 8 * scale;
		canvas.height = 5 * scale;

		simulator.setCanvas(canvas);
		simulator.start();
		
		return () => {
			simulator.cleanup();
		};
	}, []);

	return jsx`
		<div>
			<canvas ref=${canvasRef}></canvas>
			<br/>
			<${NumberController} label="Damping factor" start=${simulator.state.damping_factor} min=${0} max=${1} step=${0.0001} callback=${(value) => { simulator.state.damping_factor = value; }}/>

			<${NumberController} label="Spring stiffness" start=${simulator.state.spring_stiffness} min=${0.0001} max=${1} step=${0.001} callback=${(value) => { simulator.state.spring_stiffness = value; }} />
			<${NumberController} label="Spring mass" start=${simulator.state.spring_mass} min=${1} max=${100} step=${1} callback=${(value) => { simulator.state.spring_mass = value; }} />
			<${NumberController} label="Brush size" start=${simulator.state.brush_size} min=${1} max=${20} step=${1} callback=${(value) => { simulator.state.brush_size = value; }} />
			<${NumberController} label="Brush strength" start=${simulator.state.brush_strength} min=${1} max=${2000} step=${1} callback=${(value) => { simulator.state.brush_strength = value; }} />

			<${BooleanController} label="Eraser" start=${simulator.state.eraser_on} callback=${(value) => { simulator.state.eraser_on = value; }} />
			<${BooleanController} label="Oscillating" start=${simulator.state.is_brush_oscillating} callback=${(value) => { simulator.state.is_brush_oscillating = value; }} />

			<${NumberController} label="Oscillation frequency" start=${simulator.state.brush_oscillation_frequency} min=${0.001} max=${0.02} step=${0.0001} callback=${(value) => { simulator.state.brush_oscillation_frequency = value; }} />

			<ul>
				<li>Check Eraser or press E to toggle eraser</li>
				<li>Hold the right-mouse button to draw wall or erase wall.</li>
				<li>Press C to clear the waves</li>
				<li>Press T to pause or resume</li>
			</ul>

		</div>
	`;
}
