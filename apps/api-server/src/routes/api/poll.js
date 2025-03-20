const createError = require("http-errors");
const db = require("../../db");
const auth = require("../../middleware/sequelize-authorization-middleware");
const pagination = require("../../middleware/pagination");
const searchInResults = require("../../middleware/search-in-results");

const express = require("express");
const router = express.Router({ mergeParams: true });

router

	// scopes
	.all("*", (req, res, next) => {
		req.scope = ["defaultScope", "includeResource"];
		req.scope.push({ method: ["forProjectId", req.params.projectId] });

		if (req.query.includeVoteCount) {
			// votes are counted in model.voteCount
			req.scope.push({ method: ["includeVotes", "poll", req.user.id] });
		}

		if (req.query.includeUserVote) {
			req.scope.push({ method: ["includeUserVote", "poll", req.user.id] });
		}

		if (req.query.includeVotes) {
			req.scope.push({ method: ["includeVotes", "poll", req.user.id] });
		}

		return next();
	});

router
	.route("/")

	// list polls
	// --------------
	.get(auth.can("Poll", "list"))
	.get(pagination.init)
	.get((req, res, next) => {
		const resourceId = Number.parseInt(req.params.resourceId) || 0;
		const where = {};
		if (resourceId) {
			where.resourceId = resourceId;
		}

		return db.Poll.scope(...req.scope)
			.findAndCountAll({
				where,
				offset: req.dbQuery.offset,
				limit: req.dbQuery.limit,
			})
			.then((result) => {
				result.rows.forEach((poll) => {
					if (req.query.includeVoteCount)
						poll.countVotes(!req.query.includeVotes);
				});
				req.results = result.rows;
				req.results = result.rows;
				req.dbQuery.count = result.count;
				return next();
			})
			.catch(next);
	})
	.get(auth.useReqUser)
	.get(searchInResults({ searchfields: ["question", "choices"] }))
	.get(pagination.paginateResults)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// create poll
	// ---------------
	.post(auth.can("Poll", "create"))
	.post((req, res, next) => {
		// find resource
		const resourceId = Number.parseInt(req.params.resourceId) || 0;
		if (!resourceId) return next(createError(404, "Resource not found"));
		db.Resource.findByPk(resourceId).then((resource) => {
			if (!resource || resource.projectId !== req.params.projectId)
				return next(createError(400, "Resource not found"));
			req.resource = resource;
			return next();
		});
	})
	.post(auth.useReqUser)
	.post((req, res, next) => {
		// validations
		if (
			!req.project.config.polls ||
			req.project.config.polls.canAddPolls !== true
		)
			return next(createError(400, "Poll toevoegen is niet toegestaan"));
		if (!req.resource.auth.canAddPoll(req.user, req.resource))
			return next(createError(400, "Poll toevoegen is niet toegestaan 2"));
		next();
	})
	.post((req, res, next) => {
		const data = {
			...req.body,
			resourceId: req.resource.id,
			userId: req.user.id,
			status: "OPEN",
		};

		db.Poll.authorizeData(data, "create", req.user)
			.create(data)
			.then((result) => {
				db.Poll.scope("defaultScope", "includeResource", {
					method: ["includeUserVote", "poll", req.user.id],
				})
					.findByPk(result.id)
					.then((poll) => {
						poll.auth.user = req.user;
						res.json(poll);
					});
			})
			.catch(next);
	});

// one poll
// --------
router
	.route("/:pollId(\\d+)")
	.all((req, res, next) => {
		const pollId = Number.parseInt(req.params.pollId) || 1;
		const scope = req.scope;
		if (req.method === "PUT") scope.push("includeVotes");
		db.Poll.scope(scope)
			.findOne({
				where: { id: pollId, resourceId: req.params.resourceId },
			})
			.then((found) => {
				if (!found) throw new Error("Poll not found");
				if (req.query.includeVoteCount)
					found.countVotes(!req.query.includeVotes);

				req.results = found;
				next();
			})
			.catch((err) => {
				console.log("err", err);
				next(err);
			});
	})
	.all(auth.useReqUser)

	// view poll
	// -------------
	.get(auth.can("Poll", "view"))
	.get((req, res, next) => {
		res.json(req.results);
	})

	// update poll
	// ---------------
	.put(auth.useReqUser)
	.put((req, res, next) => {
		const poll = req.results;
		if (!poll?.can?.("update"))
			return next(new Error("You cannot update this poll"));
		poll
			.authorizeData(req.body, "update")
			.update(req.body)
			.then((result) => {
				res.json(result);
			})
			.catch(next);
	})

	// delete poll
	// ---------------
	.delete((req, res, next) => {
		const poll = req.results;
		if (!poll?.can?.("delete"))
			return next(new Error("You cannot delete this poll"));
		req.results
			.destroy()
			.then(() => {
				res.json({ poll: "deleted" });
			})
			.catch(next);
	});

// vote for poll
// -----------------
router
	.route("/:pollId(\\d+)/vote")

	.all((req, res, next) => {
		const pollId = Number.parseInt(req.params.pollId) || 1;
		db.Poll.scope(...req.scope)
			.findOne({
				where: { id: pollId, resourceId: req.params.resourceId },
			})
			.then((found) => {
				if (!found) throw new Error("Poll not found");
				req.results = found;
				next();
			})
			.catch((err) => {
				console.log("err", err);
				next(err);
			});
	})
	.all(auth.useReqUser)

	.post((req, res, next) => {
		const poll = req.results;
		if (!poll?.can?.("vote"))
			return next(new Error("You cannot vote for this poll"));

		let pollVote;
		db.PollVote.scope("defaultScope", "includePoll")
			.findOne({
				where: { pollId: poll.id, userId: req.user.id },
			})
			.then((found) => {
				pollVote = found;

				const data = {
					choice: req.body.choice,
				};

				if (pollVote) {
					pollVote.auth.user = req.user;
					pollVote
						.authorizeData(data, "update")
						.update(data)
						.then((result) => {
							req.pollVoteId = pollVote.id;
							return next();
						});
				} else {
					data.pollId = poll.id;
					data.userId = req.user.id;
					data.ip = req.ip;
					db.PollVote.authorizeData(data, "create", req.user)
						.create(data)
						.then((result) => {
							req.pollVoteId = result.id;
							return next();
						});
				}
			})
			.catch((err) => {
				console.log("err", err);
				next(err);
			});
	})
	.post((req, res, next) => {
		db.PollVote.scope("defaultScope")
			.findByPk(req.pollVoteId)
			.then((poll) => {
				poll.auth.user = req.user;
				res.json(poll);
			});
	});

// output
// ------
// TODO: nu als voorbeeld, alleen gebruikt door post vote, maar kan voor alle routes
// de vraag is: wil ik dat
router.all("*", (req, res, next) => {
	res.json(req.results);
});

module.exports = router;
