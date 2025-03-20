const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/sequelize-authorization-middleware");
const pagination = require("../../middleware/pagination");

const router = express.Router({ mergeParams: true });

router.all("*", (req, res, next) => {
	req.scope = [];
	req.scope.push("defaultScope");
	req.scope.push({ method: ["forProjectId", req.project.id] });

	if (req.query.includeProject) {
		req.scope.push("includeProject");
	}

	if (req.query.type) {
		const type = req.query.type;
		req.scope.push({ method: ["selectType", type] });
	}

	if (req.query.tags) {
		const tags = req.query.tags;
		req.scope.push({ method: ["onlyWithIds", tags] });
	}

	next();
});

router
	.route("/")

	// list tags
	// --------------
	.get(auth.can("Tag", "list"))
	.get(auth.useReqUser)
	.get(pagination.init)
	.get((req, res, next) => {
		const { dbQuery } = req;

		req.scope.push({ method: ["forProjectId", req.params.projectId] });

		db.Tag.scope(...req.scope)
			.findAndCountAll(dbQuery)
			.then((result) => {
				req.results = result.rows;
				req.dbQuery.count = result.count;
				next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
	.get(pagination.paginateResults)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// create tag
	// ---------------
	.post(auth.can("Tag", "create"))
	.post((req, res, next) => {
		const data = {
			name: req.body.name,
			type: req.body.type,
			seqnr: req.body.seqnr,
			addToNewResources: req.body.addToNewResources,
			projectId: req.params.projectId,
			useDifferentSubmitAddress: req.params.useDifferentSubmitAddress,
			newSubmitAddress: req.params.newSubmitAddress,
			defaultResourceImage: req.params.defaultResourceImage,
			documentMapIconColor: req.params.documentMapIconColor || "#000000",
		};

		db.Tag.authorizeData(data, "create", req.user)
			.create(data)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
	});

// with one existing tag
// --------------------------
router
	.route("/:tagId(\\d+)")
	.all(auth.useReqUser)
	.all((req, res, next) => {
		const tagId = Number.parseInt(req.params.tagId);
		if (!tagId) next("No tag id found");

		req.scope = ["defaultScope"];
		req.scope.push({ method: ["forProjectId", req.params.projectId] });

		db.Tag.scope(...req.scope)
			.findOne({ where: { id: tagId } })
			.then((found) => {
				if (!found) throw new Error("Tag not found");
				req.results = found;
				next();
			})
			.catch(next);
	})

	// view tag
	// -------------
	.get(auth.can("Tag", "view"))
	.get(auth.useReqUser)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// update tag
	// ---------------
	.put(auth.useReqUser)
	.put((req, res, next) => {
		const tag = req.results;
		if (!tag?.can?.("update"))
			return next(new Error("You cannot update this tag"));
		tag
			.authorizeData(req.body, "update")
			.update(req.body)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
	})

	// delete tag
	// ---------------
	.delete(auth.can("Tag", "delete"))
	.delete((req, res, next) => {
		req.results
			.destroy()
			.then(() => {
				res.json({ tag: "deleted" });
			})
			.catch(next);
	});

module.exports = router;
