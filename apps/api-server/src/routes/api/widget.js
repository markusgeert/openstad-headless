const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../../middleware/sequelize-authorization-middleware");
const db = require("../../db");
const sanitize = require("../../util/sanitize");

router.all("*", (req, res, next) => {
	req.scope = [];
	return next();
});

// list widgets
// --------------
router
	.route("/")
	.all((req, res, next) => {
		const { dbQuery } = req;
		dbQuery.where = {
			projectId: req.params.projectId,
			...req.queryConditions,
		};
		db.Widget.scope(...req.scope)
			.findAndCountAll(dbQuery)
			.then((result) => {
				const { rows } = result;
				req.results = rows;
				return next();
			})
			.catch(next);
	})

	// list
	.get(auth.useReqUser)
	.get((req, res, next) => res.json(req.results))

	// Create widget
	.post(auth.useReqUser)
	.post(async (req, res, next) => {
		const widget = req.body;
		const projectId = req.params.projectId;

		const createdWidget = await db.Widget.create({
			projectId,
			description: widget.description,
			type: widget.type,
			config: {},
		});

		return res.json(createdWidget);
	});

// one widget routes: get widget
// -------------------------
router
	.route("/:id") //(\\d+)
	.all((req, res, next) => {
		const id = req.params.id;
		const query = { where: { id } };

		db.Widget.scope(...req.scope)
			.findOne(query)
			.then((found) => {
				if (!found) throw new Error("Widget not found");
				req.results = found;
				req.widget = req.results; // middleware expects this to exist
				next();
			})
			.catch(next);
	})

	.get(auth.useReqUser)
	.get((req, res, next) => {
		const widget = req.widget;
		res.json(widget);
	})

	// Update widget
	.put(auth.useReqUser)
	.put(async (req, res, next) => {
		const widget = req.widget;
		const config = { ...widget.config, ...(req.body?.config || {}) };
		const description = req.body?.description ?? widget.description;
		const typesToSanitize = ["rawresource", "resourceoverview"];

		if (config) {
			// sanitize rawInput by user

			if (typesToSanitize.includes(widget.dataValues.type)) {
				widget.dataValues.config.rawInput = sanitize.content(
					widget.dataValues.config.rawInput,
				);
			}
			widget.update({ config, description }).then((result) => res.json(result));
		}
	})

	// delete widget
	// ---------
	.delete(auth.useReqUser)
	.delete((req, res, next) => {
		const widget = req.results;
		if (!widget?.can?.("delete"))
			return next(new Error("You cannot delete this widget"));

		widget
			.destroy()
			.then(() => {
				res.json({ widget: "deleted" });
			})
			.catch(next);
	});

module.exports = router;
