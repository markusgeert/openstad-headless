require("dotenv").config();
const fs = require("node:fs").promises;

(async () => {
	try {
		console.log("Init default images...");

		try {
			const files = await fs.readdir("seeds/lorem-images");
			const targetDir = `${process.env.PWD}${process.env.IMAGES_DIR || "/images"}`;
			for (const file of files) {
				console.log(`  ${file}`);
				await fs.copyFile(`seeds/lorem-images/${file}`, `${targetDir}/${file}`);
			}
		} catch (err) {
			console.log(err);
		}
	} catch (err) {
		console.log(err);
	} finally {
		process.exit();
	}
})();
