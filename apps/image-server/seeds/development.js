const fs = require("node:fs").promises;

module.exports = async function seed(db) {
	// copy example images - TODO: s3
	const imageDir = "./images";
	const files = await fs.readdir("./seeds/lorem-images");
	console.log("  copy seed images to", imageDir);
	for (const file of files) {
		try {
			await fs.copyFile(`./seeds/lorem-images/${file}`, `${imageDir}/${file}`);
			console.log(`    ${file}`);
		} catch (err) {
			console.log(err);
		}
	}
};
