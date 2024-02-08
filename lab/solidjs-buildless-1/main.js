import { onCleanup, createSignal } from "../../js/3rd/solid/solid.js";
import { render } from "../../js/3rd/solid/web.js";
import html from "../../js/3rd/solid/html.js";

function Button(props) {
	return html`<button class="btn-primary" ...${props} />`;
}

function ButtonCounter() {
	const [count, setCount] = createSignal(0);
	const increment = (e) => setCount((c) => c + 1);
	
	return html`<${Button} type="button" onClick=${increment}>${count}<//>`;
}

function AutomaticCounter() {
	const [count, setCount] = createSignal(0);
	const timer = setInterval(() => setCount(count() + 1), 1000);
	onCleanup(() => clearInterval(timer));

	return html`<div>${count}</div>`;
}

const App = () => {
	const [count, setCount] = createSignal(0);
	const timer = setInterval(() => setCount(count() + 1), 1000);
	onCleanup(() => clearInterval(timer));

	return html`
		<div>
			<${AutomaticCounter}/>
			<${ButtonCounter}/>
		</div>
	`;
};

render(App, document.body);