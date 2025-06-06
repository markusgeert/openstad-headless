const login = require("connect-ensure-login");
const oauth2orize = require("oauth2orize");
const passport = require("passport");
const URL = require("node:url").URL;
const db = require("../../db");
const config = require("../../config");
const memoryStorage = require("../../memoryStorage");
const utils = require("../../utils");
const validate = require("../../validate");

const prefillAllowedDomains = (allowedDomains) => {
	try {
		if (process.env.BASE_DOMAIN) {
			let baseDomain = process.env.BASE_DOMAIN;
			if (baseDomain.indexOf("http") !== 0) {
				baseDomain = `https://${baseDomain}`;
			}
			const baseUrl = new URL(baseDomain);
			allowedDomains.push(baseUrl.host);
		}

		if (process.env.APP_URL) {
			let appUrl = process.env.APP_URL;
			if (appUrl.indexOf("http") !== 0) {
				appUrl = `https://${appUrl}`;
			}
			const url = new URL(appUrl);
			allowedDomains.push(url.host);
		}

		if (process.env.CMS_URL) {
			const cmsUrl = new URL(process.env.CMS_URL);
			allowedDomains.push(cmsUrl.host);
		}

		if (process.env.API_URL) {
			const apiUrl = new URL(process.env.API_URL);
			allowedDomains.push(apiUrl.host);
		}

		if (process.env.ADMIN_URL) {
			let adminUrl = process.env.ADMIN_URL;
			if (adminUrl.indexOf("http") !== 0) {
				adminUrl = `https://${adminUrl}`;
			}
			const url = new URL(adminUrl);
			allowedDomains.push(url.host);
		}
	} catch (err) {
		console.error("Error processing allowed domains:", err);
		return [...new Set(allowedDomains)];
	}

	return [...new Set(allowedDomains)];
};

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Configured expiresIn
const expiresIn = { expires_in: config.token.expiresIn };

/**
 * Grant authorization codes
 *
 * The callback takes the `client` requesting authorization, the `redirectURI`
 * (which is used as a verifier in the subsequent exchange), the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a code,
 * which is bound to these values, and will be exchanged for an access token.
 */
server.grant(
	oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
		const code = utils.createToken({
			sub: user.id,
			exp: config.codeToken.expiresIn,
		});
		memoryStorage.authorizationCodes
			.save(code, client.id, redirectURI, user.id, client.scope)
			.then(() => done(null, code))
			.catch((err) => done(err));
	}),
);

/**
 * Grant implicit authorization.
 *
 * The callback takes the `client` requesting authorization, the authenticated
 * `user` granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application.  The application issues a token,
 * which is bound to these values.
 */
server.grant(
	oauth2orize.grant.token((client, user, ares, done) => {
		const token = utils.createToken({
			sub: user.id,
			exp: config.token.expiresIn,
		});
		const expiration = config.token.calculateExpirationDate();

		memoryStorage.accessTokens
			.save(token, expiration, user.id, client.id, client.scope)
			.then(() => done(null, token, expiresIn))
			.catch((err) => done(err));
	}),
);

/**
 * Exchange authorization codes for access tokens.
 *
 * The callback accepts the `client`, which is exchanging `code` and any
 * `redirectURI` from the authorization request for verification.  If these values
 * are validated, the application issues an access token on behalf of the user who
 * authorized the code.
 */
server.exchange(
	oauth2orize.exchange.code((client, code, redirectURI, done) => {
		memoryStorage.authorizationCodes
			.delete(code)
			.then((authCode) =>
				validate.authCode(code, authCode, client, redirectURI),
			)
			.then((authCode) => validate.generateTokens(authCode))
			.then((tokens) => {
				if (tokens.length === 1) {
					return done(null, tokens[0], null, expiresIn);
				}
				if (tokens.length === 2) {
					return done(null, tokens[0], tokens[1], expiresIn);
				}
				throw new Error("Error exchanging auth code for tokens");
			})
			.catch((err) => {
				console.log("Errrrrr", err);
				done(null, false);
			});
	}),
);

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(
	oauth2orize.exchange.password((client, username, password, scope, done) => {
		db.User.findOne({ where: { email: username } })
			.then((user) => validate.user(user, password))
			.then((user) =>
				validate.generateTokens({
					scope,
					userID: user.id,
					clientID: client.id,
				}),
			)
			.then((tokens) => {
				if (tokens === false) {
					return done(null, false);
				}
				if (tokens.length === 1) {
					return done(null, tokens[0], null, expiresIn);
				}
				if (tokens.length === 2) {
					return done(null, tokens[0], tokens[1], expiresIn);
				}
				throw new Error("Error exchanging password for tokens");
			})
			.catch(() => done(null, false));
	}),
);

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(
	oauth2orize.exchange.clientCredentials((client, scope, done) => {
		const token = utils.createToken({
			sub: client.id,
			exp: config.token.expiresIn,
		});
		const expiration = config.token.calculateExpirationDate();
		// Pass in a null for user id since there is no user when using this grant type

		memoryStorage.accessTokens
			.save(token, expiration, null, client.id, scope)
			.then(() => done(null, token, null, expiresIn))
			.catch((err) => done(err));
	}),
);

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(
	oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
		memoryStorage.refreshTokens
			.find(refreshToken)
			.then((foundRefreshToken) =>
				validate.refreshToken(foundRefreshToken, refreshToken, client),
			)
			.then((foundRefreshToken) => validate.generateToken(foundRefreshToken))
			.then((token) => done(null, token, null, expiresIn))
			.catch(() => done(null, false));
	}),
);

/*
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
exports.authorization = [
	login.ensureLoggedIn(),
	server.authorization((clientId, redirectURI, scope, done) => {
		db.Client.findOne({ where: { clientId: clientId } })
			.then((client) => {
				if (client) {
					client.scope = scope;
				}

				/**
				 * Check if redirectURI same host as registered
				 */
				const allowedDomains = prefillAllowedDomains(
					client.allowedDomains ? client.allowedDomains : [],
				);
				const redirectUrlHost = new URL(redirectURI).host;

				//console.log('===> allowedDomains', allowedDomains, redirectUrlHost);

				// throw error if allowedDomains is empty or the redirectURI's host is not present in the allowed domains
				if (allowedDomains && allowedDomains.indexOf(redirectUrlHost) !== -1) {
					console.log("===> redirectURI allowedDomains", redirectURI);
					return done(null, client, redirectURI);
				}
				console.log(
					"===> Redirect host doesn't match the client host",
					allowedDomains,
					redirectUrlHost,
				);
				throw new Error("Redirect host doesn't match the client host");
			})
			.catch((err) => done(err));
	}),
	(req, res, next) => {
		// Render the decision dialog if the client isn't a trusted client
		// TODO:  Make a mechanism so that if this isn't a trusted client, the user can record that
		// they have consented but also make a mechanism so that if the user revokes access to any of
		// the clients then they will have to re-consent.
		db.Client.findOne({ where: { clientId: req.query.client_id } })
			.then((client) => {
				if (client != null) {
					//  && client.trustedClient && client.trustedClient === true) {
					// This is how we short call the decision like the dialog below does
					server.decision({ loadTransaction: false }, (serverReq, callback) => {
						callback(null, { allow: true });
					})(req, res, next);
				} else {
					res.render("dialog", {
						transactionID: req.oauth2.transactionID,
						user: req.user,
						client: req.oauth2.client,
					});
				}
			})
			.catch((error) => {
				console.log("error", error);

				res.render("dialog", {
					transactionID: req.oauth2.transactionID,
					user: req.user,
					client: req.oauth2.client,
				});
			});
	},
];

/**
 * User decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
exports.decision = [login.ensureLoggedIn(), server.decision()];

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
	passport.authenticate(["basic", "oauth2-client-password"], {
		session: false,
	}),
	server.token(),
	server.errorHandler(),
];

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
	db.Client.findOne({ where: { id } })
		.then((client) => done(null, client))
		.catch((err) => done(err));
});
