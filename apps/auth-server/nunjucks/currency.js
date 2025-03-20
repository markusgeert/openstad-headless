/**
 * Converts the input to a currency string.
 *
 * @example
 * // foo = 102432.56
 * {{ foo | currency('$') }}
 * // => $102,432.56
 *
 * @param  {Number} input The input to convert.
 * @param  {String} sign  The currency string, defaults to '$'
 * @return {String}
 */
module.exports = (input, sign) => {
	const digitsRegex = /(\d{3})(?=\d)/g;

	if (input == null || !Number.isFinite(input)) {
		//throw new Error('input needs to be a number');
		return 0;
	}

	sign = sign || "€";
	input = Number.parseFloat(input);

	const strVal = Math.floor(Math.abs(input)).toString();
	const mod = strVal.length % 3;
	const h =
		mod > 0 ? strVal.slice(0, mod) + (strVal.length > 3 ? "." : "") : "";
	const v = Math.abs(Number.parseInt((input * 100) % 100, 10));
	const float = `,${v < 10 ? `0${v}` : v}`;

	return (
		(input < 0 ? "-" : "") +
		sign +
		h +
		strVal.slice(mod).replace(digitsRegex, "$1,") +
		float
	);
};
