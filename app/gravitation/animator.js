import { assert } from "./lib.js";


export class Animator {
	#running;
	#ready;
	#cb;
	#previous_time;
	#request_id;

	/**
	 * 
	 * @param {null | (dt: number) => void} cb 
	 */
	constructor(cb = null) {
		this.#running = false;
		this.#ready = false;
		this.#cb = null;
		this.#previous_time = 0;
		this.#request_id = null;

		if (cb !== null) this.setStep(cb);
	}

	setStep(cb) {
		assert(typeof cb === "function");
		this.#cb = cb;
		this.#ready = true;
	}

	isRunning() {
		return this.#running;
	}

	start() {
		// TODO: should we crash?
		if (this.#running) throw new Error("Animator is already running.");
		if (!this.#ready) return;
		this.#running = true;

		const iter = (t) => {
			const dt = t - this.#previous_time;
			this.#previous_time = t;

			this.#cb(dt);

			this.#request_id = requestAnimationFrame(iter);
		};

		this.#request_id = requestAnimationFrame((t) => {
			this.#previous_time = t;

			this.#request_id = requestAnimationFrame(iter);
		});
	}

	stop() {
		// TODO: should we crash?
		if (!this.#running) throw new Error("Animator is already stopped.");
		this.#running = true;
		
		cancelAnimationFrame(this.#request_id);
		this.#request_id = null;

		this.#previous_time = 0;
	}
}