const moment = require("moment-timezone");
const nlib = require("nunjucks/src/lib");
const slice = Array.prototype.slice;

// Is set via `setDefaultFormat`.
let defaultFormat = "Do MMMM, YYYY";

moment.locale("nl");

// Examples:
// {{ var | date }}
// {{ var | date('YYYY-MM-DD') }}
function dateFilter(date, format) {
	try {
		if (!date) {
			throw Error("Onbekende datum");
		}
		// Timezone is set in `config/moment.js`.
		const mom = moment(date);
		return nlib.isFunction(mom[format])
			? mom[format].apply(mom, slice.call(arguments, 2))
			: mom.format(format || defaultFormat);
	} catch (error) {
		return (error.message || "dateFilter error").toString();
	}
}

// Set default format for date.
dateFilter.setDefaultFormat = (format) => {
	defaultFormat = format;
};

module.exports = dateFilter;
