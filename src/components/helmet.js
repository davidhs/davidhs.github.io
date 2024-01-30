import ReactDOM from "../../js/3rd/es-react/react-dom.js";
import React from "../../js/3rd/es-react/react.js";
import jsx from "../../js/3rd/es-react/jsx.js";

/**
 * Very hacky helmet
 * 
 * @param {{ children: unknown[] }} props 
 */
export function Helmet(props) {

	console.log("Props:", props);

	const x = document.createElement("head");

	ReactDOM.render(
		jsx`
			${props.children.map((child, i) => {
				console.log(child);
				
				return child;
			})}
		`,
		x,
		() => {
			console.log(x.innerHTML);
			document.head.innerHTML = x.innerHTML + "\n" + document.head.innerHTML;
		},
	);

	return jsx` `;
}