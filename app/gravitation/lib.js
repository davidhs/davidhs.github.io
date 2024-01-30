export function assert(condition, message) {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
}

/**
 * Wraps `value` between `from` (inclusive) and `to` (exclusive).
 */
export function wrap(value, from, to) {
	assert(from <= to, `Expected (from = ${from}) <= (to = ${to}])`);

	const span = to - from;

	value -= from;
	value = ((value % span) + span) % span;
	value += from;

	return value;
}