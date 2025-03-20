const express = require("express");
const db = require("../../db");
const auth = require("../../middleware/sequelize-authorization-middleware");
const router = express.Router({ mergeParams: true });
const createError = require("http-errors");

// scopes
// ------
router.all("*", (req, res, next) => {
	req.scope = [];
	return next();
});

// list messages
// -------------
router
	.route("/")
	.get(auth.can("NotificationMessage", "list"))
	.get((req, res, next) => {
		db.NotificationMessage.scope(req.scope)
			.findAndCountAll({
				where: {
					projectId: req.params.projectId,
				},
			})
			.then((result) => {
				req.results = result.rows;
				return next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// create message
	// --------------
	.post(auth.can("NotificationMessage", "create"))
	.post(auth.useReqUser)
	.post((req, res, next) => {
		// validations
		return next();
	})
	.post((req, res, next) => {
		const data = {
			...req.body,
			projectId: req.params.projectId,
		};
		db.NotificationMessage.authorizeData(data, "create", req.user)
			.create(data)
			.then((result) => {
				db.NotificationMessage.findByPk(result.id).then(
					(notificationMessage) => {
						req.results = notificationMessage;
						return next();
					},
				);
			})
			.catch(next);
	})
	.post(auth.useReqUser)
	.post((req, res, next) => {
		res.json(req.results);
	});

// with one message
// ----------------
router
	.route("/:messageId(\\d+)")
	.all((req, res, next) => {
		const messageId = Number.parseInt(req.params.messageId) || 1;
		db.NotificationMessage.scope(req.scope)
			.findOne({
				where: { id: messageId },
			})
			.then((found) => {
				if (!found) throw new Error("NotificationMessage not found");
				req.results = found;
				next();
			})
			.catch(next);
	})
	.all(auth.useReqUser)

	// view message
	// ------------
	.get(auth.can("NotificationMessage", "view"))
	.get((req, res, next) => {
		res.json(req.results);
	})

	// update message
	// --------------
	.put(auth.useReqUser)
	.put((req, res, next) => {
		const message = req.results;
		if (!message?.can?.("update"))
			return next(new Error("You cannot update this notificationMessage"));
		message
			.authorizeData(req.body, "update")
			.update(req.body)
			.then((result) => {
				req.results = result;
				return next();
			})
			.catch(next);
	})
	.put(auth.useReqUser)
	.put((req, res, next) => {
		res.json(req.results);
	})

	// delete message
	// --------------
	.delete((req, res, next) => {
		const message = req.results;
		if (!message?.can?.("delete"))
			return next(new Error("You cannot delete this notificationMessage"));
		req.results
			.destroy()
			.then(() => {
				res.json({ message: "deleted" });
			})
			.catch(next);
	});

module.exports = router;
