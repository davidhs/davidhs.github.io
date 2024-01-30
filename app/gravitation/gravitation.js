import { assert, wrap } from "./lib.js";
import { Animator } from "./animator.js";

document.body.innerHTML = ""





const canvas = document.createElement("canvas");
canvas.style.border = "1px solid black";
canvas.width = 500;
canvas.height = 500;

const ctx = canvas.getContext("2d");

if (false && window.devicePixelRatio > 1) {
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	canvas.width = canvasWidth * window.devicePixelRatio;
	canvas.height = canvasHeight * window.devicePixelRatio;
	canvas.style.width = canvasWidth + "px";
	canvas.style.height = canvasHeight + "px";

	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

////////////////
// <CONTROLS> //
////////////////

const min_distance = 100;
const mouse_mass = 1000;
const gravitational_constant = 0.001;
const distance_scaling = 1.0;

// Starts to lag at 5_000 particles (serious lag at 10_000 particles). Still
// kind of smooth at 3_000 particles.
const nr_of_particles = 1_000;

/////////////////
// </CONTROLS> //
/////////////////

// NOTE: we want to capture the energy of the system. The energy
// should be conserved as the simulation unfolds.

// The total energy of a system is the sum of kinetic and gravitational potential energy,
// and this total energy is conserved in orbital motion.

const mouse = {
	x: 0,
	y: 0,

	down: false,
};

canvas.addEventListener("mousedown", (e) => {
	mouse.down = true;

	const rect = canvas.getBoundingClientRect()
	const x = e.clientX - rect.left
	const y = e.clientY - rect.top

	mouse.x = x;
	mouse.y = y;
});

canvas.addEventListener("mousemove", (e) => {
	if (mouse.down) {
		const rect = canvas.getBoundingClientRect()
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		mouse.x = x;
		mouse.y = y;
	}
});

canvas.addEventListener("mouseup", (e) => {
	mouse.down = false;
});

document.body.appendChild(canvas);


const particles = [];

for (let i = 0; i < nr_of_particles; i++) {
	// velocity
	const v_angle = 2.0 * Math.PI * Math.random();
	const v_speed = 0.1 * Math.random();

	// location
	const l_angle = 2.0 * Math.PI * Math.random();
	const l_radius = Math.random() * Math.max(canvas.width, canvas.height);
	const l_x0 = canvas.width / 2;
	const l_y0 = canvas.height / 2;


	const particle = {
		// mass
		m: (1 + 10 * Math.random()), // * (Math.random() < 0.5 ? -1 : 1),

		// location
		x: l_x0 + l_radius * Math.cos(l_angle),
		y: l_y0 + l_radius * Math.sin(l_angle),

		//x: -canvas.width + Math.random() * 3 * canvas.width,
		//y: -canvas.height + Math.random() * 3 * canvas.height,

		// velocity
		v_x: Math.cos(v_angle) * v_speed,
		v_y: Math.sin(v_angle) * v_speed,

		radius: 0.5 + 2 * Math.random(),

		// color,
		color: `rgb(${Math.floor(256 * Math.random())}, ${Math.floor(256 * Math.random())}, ${Math.floor(256 * Math.random())})`,

		// Force (for calculation),
		f_x: 0,
		f_y: 0,
	};

	particles.push(particle);
}


const animator = new Animator((dt) => {
	////////////
	// UPDATE //
	////////////

	{
		// F = G * m_1 * m_2 / d^2

		// F = m * a
		// a = F / m

		// v(t) = v_0 + a * t

		// v_x = v_x_0 + F_x / m * t
		// v_y = v_y_0 + F_y / m * t

		// Gravitational constant
		const G = gravitational_constant;

		// * Particles should accelerate towards each other.
		// * First we should accumulate all force that is being
		//   applied to the particle, then we apply it.

		//   j ->
		// i . x x x
		// | . . x x
		// v . . . x
		//   . . . .

		const n = particles.length;

		// Compute all forces
		for (let i = 0; i < n - 1; i++) {
			const p = particles[i];

			for (let j = i + 1; j < n; j++) {
				const q = particles[j];

				const dx = q.x - p.x;
				// points from a to b
				const dy = q.y - p.y;
				// points from a to b

				let d_sq = Math.max(dx * dx + dy * dy, min_distance);

				// How much force p pulls q, and q pulls p.
				const F = G * p.m * q.m / (d_sq * distance_scaling * distance_scaling);

				const d = Math.sqrt(dx * dx + dy * dy) * distance_scaling;

				const ux = dx / d;
				const uy = dy / d;

				// Force from a to b.
				const F_x = F * ux;
				const F_y = F * uy;

				// TODO: this could be reversed.

				p.f_x += F_x;
				p.f_y += F_y;

				q.f_x += -F_x;
				q.f_y += -F_y;

			}
		}

		// Apply all forces
		for (const p of particles) {
			// TODO: apply force
			// v_x = v_x_0 + F_x / m * t
			// v_y = v_y_0 + F_y / m * t

			// If mouse, apply force,
			if (mouse.down) {
				const dx = mouse.x - p.x;
				// points from a to b
				const dy = mouse.y - p.y;
				// points from a to b

				let d_sq = Math.max(dx * dx + dy * dy, min_distance);

				// How much force p pulls q, and q pulls p.
				const F = G * mouse_mass * p.m / (d_sq * distance_scaling * distance_scaling);

				const d = Math.sqrt(dx * dx + dy * dy) * distance_scaling;

				const ux = dx / d;
				const uy = dy / d;

				// Force from a to b.
				const F_x = F * ux;
				const F_y = F * uy;

				// TODO: this could be reversed.

				p.f_x += F_x;
				p.f_y += F_y;
			}

			const a_x = p.f_x / p.m;
			const a_y = p.f_y / p.m;

			// Reset force (only need it temporarily)
			p.f_x = 0;
			p.f_y = 0;

			p.v_x += a_x * dt;
			p.v_y += a_y * dt;
		}

		// Apply velocity
		for (const p of particles) {
			p.x += p.v_x * dt;
			p.y += p.v_y * dt;
		}

		// Wrap the particles
		for (const p of particles) {
			p.x = wrap(p.x, -canvas.width, 2 * canvas.width);
			p.y = wrap(p.y, -canvas.height, 2 * canvas.height);
		}
	}


	////////////
	// RENDER //
	////////////

	{
		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (const particle of particles) {
			ctx.fillStyle = particle.color;
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
			ctx.fill();
		}
	}

});

animator.start();
