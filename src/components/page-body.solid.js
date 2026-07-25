import html from "../../js/3rd/solid/html.js";

export function PageBody(props) {
	return html`
		<div class="page-body">
			${() => props.children}
		</div>
	`;
};
