// Simulate wave equation using a lattice of springs
// -------------------------------------------------
//
// The wave equation in the one-dimensional case can be derived from Hooke's law (see https://en.wikipedia.org/wiki/Wave_equation#From_Hooke's_law).
// In this program we simulate a lattice of masses connected horizontally, vertically, and diagonally to neighbouring masses with springs.
// 
//
// TODO: Use web workers to spread load.
// TODO: Add Gaussian brush

import {
    bresenhams_line_algorithm,
    offset_kernel,
    unsafe_transmute,
    unwrap,
} from "./utils.js";



function createSimulator() {

	/**
	 * @typedef {{ mass: number, y: number, yv: number, yf: number, active: boolean }} Particle
	 */

	const defaultCanvas = document.createElement("canvas");



	const canvas_scaling = 4;

	let canvas = defaultCanvas;
	let ctx = unwrap(canvas.getContext("2d"));
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let { data } = imageData;

	

	/**
	 * Public state
	 */
	const state = {
		damping_factor: 0,
		spring_stiffness: 0.001,
		spring_mass: 10,

		brush_size: 2,
		brush_strength: 1000,
		
		
		
		eraser_on: false,
		is_brush_oscillating: true,
		brush_oscillation_frequency: 0.01,
	};
	
	
	let brush_time = 0;

	let mouse_down = false;
	let left_mouse_button_down = false;

	let mouse_xp = 0;
	let mouse_yp = 0;

	// Initialize masses

	//       x   x + 1
	// y
	// y + 1

	/** @type {Particle[][]} */
	let particles = [];
	

	setCanvas(defaultCanvas);


	function initParticles() {
		particles = [];

		for (let y = 0; y < canvas.height; y++) {
			/** @type {Particle[]} */
			const column = [];
			
			for (let x = 0; x < canvas.width; x++) {
				/** @type {Particle} */
				const particle = {
					mass: state.spring_mass,
					// Position
					y: 0,
					// Velocity
					yv: 0,
					// Force
					yf: 0,
					active: true,
				};
				
				column.push(particle);
			}
			
			particles.push(column);
		}
	}
	



	/**
	 * @param {number} x 
	 * @param {number} y 
	 * @param {(particle: Particle) => void} callback
	 */
	function applyToParticle(x, y, callback) {
		if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
		const particle = particles[y][x];
		
		callback(particle);
	}

	/**
	 * 
	 * @param {number} ax 
	 * @param {number} ay 
	 * @param {number} ox 
	 * @param {number} oy 
	 * @param {(particle: Particle, distanceSquared: number) => void} callback 
	 */
	function applyToOffset(ax, ay, ox, oy, callback) {
		const bx = ax + ox;
		const by = ay + oy;
		
		if (bx < 0 || bx >= canvas.width || by < 0 || by >= canvas.height) return;
		const b = particles[by][bx];
		
		const distance_squared = ox * ox + oy * oy;
		
		callback(b, distance_squared);
	}

	let is_updating = true;

	/**
	 * @param {number} dt
	 */
	function simulationIteration(dt) {

		// Re-apply brush if applicable.
		if (left_mouse_button_down) {
			offset_kernel(state.brush_size, (ox, oy) => {
				applyToParticle(mouse_xp + ox, mouse_yp + oy, (p) => {
					if (state.is_brush_oscillating) p.y = state.brush_strength * Math.cos(brush_time * state.brush_oscillation_frequency)
					else p.y = state.brush_strength;
				});
			});
		}

		update(dt);
		render(dt);
	}

	let previousIterationTime = 0;

	/**
	 * @param {number} dt 
	 */
	function update(dt) {
		if (!is_updating) return;
    
		brush_time += dt;
		
		// Compute forces
		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const a = particles[y][x];
				
				if (!a.active) continue;
				
				/**
				 * @param {Particle} b 
				 * @param {number} distance_squared 
				 */
				const computeForce = (b, distance_squared) => {
					if (!b.active) return;
					
					const k = state.spring_stiffness;
					
					// Force to apply to mass
					let F_sum = 0;
					
					// Hooke's law. Here we apply the restoring force of the spring
					// to the displacement.
					const F_hookes_law = -k * (a.y - b.y); // / distance_squared
					F_sum += F_hookes_law;
					
					// Apply damping. The resistance to motion is directly proportional to the velocity of
					// the mass and opposes the motion.
					const R = state.damping_factor;
					const F_damping = -R * a.yv;
					
					F_sum += F_damping;
					
					a.yf += F_sum;
				};
				
				
				applyToOffset(x, y, 0, -1, computeForce);
				applyToOffset(x, y, 1, -1, computeForce);
				applyToOffset(x, y, 1, 0, computeForce);
				applyToOffset(x, y, 1, 1, computeForce);
				applyToOffset(x, y, 0, 1, computeForce);
				applyToOffset(x, y, -1, 1, computeForce);
				applyToOffset(x, y, -1, 0, computeForce);
				applyToOffset(x, y, -1, -1, computeForce);
			}
		}
		
		
		
		// Apply and reset forces. Draw.
		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const p = particles[y][x];
				const i = 4 * (y * canvas.width + x);
				
				if (p.active) {
					const pya = p.yf / p.mass;
					const pyv = p.yv + dt * pya;
					const py = p.y + dt * pyv;
					
					p.yv = pyv;
					p.y = py; // * displacement_damping;
					
					// Reset force
					p.yf = 0;
				} else {
					p.yf = 0;
					p.yv = 0;
					p.y = 0;
				}
			}
		}
	}

	/**
	 * @param {number} dt 
	 */
	function render(dt) {
		// Apply and reset forces. Draw.
		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				const p = particles[y][x];
				const i = 4 * (y * canvas.width + x);
				
				if (p.active) {
					
					// Draw
					if (p.y > 0) {
						data[i + 0] = 0;
						data[i + 1] = p.y;
						data[i + 2] = 0; // 100 * Math.abs(p.yv);
						data[i + 3] = 255;
					}
					else {
						data[i + 0] = -p.y;
						data[i + 1] = 0;
						data[i + 2] = 0; // 100 * Math.abs(p.yv);
						data[i + 3] = 255;
					}
				} else {
					data[i + 0] = 128;
					data[i + 1] = 128;
					data[i + 2] = 128;
					data[i + 3] = 255;
				}
			}
		}
		
		ctx.putImageData(imageData, 0, 0);
	}

	/**
	 * @param {number} t 
	 */
	function iterateSimulation(t) {
		const dt = t - previousIterationTime;
		previousIterationTime = t;

		simulationIteration(dt);

		requestAnimationFrame(iterateSimulation);
	}

	/**
	 * @param {HTMLCanvasElement} pCanvas 
	 */
	function setCanvas(pCanvas) {
		canvas = pCanvas;
		canvas.style.width = `${canvas_scaling * canvas.width}px`;
		canvas.style.height = `${canvas_scaling * canvas.height}px`;

		ctx = unwrap(canvas.getContext("2d"));
		imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		data = imageData.data;

		initParticles();


		canvas.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
		
		canvas.addEventListener("mouseenter", (e) => {
			const rect = canvas.getBoundingClientRect();
			const canvas_x = e.clientX - rect.left;
			const canvas_y = e.clientY - rect.top;
			
			const x = Math.floor(canvas_x / canvas_scaling);
			const y = Math.floor(canvas_y / canvas_scaling);
			
			mouse_xp = x;
			mouse_yp = y;
		});
		
		canvas.addEventListener("mousedown", (e) => {
			const rect = canvas.getBoundingClientRect();
			const canvas_x = e.clientX - rect.left;
			const canvas_y = e.clientY - rect.top;
			
			const x = Math.floor(canvas_x / canvas_scaling);
			const y = Math.floor(canvas_y / canvas_scaling);
			
			if (e.button === 0) {
				offset_kernel(state.brush_size, (ox, oy) => {
					applyToParticle(x + ox, y + oy, (p) => {
						if (state.is_brush_oscillating) p.y = state.brush_strength * Math.cos(brush_time * state.brush_oscillation_frequency)
						else p.y = state.brush_strength;
					});
				});
				
				left_mouse_button_down = true;
			}
			else if (e.button === 2) {
				offset_kernel(state.brush_size, (ox, oy) => {
					applyToParticle(x + ox, y + oy, (p) => {
						p.active = state.eraser_on;
					});
				});
			}
			
			mouse_down = true;
			
			mouse_xp = x;
			mouse_yp = y;
		});
		
		/**
		 * @param {MouseEvent} e 
		 */
		function mouseMoveListener(e) {
			if (mouse_down) {
				const rect = canvas.getBoundingClientRect();
				const canvas_x = e.clientX - rect.left;
				const canvas_y = e.clientY - rect.top;
				
				const x = Math.floor(canvas_x / canvas_scaling);
				const y = Math.floor(canvas_y / canvas_scaling);
				
				offset_kernel(state.brush_size, (ox, oy) => {
					bresenhams_line_algorithm(ox + mouse_xp, oy + mouse_yp, ox + x, oy + y, (x, y) => {
						if (e.buttons === 1) {
							applyToParticle(x, y, (p) => {
								if (state.is_brush_oscillating) p.y = state.brush_strength * Math.cos(brush_time * state.brush_oscillation_frequency)
								else p.y = state.brush_strength;
							});
						}
						else if (e.buttons === 2) {
							applyToParticle(x, y, (p) => {
								p.active = state.eraser_on;
							});
						}
					});
				});
				
				mouse_xp = x;
				mouse_yp = y;
			}
		}
		
		canvas.addEventListener("mousemove", mouseMoveListener);
		
		canvas.addEventListener("mouseout", mouseMoveListener);
		
		canvas.addEventListener("mouseup", (e) => {
			mouse_down = false;
			left_mouse_button_down = false;
		});
		
		document.onkeydown = (e) => {
			if (e.key === "e") {
				// Toggle eraser
				
				/** @type {HTMLInputElement} */
				const checkbox = unsafe_transmute(unwrap(document.getElementById("eraser")));
				
				checkbox.click();e
			}
			
			if (e.key === "c") {
				for (let i = 0; i < particles.length; i++) {
					for (let j = 0; j < particles[i].length; j++) {
						const particle = particles[i][j];
						
						particle.yf = 0;
						particle.y = 0;
						particle.yv = 0;
					}
				}
			}
			
			if (e.key === "t") {
				is_updating = !is_updating;
			}
		};
	}

	function start() {
		requestAnimationFrame(iterateSimulation)
	}

	function cleanup() {
		// TODO: implement?
	}

	return {
		iterateSimulation,
		setCanvas,
		start,
		cleanup,
		state,
	};
}

export { createSimulator };

