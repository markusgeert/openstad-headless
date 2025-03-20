const db = require("../../db");
const auth = require("../../middleware/sequelize-authorization-middleware");
const pagination = require("../../middleware/pagination");
const searchInResults = require("../../middleware/search-in-results");
const convertDbPolygonToLatLng = require("../../util/convert-db-polygon-to-lat-lng");
const { formatGeoJsonToPolygon } = require("../../util/geo-json-formatter");

const express = require("express");
const router = express.Router({ mergeParams: true });
const createError = require("http-errors");

// scopes: for all get requests
router.all("*", (req, res, next) => {
	req.scope = ["api"];
	req.scope.push("includeProject");
	return next();
});

router
	.route("/")
	.get(auth.can("Area", "list"))
	.get(pagination.init)
	.get((req, res, next) => {
		const { dbQuery } = req;

		return db.Area.findAndCountAll(dbQuery)
			.then((result) => {
				req.results = result.rows || [];
				req.dbQuery.count = result.count;
				return next();
			})
			.catch(next);
	})
	.get(searchInResults({}))
	.get(pagination.paginateResults)
	.get((req, res, next) => {
		res.json(req.results);
	})

	// Persist an area
	.post(auth.can("Area", "create"))
	.post((req, res, next) => {
		// if geodata is set transform to polygon format this api expects
		if (req.body.geoJSON) {
			req.body.polygon = formatGeoJsonToPolygon(req.body.geoJSON);
		}
		next();
	})
	.post((req, res, next) => {
		if (!req.body.name) return next(createError(401, "Geen naam opgegeven"));
		if (!req.body.polygon)
			return next(createError(401, "Geen polygoon opgegeven"));
		return next();
	})
	.post((req, res, next) => {
		db.Area.create(req.body)
			.catch((err) => {
				console.log("errr", err);
				next(err);
			})
			.then((result) => {
				res.json({ success: true, id: result.id });
			});
	});

router
	.route("/:areaId(\\d+)")
	.all((req, res, next) => {
		const areaId = Number.parseInt(req.params.areaId) || 1;

		db.Area.findOne({
			// where: { id: areaId, projectId: req.params.projectId }
			where: { id: areaId },
		})
			.then((found) => {
				if (!found) throw new Error("area not found");

				req.area = found;
				req.results = req.area;
				next();
			})
			.catch((err) => {
				console.log("errr", err);
				next(err);
			});
	})

	// view area
	// ---------
	// .get(auth.can('area', 'view'))
	.get(auth.useReqUser)
	.get((req, res, next) => {
		res.json(req.results);
	})
	.put((req, res, next) => {
		if (req.body.geoJSON) {
			req.body.polygon = formatGeoJsonToPolygon(req.body.geoJSON);
		}

		next();
	})
	.put(auth.useReqUser)
	.put((req, res, next) => {
		const area = req.results;

		if (!area?.can?.("update"))
			return next(new Error("You cannot update this area"));

		area
			.authorizeData(area, "update")
			.update({
				...req.body,
			})
			.then((result) => {
				req.results = result;
				next();
			})
			.catch(next);
	})
	.put((req, res, next) => {
		const areaInstance = req.results;

		return db.Area.findOne({
			where: { id: areaInstance.id },
			// where: { id: areaInstance.id, projectId: req.params.projectId },
		})
			.then((found) => {
				if (!found) throw new Error("area not found");
				req.results = found;
				next();
			})
			.catch(next);
	})
	.put((req, res, next) => {
		res.json(req.results);
	})

	// delete area
	// ---------
	// .delete(auth.can('area', 'delete'))
	.delete(auth.useReqUser)
	.delete((req, res, next) => {
		const result = req.results;

		if (!result?.can?.("delete"))
			return next(new Error("You cannot delete this area"));

		req.results
			.destroy()
			.then(() => {
				res.json({ area: "deleted" });
			})
			.catch(next);
	});

module.exports = router;
