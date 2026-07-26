import { createSignal, onMount, For, Show } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

const DATA_URL = "./data/jbcc.json";
const DATE_COLUMN = "Date";

/**
 * The data file is a plain list of entries and keeps every field of the source
 * spreadsheet. These are the fields the page shows, in the order it shows them;
 * the rest are carried along in the file but not rendered.
 */
const RENDERED_COLUMNS = [DATE_COLUMN, "Name", "URL(s)"];

function isUrl(value) {
	return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * Shown without the scheme and the "www." so the link reads as
 * "youtube.com/watch?v=bCu57hWMy0Y" rather than the full URL. The href and the
 * title attribute both keep the URL intact.
 */
function urlLabel(url) {
	return url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

function Link({ url }) {
	return html`<a href=${url} title=${url} rel="noopener noreferrer">${urlLabel(url)}</a>`;
}

/**
 * Fades in an edge shadow on whichever side the table can still be scrolled
 * towards, and removes it once that end is reached. Driven from the scroll
 * position rather than declared in CSS, because CSS cannot tell whether an
 * element is scrolled away from either end.
 *
 * @param {HTMLElement} frame
 */
function attachScrollHints(frame) {
	const scroller = frame.querySelector(".table-scroll");
	if (!scroller) return;

	const update = () => {
		const furthest = scroller.scrollWidth - scroller.clientWidth;
		// A pixel of slack: fractional layout widths mean scrollLeft rarely hits
		// the ends exactly.
		frame.classList.toggle("can-scroll-left", scroller.scrollLeft > 1);
		frame.classList.toggle("can-scroll-right", scroller.scrollLeft < furthest - 1);
	};

	scroller.addEventListener("scroll", update, { passive: true });

	// The table has no width yet when this runs, so the first measurement has to
	// wait for it to be laid out; observing it also covers the window being
	// resized and the web font arriving and changing the column widths.
	if (typeof ResizeObserver === "undefined") {
		window.addEventListener("resize", update);
	} else {
		const observer = new ResizeObserver(update);
		observer.observe(scroller);
		const table = scroller.querySelector("table");
		if (table) observer.observe(table);
	}

	requestAnimationFrame(update);
}

/**
 * The table is rendered asynchronously once the data arrives, and neither a ref
 * callback nor the node the template returns gives back the element that ends up
 * in the document with this html runtime, so wait for it to appear.
 *
 * @param {number} attemptsLeft
 */
function attachScrollHintsWhenRendered(attemptsLeft = 120) {
	// Waits for the scrolling child, not just the frame: the frame is inserted
	// into the document before it has been filled in, so looking for the frame
	// alone finds it a moment too early and there is nothing to attach to.
	const scroller = document.querySelector(".table-frame .table-scroll");

	if (scroller) {
		attachScrollHints(scroller.parentElement);
		return;
	}

	if (attemptsLeft > 0) {
		requestAnimationFrame(() => attachScrollHintsWhenRendered(attemptsLeft - 1));
	}
}

/**
 * Dates are zero padded, so a plain string comparison already orders them
 * correctly; undated entries sink to the bottom. The data file is stored sorted
 * too, but the page sorts on its own so the order on screen never depends on the
 * order in the file.
 */
function byDateDescending(a, b) {
	const da = String(a[DATE_COLUMN] ?? "").trim();
	const db = String(b[DATE_COLUMN] ?? "").trim();
	if (da === db) return 0;
	if (da === "") return 1;
	if (db === "") return -1;
	return db < da ? -1 : 1;
}

function Cell({ value }) {
	if (Array.isArray(value)) {
		if (value.length === 0) return html`<td></td>`;

		return html`
			<td>
				<ul class="cell-links">
					<${For} each=${value}>${
						(item) => html`<li>${isUrl(item) ? Link({ url: item }) : String(item)}</li>`
					}<//>
				</ul>
			</td>
		`;
	}

	if (value === null || value === undefined || value === "") return html`<td></td>`;
	if (isUrl(value)) return html`<td>${Link({ url: value })}</td>`;

	return html`<td>${String(value)}</td>`;
}

export default function PageJoschaBachContentCompilation() {
	const [rows, setRows] = createSignal([]);
	const [error, setError] = createSignal("");
	const [loading, setLoading] = createSignal(true);

	onMount(async () => {
		try {
			const res = await fetch(DATA_URL, { credentials: "same-origin" });
			if (!res.ok) throw new Error(`Failed to fetch ${DATA_URL}: ${res.status}`);

			const data = await res.json();
			if (!Array.isArray(data)) throw new Error(`${DATA_URL} should contain a list of entries`);

			setRows(data);
		} catch (e) {
			setError(String(e && e.message ? e.message : e));
		} finally {
			setLoading(false);
			attachScrollHintsWhenRendered();
		}
	});

	return html`
		<${PageBody}>
			<${PageHeader} select="Misc"/>
			<${PageContent} class="page-content-table">
				<h2>Joscha Bach Content Compilation</h2>

				${Show({
					when: () => !loading(),
					fallback: html`<div>Loading...</div>`,
					children: () => {
						if (error()) return html`<pre>${error()}</pre>`;
						if (rows().length === 0) return html`<p>No entries yet.</p>`;

						return html`
							<div class="table-frame">
								<div class="table-scroll">
									<table class="data-table compilation-table">
										<thead>
											<tr>
												<${For} each=${RENDERED_COLUMNS}>${
													(column) => html`<th>${column}</th>`
												}<//>
											</tr>
										</thead>
										<tbody>
											<${For} each=${[...rows()].sort(byDateDescending)}>${
												(row) => html`
													<tr>
														<${For} each=${RENDERED_COLUMNS}>${
															(column) => Cell({ value: row[column] })
														}<//>
													</tr>
												`
											}<//>
										</tbody>
									</table>
								</div>
							</div>
						`;
					}
				})}
			<//>
			<${PageFooter}/>
		<//>
	`;
}
