import html from "../../js/3rd/solid/html.js";

export function PageFooter() {
	return html`
		<footer style=${{
			"background-color": "#1C1C1C",
			width: "100%",
			
			height: "50px", // size of footer
			
			"font-family": "'Source Sans Pro', sans-serif",
			"font-size": "16px",
			"font-weight": "lighter",
			color: "#C4C4C4",
			"text-align": "center",
			"vertical-align": "middle",
			"line-height": "50px",
		}}>
			© 2015 - 2024
			${" "}
			<a
				style=${{
					"text-decoration": "none",
					color: "#D4D4D4",
					"font-weight": "bold",
				}}
				href="mailto:david@reiknir.it"
			>
				Davíð Helgason
			</a>
			${" "}
			All rights reserved.
		</footer>
	`;
}