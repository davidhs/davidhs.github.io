import jsx from "../../js/3rd/es-react/jsx.js";
import { Helmet } from "../components/helmet.react.js";

function Footer() {
	return jsx`
		<footer style=${{
			backgroundColor: "#1C1C1C",
			width: "100%",
			
			height: "50px", // size of footer
			
			fontFamily: "'Source Sans Pro', sans-serif",
			fontSize: "16px",
			fontWeight: "lighter",
			color: "#C4C4C4",
			textAlign: "center",
			verticalAlign: "middle",
			lineHeight: "50px",
		}}>
			© 2015 - 2024
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
		<div style=${{
			backgroundColor: "#D1D1D1",
			display: "flex",
			flexDirection: "column",
			minHeight: "100%",
		}}>
			<div className="nav"
				style=${{
					boxShadow: "0px 4px 2px 0px rgba(0, 0, 0, 0.3)"
				}}
			>
				<div id="qr1">
					<span>Reiknirit</span>
				</div>
				<ul style=${{ float: "right" }}>
					<li><a href="./index.html" style=${{ fontWeight: "bold" }}>About</a></li>
					<li><a href="./programs.html">Programs</a></li>
					<li><a href="./links.html">Links</a></li>
				</ul>
			</div>
			<div style=${{
				paddingTop: "10px",
				paddingBottom: "10px",
				marginLeft: "auto",
				marginRight: "auto",
				maxWidth: "800px",
				flex: 1,
				fontFamily: "'Source Sans Pro', sans-serif",
				fontSize: "18px",
				color: "#303030",
			}}>
				${"<Tómt/>"}
			</div>
			<${Footer}/>
		</div>
	`;
}
