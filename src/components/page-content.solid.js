import html from "../../js/3rd/solid/html.js";

export function PageContent(props) {
	return html`
		<div style=${{
			"padding-top": "10px",
			"padding-bottom": "10px",
			"margin-left": "auto",
			"margin-right": "auto",
			"width": "600px",
			"max-width": "800px",
			flex: 1,
			"font-family": "'Source Sans Pro', sans-serif",
			"font-size": "18px",
			color: "#303030",
		}}>
			${() => props.children}
		</div>
	`;
};
