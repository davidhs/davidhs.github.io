import jsx from "../../js/3rd/es-react/jsx.js";
import { Helmet } from "../components/helmet.react.js";

function Footer() {
	return jsx`
		<footer style=${{
			backgroundColor: "#1C1C1C",
			width: "100%",
			
			minHeight: "50px", // size of footer; grows instead of clipping when it wraps
			
			fontFamily: "'Source Sans Pro', sans-serif",
			fontSize: "16px",
			fontWeight: "lighter",
			color: "#C4C4C4",
			textAlign: "center",
			verticalAlign: "middle",
			lineHeight: "50px",
		}}>
			© 2015 - 2026
			${" "}
			<a
				style=${{
					textDecoration: "none",
					color: "#D4D4D4",
					fontWeight: "bold",
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

export default function PageIndex() {
	return jsx`
		<div className="page-body">
			<div className="nav"
				style=${{
					boxShadow: "0px 4px 2px 0px rgba(0, 0, 0, 0.3)"
				}}
			>
				<div id="qr1">
					<img src="./img/logo.svg" alt="Reiknirit"/>
				</div>
				<ul style=${{ float: "right" }}>
					<li><a href="./index.html" style=${{ fontWeight: "bold" }}>Home</a></li>
					<li><a href="./programs.html">Programs</a></li>
					<li><a href="./links.html">Links</a></li>
					<li><a href="./thoughts.html">Thoughts</a></li>
					<li><a href="./misc.html">Misc</a></li>
				</ul>
			</div>
			<div className="page-content page-content-wide" style=${{
				paddingTop: "10px",
				paddingBottom: "10px",
				marginLeft: "auto",
				marginRight: "auto",
				flex: 1,
				fontFamily: "'Source Sans Pro', sans-serif",
				fontSize: "18px",
				color: "#303030",
			}}>
				<p>Hi 👋</p>

				<p>My name is Davíð and welcome to my web site.</p>

				<p>This web site contains an assortment of "fun" programs, links to subjects/topics I enjoy, and my disjointed and meandering thoughts written in text.</p>
			</div>
			<${Footer}/>
		</div>
	`;
}
