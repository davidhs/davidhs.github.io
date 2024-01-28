import ReactDOM from "../$lib/3rd/es-react/react-dom.js";
import jsx from "../$lib/3rd/es-react/jsx.js";
import { App } from "./app.js";

ReactDOM.render(
	jsx`<${App} />`,
	document.getElementById("root")
);
