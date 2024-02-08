import html from "../../js/3rd/solid/html.js";
import { PageFooter } from "../components/page-footer.solid.js";
import { PageHeader } from "../components/page-header.solid.js";
import { PageBody } from "../components/page-body.solid.js";
import { PageContent } from "../components/page-content.solid.js";

export default function PageLinks() {
	return html`
		<${PageBody}>
			<${PageHeader} select="Links"/>
			<${PageContent}>
				<span>2024-01-12</span>
				<ul class="list-group dark">
					<li><a href="https://deconstructingyourself.com/dy-001-mindful-right-now-guest-kenneth-folk.html">A very interesting podcast between Michael W. Taft and Kenneth Folk talking about mindfulness (or satipaṭṭhāna)": <span class="font-bold">Deconstructing yourself: Am I Mindful Right Now? with guest Kenneth Folk"</span></a></li>
				</ul>
				<span>2023-10-20</span>
				<ul class="list-group dark">
					<li><a href="https://neuroticgradientdescent.blogspot.com/2020/01/mistranslating-buddha.html">Neurotic Gradient Descent: (mis)Translating the Buddha</a></li>
					<li><a href="https://acko.net/">Acko.net: Hackery, Math & Design</a></li>
					<li><a href="https://www.gorcdc.com/post/visualization-training-mega-guide">AphantasiaMeow: Visualization Training Mega Guide</a></li>
				</ul>
			<//>
			<${PageFooter}/>
		<//>
	`;
}
