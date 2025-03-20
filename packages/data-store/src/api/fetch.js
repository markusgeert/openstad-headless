export default async function doFetch(url = "", options = {}) {
	let json;

	if (!options.suspense) {
		options.headers = options.headers || {};
		options.headers["Content-Type"] =
			options.headers["Content-Type"] || "application/json";

		if (this.currentUserJWT) {
			options.headers.Authorization = `Bearer ${this.currentUserJWT}`;
		}

		let response;
		response = await fetch(this.apiUrl + url, options);

		if (!response.ok) {
			const body = await response.json();
			const error = new Error(
				body.error || body.message || response.statusText,
			);
			const event = new window.CustomEvent("osc-error", { detail: error });
			document.dispatchEvent(event);
			throw error;
		}

		json = await response.json();
		return json || {};
	}

	return undefined;
}
