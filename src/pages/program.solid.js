import { For } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

const app_links = [
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
		url: "app/3rd/kevin-decker-jsdiff-2024-02-29/index.html",
		name: "Kevin Decker's jsdiff (2024-02-29)"
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
		url: "app/passcode-generator/index.html",
		name: "Passcode Generator",
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
	{
		url: "app/astigmatism-dial-test/index.html",
		name: "Astigmatism: Dial Test",
	},
	{
		url: "app/fovea-detector/index.html",
		name: "Fovea Detector",
	},
];

// sort by name

app_links.sort((a, b) => {
	return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
});

export default function PagePrograms() {
	return html`
		<${PageBody}>
			<${PageHeader} select="Programs"/>
			<${PageContent}>
				<ul class="list-group dark">
					<${For} each=${app_links}>${(link) => 
						html`<li><a href=${link.url}>${link.name}</a></li>`
					}<//>
				</ul>
			<//>
			<${PageFooter}/>
		<//>
	`;
}
