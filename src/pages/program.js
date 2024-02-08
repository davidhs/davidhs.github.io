import { For } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";

const links = [
	{
		url: "app/2d-wave-equation-spring-lattice-simulation/index.html",
		name: "2D wave equation spring-lattice simulation",
	},
	{
		url: "app/bnfgen/index.html",
		name: "Backus-Naur form generator",
	},
	{
		url: "app/clock/index.html",
		name: "Clock",
	},
	{
		url: "app/color-flow/index.html",
		name: "Color Flow",
	},
	{
		url: "app/conways-game-of-life/index.html",
		name: "Conway's Game of Life",
	},
	{
		url: "app/f4hacker/index.html",
		name: "Fallout 4 Terminal Hacker",
	},
	{
		url: "app/graphical-task-manager/index.html",
		name: "Graphical Task Manager",
	},
	{
		url: "app/gravitation/index.html",
		name: "Gravitation",
	},
	{
		url: "app/graphinter/index.html",
		name: "Interactive Graph",
	},
	{
		url: "app/iphone-kasina/index.html",
		name: "iPhone Kasina",
	},
	{
		url: "app/js-regex-checker/index.html",
		name: "JavaScript Regular Expression Checker",
	},
	{
		url: "app/json-sort/index.html",
		name: "JSON Sort",
	},
	{
		url: "app/json-stringify/index.html",
		name: "JSON Stringify & Parse",
	},
	{
		url: "app/json-typescript-type-inference/index.html",
		name: "JSON TypeScript Type Inference",
	},
	{
		url: "app/ll1-grammar/index.html",
		name: "LL(1) assistant: FIRST, FOLLOW, parsing table and syntax diagram",
	},
	{
		url: "app/tol308lokaverkefni/index.html",
		name: "Lokaverkefni í Tölvuleikjaforritun",
	},
	{
		url: "app/mandelbrot/index.html",
		name: "Mandelbrot Set",
	},
	{
		url: "app/noise/index.html",
		name: "Noise",
	},
	{
		url: "app/okjst/index.html",
		name: "Open Kattis JavaScript Tester",
	},
	{
		url: "app/page-tracker/index.html",
		name: "Page Tracker",
	},
	{
		url: "app/passphrase/index.html",
		name: "Passphrase",
	},
	{
		url: "app/pcctdg/index.html",
		name: "Perceptual Color Contrast Training Data Generator",
	},
	{
		url: "app/quadsel/index.html",
		name: "Quadrilateral Selection Tool",
	},
	{
		url: "app/r6s-mouse/index.html",
		name: "Rainbow Six Siege: mouse settings",
	},
	{
		url: "app/tapper/index.html",
		name: "Tapper",
	},
];


function Footer() {
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


export default function PagePrograms() {
	return html`
		<div style=${{
			"background-color": "#D1D1D1",
			"display": "flex",
			"flex-direction": "column",
			"min-height": "100%",
		}}>
			<div class="nav"
				style=${{
					"box-shadow": "0px 4px 2px 0px rgba(0, 0, 0, 0.3)"
				}}
			>
				<div id="qr1">
					<span>Reiknirit</span>
				</div>
				<ul style=${{ "float": "right" }}>
					<li><a href="./index.html">About</a></li>
					<li><a href="./programs.html" style=${{ "font-weight": "bold" }}>Programs</a></li>
					<li><a href="./links.html">Links</a></li>
				</ul>
			</div>
			<div style=${{
				"padding-top": "10px",
				"padding-bottom": "10px",
				"margin-left": "auto",
				"margin-right": "auto",
				"max-width": "800px",
				flex: 1,
				"font-family": "'Source Sans Pro', sans-serif",
				"font-size": "18px",
				color: "#303030",
			}}>
				<ul class="list-group dark">
					<${For} each=${links}>${(link) => 
						html`<li><a href=${link.url}>${link.name}</a></li>`
					}<//>
				</ul>
			</div>
			<${Footer}/>
		</div>
	`;
}
