import ReactDOM from "../../js/3rd/es-react/react-dom.js";
import jsx from "../../js/3rd/es-react/jsx.js";
import { App } from "./app.js";

ReactDOM.render(
	jsx`<${App} />`,
	document.getElementById("root")
);
