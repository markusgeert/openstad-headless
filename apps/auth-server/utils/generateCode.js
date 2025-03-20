module.exports = () => {
	let text = "";
	const numbers = "234678";
	const letters = "ABCDEFHJKLMNPQRTUVWXYZabcdefhijkmnpqrtuvwxyz";
	let even = false;

	for (let i = 0; i < 12; i++) {
		const charsToChose = even ? numbers : letters;
		text += charsToChose.charAt(
			Math.floor(Math.random() * charsToChose.length),
		);
		even = !even;
	}

	return text;
};
