import html from "../../js/3rd/solid/html.js";

export function PageBody(props) {
	return html`
		<div style=${{
			"background-color": "#D1D1D1",
			"display": "flex",
			"flex-direction": "column",
			"min-height": "100%",
		}}>
			${() => props.children}
		</div>
	`;
};
