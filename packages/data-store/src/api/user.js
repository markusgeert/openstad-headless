import fetch from "./fetch";

export default {
	fetch: async function ({ projectId, userId }) {
		const url = `/api/project/${projectId}/user/${userId}`;
		const headers = {
			"Content-Type": "application/json",
		};

		return this.fetch(url, { headers });
	},

	fetchMe: async function ({ projectId }) {
		// console.log('FETCH ME');

		const url = `/auth/project/${projectId}/me`;
		const headers = {
			"Content-Type": "application/json",
		};

		const json = await this.fetch(url, { headers });

		let openStadUser = json;
		if (openStadUser?.id)
			openStadUser = { ...openStadUser, jwt: self.currentUserJWT };

		return openStadUser;
	},

	connectUser: async function ({ projectId, cmsUser }) {
		// console.log('CONNECT-USER');

		const url = `/auth/project/${projectId}/connect-user?useAuth=oidc`;
		const headers = {
			"Content-Type": "application/json",
		};

		const data = {
			access_token: cmsUser.access_token,
			iss: `${cmsUser.iss}`,
		};

		const json = await this.fetch(url, {
			headers,
			method: "POST",
			body: JSON.stringify(data),
		});

		return json.jwt;
	},

	update: async function ({ projectId, user }) {
		const url = `/api/project/${projectId}/user/${user.id}`;
		const headers = {
			"Content-Type": "application/json",
		};

		const data = {
			postcode: user.postalCode,
			name: user.name,
			fullName: user.name,
			nickName: user.nickName,
			address: user.address,
			city: user.city,
		};

		const json = await this.fetch(url, {
			headers,
			method: "PUT",
			body: JSON.stringify(data),
		});

		return json;
	},

	logout: function ({ url }) {
		url =
			url ||
			`${this.apiUrl}/auth/project/${this.projectId}/logout?useAuth=oidc`;
		document.location.href = url;
	},
};
