const flattenObject = (obj: any, parent = "", res: any = {}) => {
	for (const key in obj) {
		const propName = parent ? `${parent}.${key}` : key;
		if (typeof obj[key] === "object" && obj[key] !== null) {
			if (Array.isArray(obj[key])) {
				res[propName] = obj[key]
					.map((item: any) => JSON.stringify(item))
					.join(",");
			} else {
				flattenObject(obj[key], propName, res);
			}
		} else {
			res[propName] = obj[key];
		}
	}
	return res;
};

export default flattenObject;
