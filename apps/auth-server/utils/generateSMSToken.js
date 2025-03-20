module.exports = () => {
	let text = "";
	const chars = "12346798abcdefghijkmnopqrstuvwxyz";
	const even = false;

	for (let i = 0; i < 5; i++) {
		text += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return text;
};
