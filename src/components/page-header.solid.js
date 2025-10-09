import html from "../../js/3rd/solid/html.js";
import { For } from "../../js/3rd/solid/solid.js";

const nav_links = [
	{
		url: "./index.html",
		name: "Home",
	},
	{
		url: "./programs.html",
		name: "Programs",
	},
	{
		url: "./links.html",
		name: "Links",
	},
	{
		url: "./thoughts.html",
		name: "Thoughts",
	},
];


export function PageHeader({ select }) {
	return html`
		<div class="nav"
			style=${{
				"box-shadow": "0px 4px 2px 0px rgba(0, 0, 0, 0.3)"
			}}
		>
			<div id="qr1">
				<span>Reiknirit</span>
			</div>
			<ul style=${{ "float": "right" }}>
				<${For} each=${nav_links}>${
					(link) => html`
						<li><a href=${link.url} style=${link.name === select ? "font-weight:bold" : null}>${link.name}</a></li>
					`
				}<//>
			</ul>
		</div>
	`;
}
