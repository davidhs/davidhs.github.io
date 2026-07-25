import html from "../../js/3rd/solid/html.js";

export function PageContent(props) {
	const classes = ["page-content"];
	if (props.wide) classes.push("page-content-wide");
	if (props.class) classes.push(props.class);

	return html`
		<div class=${classes.join(" ")} style=${{
			"padding-top": "10px",
			"padding-bottom": "10px",
			"margin-left": "auto",
			"margin-right": "auto",
			flex: 1,
			"font-family": "'Source Sans Pro', sans-serif",
			"font-size": "18px",
			color: "#303030",
		}}>
			${() => props.children}
		</div>
	`;
};
