import { For } from "../../js/3rd/solid/solid.js";
import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

// TODO: Add `date` field to sort by.
const page_links = [
	{
		url: "./thoughts/2025-10-08 - Mind's eye exercise - Meditation with eyes open.md",
		name: "(2025-10-08) Mind's eye exercise: Meditation with eyes open to notice random mind's eye images appearing",
	},
	{
		url: "./thoughts/2026-01-29 - Journaling, autobiographical memory, memory streaming.md",
		name: "(2026-01-29) Journaling to strengthen one's autobiographical memory, and memory streaming",
	},
	{
		url: "./thoughts/2026-02-06 - Depersonalization and Derealization.md",
		name: "(2026-02-06) Depersonalization and Derealization",
	},
	{
		url: "./thoughts/2026-02-10 - Cravings and chewing gum.md",
		name: "(2026-02-10) Cravings and chewing gum",
	},
	{
		url: "./thoughts/2026-02-10 - Dream journaling, REM interruption, and visualization.md",
		name: "(2026-02-10) Dream journal and dream-interruption induced visualization",
	},
	{
		url: "./thoughts/2026-03-11 - Meditation related exercise.md",
		name: "(2026-03-11) Meditation related exercise",
	},
	{
		url: "./thoughts/2026-05-01 - Visualization Exercise.md",
		name: "(2026-05-01) Visualization Exercise",
	},
	{
		url: "./thoughts/2026-05-06 - Phantasia Exercise - There and Back Again.md",
		name: "(2026-05-06) Phantasia Exercise: There and Back Again",
	},
	{
		url: "./thoughts/2026-05-16 - Realtime Construction of Objects.md",
		name: "(2026-05-16) Realtime Construction of Objects",
	},
	{
		url: "./thoughts/2026-06-02 - AI Anxiety.md",
		name: "(2026-06-02) AI Anxiety",
	},
];

// TODO: In the future, sort by date in descending order.
page_links.sort((a, b) => {
	return b.name.toLocaleLowerCase().localeCompare(a.name.toLocaleLowerCase());
});

export default function PagePrograms() {
	return html`
		<${PageBody}>
			<${PageHeader} select="Thoughts"/>
			<${PageContent}>
				<p>This page is a list of random thoughts I've had. If I want to write something quick and dirty, unpolished, I publish it here.</p>
				<p>Thoughts:</p>

				<ul class="list-group dark">
					<${For} each=${page_links}>${(link) => {
						const mdlink = encodeURIComponent(link.url);

						return html`<li><a href=${"./thought.html?mdlink=" + mdlink}>${link.name}</a></li>`;
					}
					}<//>
				</ul>
			<//>
			<${PageFooter}/>
		<//>
	`;
}
