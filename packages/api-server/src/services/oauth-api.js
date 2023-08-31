const config = require('config');
const fetch = require('node-fetch');
const merge = require('merge');
const httpBuildQuery = require('../util/httpBuildQuery');

const formatOAuthApiUrl = (path, projectConfig, which = 'default') => {
  let projectOauthConfig = (projectConfig && projectConfig.oauth && projectConfig.oauth[which]) || {};
  let url = projectOauthConfig['auth-server-url'] || config.authorization['auth-server-url'];
  url += path;
  let authClientId = projectOauthConfig['auth-client-id'] || config.authorization['auth-client-id'];
  url = url.replace(/\{\{clientId\}\}/, authClientId);
  url += url.match(/\?/) ? '&' : '?';
  url += `client_id=${authClientId}`;
  return url;
}

const formatOAuthApiCredentials = (projectConfig, which = 'default', token) => {

  // use token
  if (token) return `Bearer ${token}`;

  // use basic auth with clientId/clientSecret
  let projectOauthConfig = (projectConfig && projectConfig.oauth && projectConfig.oauth[which]) || {};
  let authClientId = projectOauthConfig['auth-client-id'] || config.authorization['auth-client-id'];
  let authClientSecret = projectOauthConfig['auth-client-secret'] || config.authorization['auth-client-secret'];
  return 'Basic ' + new Buffer(`${authClientId}:${authClientSecret}`).toString('base64');

}

let OAuthAPI ={};

OAuthAPI.fetchClient = async function({ projectConfig, which = 'default' }) {

  const oauthServerUrl = formatOAuthApiUrl('/api/admin/client/{{clientId}}', projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

OAuthAPI.updateClient = async function({ projectConfig, which = 'default', clientData = {} }) {

  
  let orgClientData = await OAuthAPI.fetchClient({ projectConfig, which });
  let mergedClientData = merge.recursive(true, orgClientData, clientData);

  // for now only the config is updateable from here
  mergedClientData = { config: mergedClientData.config };

  const oauthServerUrl = formatOAuthApiUrl(`/api/admin/client/${orgClientData.id}`, projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
    method: 'POST', // TODO: dit is hoe de oauth server nu werkt; dat zou natuurlijk een put of patch moeten worden.
    body: JSON.stringify(mergedClientData),
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .then((json) => {
	    return json;
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

OAuthAPI.fetchUser = async function({ projectConfig, which = 'default', email, userId, token, raw = false }) {

  let path = '';
  if ( userId ) path = `/api/admin/user/${userId}`;
  if ( email  ) path = `/api/admin/users?email=${encodeURIComponent(email)}`;
  if ( token ) path = `/api/userinfo`;

  if (!path) throw new Error('no Find By arguments found')

  const oauthServerUrl = formatOAuthApiUrl(path, projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which, token);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .then((json) => {
      let user;
      if (json && json.data && json.data.length > 0) {
        user = json.data[0];
      } else if (json.id) {
        user = json;
      } else if (json.user_id) {
        user = json;
      }
	    return user;
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

OAuthAPI.createUser = async function({ projectConfig, which = 'default', userData = {} }) {

  const oauthServerUrl = formatOAuthApiUrl('/api/admin/user', projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
    method: 'POST',
    body: JSON.stringify(userData),
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

OAuthAPI.updateUser = async function({ projectConfig, which = 'default', userData = {} }) {

  // todo: null zou iets moeten leeggooien

  if (!(userData && userData.id)) throw new Error('No user id found')

  let orgUserData = await OAuthAPI.fetchUser({ raw: true, projectConfig, which, userId: userData.id });
  let mergedUserData = merge.recursive(orgUserData, userData);

  const oauthServerUrl = formatOAuthApiUrl(`/api/admin/user/${userData.id}`, projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
    method: 'POST', // TODO: dit is hoe de oauth server nu werkt; dat zou natuurlijk een put of patch moeten worden.
    body: JSON.stringify(mergedUserData),
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .then((json) => {
      // todo: extraData komt terug als string; los dat op aan de oauth kant
      try {
        json.extraData = JSON.parse(json.extraData);
      } catch (err) {}

      let user;
      if (json.id) {
        user = json;
      }
	    return user;
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

OAuthAPI.deleteUser = async function({ projectConfig, which = 'default', userData = {} }) {

  if (!(userData && userData.id)) throw new Error('No user id found')

  const oauthServerUrl = formatOAuthApiUrl(`/api/admin/user/${userData.id}/delete`, projectConfig, which);
  const oauthServerCredentials = formatOAuthApiCredentials(projectConfig, which);

  return fetch(oauthServerUrl, {
	  headers: { "Authorization": oauthServerCredentials, "Content-type": "application/json" },
    method: 'POST', // TODO: dit is hoe de oauth server nu werkt; dat zou natuurlijk een put of patch moeten worden.
    body: JSON.stringify({}),
  })
	  .then((response) => {
		  if (!response.ok) throw Error(response)
		  return response.json();
	  })
	  .catch((err) => {
		  console.log('Niet goed');
		  console.log(err);
	  });

}

module.exports = exports = OAuthAPI;
