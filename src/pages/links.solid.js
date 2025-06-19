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
				<span>2025-06-19</span>
				<ul class="list-group dark">
					<li>
						<a href="https://cimc.ai/">
							California Institute for Machine Consciousness
						</a>
					</li>
					<li>
						<a href="https://jakelazaroff.com/words/homomorphically-encrypted-crdts/">
							Homomorphically Encrypting CRDTs
						</a>
					</li>
				</ul>
   				<span>2025-06-18</span>
				<ul class="list-group dark">
					<li>
						<a href="https://www.susanrigetti.com/physics">
							So You Want to Learn Physics... (Second Edition), by Susan Rigetti
						</a>
					</li>
				</ul>
   				<span>2025-03-25</span>
       			<ul class="list-group dark">
					<li>
						<a href="https://www.youtube.com/watch?v=Otvcbw6k4eo">
							I can prove I’ve solved this Sudoku without revealing it (Zero-Knowledge Proofs), by Polylog
						</a>
					</li>
				</ul>
				<span>2024-12-27</span>
				<ul class="list-group dark">
					<li>
						<a href="https://augmentingcognition.com/ltm.html">
							Augmenting Long-term Memory, by Michael Nielsen
						</a>
					</li>
				</ul>
   				<span>2024-11-14</span>
				<ul class="list-group dark">
					<li>
						<a href="https://gallantlab.org/brain-viewers/">
							GallantLab.org: Interactive brain viewers made with Pycortex
						</a>
					</li>
				</ul>
				<span>2024-08-27</span>
				<ul class="list-group dark">
					<li>
						<a href="https://www.cheetahhouse.org/">
							Cheetah House
						</a>
					</li>
					<li>
						<a href="https://www.perception.foundation/">
							Perception Restoration Foundation
						</a>
					</li>
				</ul>
				<span>2024-08-22</span>
				<ul class="list-group dark">
					<li>
						<a href="https://www.youtube.com/watch?v=9hyJxphAPZ8&list=PLPjpiUx9PU3TjM8IVWtH5CtQIeLMaE6Op">
							Roger Thisdell's Stage Theory of Enlightenment
						</a>
					</li>
					<li>
						<a href="https://deconstructingyourself.com/a-universal-theory-of-awakening.html">
							"A Universal Theory of Awakening" by Michael W. Taft
						</a>
					</li>
					<li>
						<a href="https://www.simonandschuster.com/books/The-Mind-Illuminated/John-Yates/9781501156984">
							"The Mind Illuminated: A Complete Meditation Guide Integrating Buddhist Wisdom and Brain Science for Greater Mindfulness", by John Yates, Matthew Immergut and Jeremy Graves
						</a>
					</li>
					<li>
						<a href="https://leighb.com/rc/index.html">
							A excellent book on the Jhānas: 
							<span class="font-bold">
								Right Concentration: A Practical Guide to the Jhānas, by Leigh Brasington.
							</span>
						</a>
					</li>
					<li>
						<a href="https://teachyourselfcs.com/">
							Teach Yourself Computer Science
						</a>
					</li>
					<li>
						<a href="https://www.youtube.com/watch?v=34VOI_oo-qM">
							YouTube video: Machine Learning Street Talk: 
							<span class="font-bold">
								"We Are All Software" - Joscha Bach
							</span>
						</a>
					</li>
					<li>
						<a href="https://www.preposterousuniverse.com/podcast/2024/08/19/286-blaise-aguera-y-arcas-on-the-emergence-of-replication-and-computation/">
							Sean Carroll: Mindscape - 
							<span class="font-bold">
								286 | Blaise Agüera y Arcas on the Emergence of Replication and Computation
							</span>
						</a>
					</li>
				</ul>
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
