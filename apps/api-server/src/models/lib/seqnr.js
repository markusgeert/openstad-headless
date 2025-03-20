const renumber = async ({ model, where = {}, seqnrFieldName = "seqnr" }) => {
	const instances = await model.findAll({ where, order: [seqnrFieldName] });

	let nr = 10;
	for (const instance of instances) {
		await instance.update({ [seqnrFieldName]: nr }, { hooks: false });
		nr += 10;
	}
};

module.exports = {
	renumber,
};
