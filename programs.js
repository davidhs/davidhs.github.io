import "./js/3rd/solid/solid.js";
import "./js/3rd/solid/html.js";
import { render } from "./js/3rd/solid/web.js";

import Page from "./src/pages/program.solid.js";

window.addEventListener('load', (event) => {
    render(Page, document.body);
});
