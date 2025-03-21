const config = require("config");
const log = require("debug")("app:user");
const pick = require("lodash/pick");

const merge = require("merge");

const Password = require("../lib/password");
const sanitize = require("../util/sanitize");
const userHasRole = require("../lib/sequelize-authorization/lib/hasRole");
const defaultCan = require("../lib/sequelize-authorization/mixins/can");
const getExtraDataConfig = require("../lib/sequelize-authorization/lib/getExtraDataConfig");
const roles = require("../lib/sequelize-authorization/lib/roles");

// For detecting throwaway accounts in the email address validation.
const emailBlackList = require("../../config/mail_blacklist");

module.exports = (db, sequelize, DataTypes) => {
	const User = sequelize.define(
		"user",
		{
			projectId: {
				type: DataTypes.INTEGER,
				defaultValue:
					config.projectId && typeof config.projectId === "number"
						? config.projectId
						: null,
			},

			idpUser: {
				type: DataTypes.JSON,
				auth: {
					listableBy: "admin",
					viewableBy: ["admin", "owner"],
					createableBy: "moderator",
					updateableBy: "admin",
				},
				allowNull: false,
				defaultValue: {},
			},

			role: {
				type: DataTypes.STRING(32),
				allowNull: false,
				defaultValue: "anonymous",
				validate: {
					isIn: {
						args: [
							[
								"unknown",
								"anonymous",
								"member",
								"admin",
								"su",
								"editor",
								"moderator",
								"superAdmin",
							],
						],
						msg: "Unknown user role",
					},
				},
				auth: {
					viewableBy: ["moderator", "owner"],
					/**
					 * In case of setting the role
					 * Admin are allowed to set all roles, but moderators only are allowed
					 * to set members.
					 *
					 * @param actionUserRole
					 * @param action (c)
					 * @param user ()
					 * @param self (user model)
					 * @param project (project on which model is queried)
					 */
					authorizeData: (actionUserRole, action, user, self, project) => {
						if (!self) return;
						const updateAllRoles = ["admin"];
						const updateMemberRoles = ["moderator"];
						const fallBackRole = "anonymous";
						const memberRole = "member";
						// this is the role for User on which action is performed, not of the user doing the update
						actionUserRole = actionUserRole || self.role;
						// by default return anonymous role if none of the conditions are met
						let roleToReturn;
						// only for create and update check if allowed, the other option, view and list
						// for now its ok if a the public sees the role
						// for fields no DELETE action exists
						if (action === "create" || action === "update") {
							// if user is allowed to update all status
							if (userHasRole(user, updateAllRoles)) {
								roleToReturn = actionUserRole;
								// check if active user is allowed to set user's role to member
							} else if (
								userHasRole(user, updateMemberRoles) &&
								actionUserRole === memberRole
							) {
								roleToReturn = actionUserRole;
							} else {
								roleToReturn = fallBackRole;
							}
						} else {
							roleToReturn = actionUserRole;
						}
						return roleToReturn;
					},
					updateableBy: ["admin"],
				},
			},

			extraData: getExtraDataConfig(DataTypes.JSON, "users"),

			email: {
				type: DataTypes.STRING(255),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["editor"],
				},
				allowNull: true,
				defaultValue: null,
				validate: {
					isEmail: {
						msg: "Geen geldig emailadres",
					},
					notBlackListed: (email) => {
						const match = email?.match(/^.+@(.+)$/);
						if (match) {
							const domainName = match[1];
							if (domainName in emailBlackList) {
								throw Error(
									"Graag je eigen emailadres gebruiken; geen tijdelijk account",
								);
							}
						}
					},
				},
			},

			nickName: {
				type: DataTypes.STRING(64),
				allowNull: true,
				defaultValue: null,
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				set: function (value) {
					this.setDataValue("nickName", sanitize.noTags(value));
				},
			},

			name: {
				type: DataTypes.STRING(64),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("name", sanitize.noTags(value));
				},
			},

			firstname: {
				type: DataTypes.STRING(64),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("firstname", sanitize.noTags(value));
				},
			},

			lastname: {
				type: DataTypes.STRING(64),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("lastname", sanitize.noTags(value));
				},
			},

			listableByRole: {
				type: DataTypes.ENUM(
					"admin",
					"editor",
					"moderator",
					"member",
					"anonymous",
					"all",
				),
				auth: {
					viewableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
			},

			detailsViewableByRole: {
				type: DataTypes.ENUM(
					"admin",
					"editor",
					"moderator",
					"member",
					"anonymous",
					"all",
				),
				auth: {
					viewableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
			},

			phoneNumber: {
				type: DataTypes.STRING(64),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["editor", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("phoneNumber", sanitize.noTags(value));
				},
			},

			address: {
				type: DataTypes.STRING(256),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("address", sanitize.noTags(value));
				},
			},

			city: {
				type: DataTypes.STRING(64),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				set: function (value) {
					this.setDataValue("city", sanitize.noTags(value));
				},
			},

			// todo: this is backwards compatibility and should be removed
			fullName: {
				type: DataTypes.VIRTUAL,
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
				},
				get: function () {
					return this.getDataValue("name") || "";
				},
			},

			displayName: {
				type: DataTypes.VIRTUAL,
				allowNull: true,
				defaultValue: null,
				get: function () {
					// this should use project.config.allowUseOfNicknames but that implies loading the project for every time a user is shown which would be too slow
					// therefore createing nicknames is dependendt on project.config.allowUseOfNicknames; once you have created a nickName it will be shown here no matter what
					const nickName = this.getDataValue("nickName");
					const name = this.name;
					return nickName || name || undefined;
				},
			},

			postcode: {
				type: DataTypes.STRING(10),
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
					createableBy: ["moderator", "owner"],
					updateableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
				validate: {
					isValidPostcode(value) {
						if (value && !/^\d{4} ?[a-zA-Z]{2}$/.test(value)) {
							throw new Error("Ongeldige postcode");
						}
					},
				},
				set: function (postcode) {
					postcode = postcode != null ? String(postcode).trim() : null;
					this.setDataValue("postcode", postcode);
				},
			},

			lastLogin: {
				type: DataTypes.DATE,
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
				},
				allowNull: false,
				defaultValue: sequelize.fn("now"), // sequelize.NOW does not work
			},

			isNotifiedAboutAnonymization: {
				type: DataTypes.DATE,
				auth: {
					listableBy: ["moderator", "owner"],
					viewableBy: ["moderator", "owner"],
				},
				allowNull: true,
				defaultValue: null,
			},
		},
		{
			charset: "utf8",

			/*	indexes: [{
        fields: ['email'],
        unique: true
        }],*/

			hooks: {
				// onderstaand is een workaround: bij een delete wordt wel de validatehook aangeroepen, maar niet de beforeValidate hook. Dat lijkt een bug.
				beforeValidate: beforeValidateHook,
				beforeDestroy: beforeValidateHook,
			},

			individualHooks: true,

			validate: {
				hasValidUserRole: function () {
					if (this.id !== 1 && this.role === "unknown") {
						throw new Error("User role 'unknown' is not allowed");
					}
				},
				onlyMembersCanLogin: function () {
					if (this.role === "unknown" || this.role === "anonymous") {
						if (this.passwordHash) {
							throw new Error(
								"Anonymous profiles cannot have login credentials",
							);
						}
					}
				},
			},
		},
	);

	User.scopes = function scopes() {
		return {
			byIdpUser: (identifier, provider) => {
				const where = {
					where: {
						idpUser: {
							identifier,
							provider,
						},
					},
				};
				return where;
			},

			includeProject: {
				include: [
					{
						model: db.Project,
					},
				],
			},

			onlyListable: function (userId, userRole = "all") {
				// todo: hij kan alleen tegen een enkelvoudige listableBy
				// todo: owner wordt nu altijd toegevoegd, dat moet alleen als die in listableBy staat, maar zie vorige regel
				// todo: gelijkttrekken met Resource.onlyVisible: die is nu exclusive en deze inclusive

				const requiredRole = this.auth?.listableBy || "all";

				// if requiredRole == all then listableByRole is not relevant and neither is userRole
				if (requiredRole === "all") return;

				// if requiredRole != all then listableByRole is allowing

				// null should be seen as requiredRole
				const requiredRoleEscaped = sequelize.escape(requiredRole);
				const rolesEscaped = sequelize.escape(roles[userRole]);
				const nullCondition = `${requiredRoleEscaped} IN (${rolesEscaped})`;

				let where;
				if (userId) {
					where = sequelize.or(
						{ id: userId }, // owner
						{ listableByRole: roles[userRole] || "none" }, // allow when userRole is good enough
						sequelize.and(
							// or null and userRole is at least requiredRole
							{ listableByRole: null },
							sequelize.literal(nullCondition),
						),
					);
				} else {
					where = sequelize.or(
						{ listableByRole: roles[userRole] || "none" }, // allow when userRole is good enough
						sequelize.and(
							// or null and userRole is at least requiredRole
							{ listableByRole: null },
							sequelize.literal(nullCondition),
						),
					);
				}

				return { where };
			},

			includeVote: {
				include: [
					{
						model: db.Vote,
					},
				],
			},

			onlyVisible: (userId, userRole) => {
				if (userId) {
					return {
						where: sequelize.or(
							{ id: userId },
							{ viewableByRole: "all" },
							{ viewableByRole: roles[userRole] || "all" },
						),
					};
				}
				return {
					where: sequelize.or(
						{ viewableByRole: "all" },
						{ viewableByRole: roles[userRole] || "all" },
					),
				};
			},
		};
	};

	User.associate = function (models) {
		this.hasMany(models.Resource, { onDelete: "CASCADE", hooks: true });
		this.hasMany(models.Vote, { onDelete: "CASCADE", hooks: true });
		this.hasMany(models.Comment, { onDelete: "CASCADE", hooks: true });
		this.belongsTo(models.Project, { onDelete: "CASCADE" });
	};

	User.prototype.authenticate = function (password) {
		const method = "bcrypt";
		if (!this.passwordHash) {
			log("user %d has no passwordHash", this.id);
			return false;
		}
		const hash = JSON.parse(this.passwordHash);
		const result = Password[method].compare(password, hash);
		log(
			"authentication for user %d %s",
			this.id,
			result ? "succeeded" : "failed",
		);
		return result;
	};

	User.prototype.isUnknown = function () {
		return this.role === "unknown";
	};

	User.prototype.isAnonymous = function () {
		return this.role === "anonymous";
	};

	User.prototype.isMember = function () {
		return this.role !== "unknown" && this.role !== "anonymous";
	};

	User.prototype.isAdmin = function () {
		return this.role === "admin" || this.role === "su";
	};

	User.prototype.isLoggedIn = function () {
		return this.id && this.id !== 1 && this.isMember();
	};

	User.prototype.getUserVoteResourceId = function () {
		return db.Vote.findOne({ where: { userId: this.id } }).then((vote) => {
			return vote ? vote.resourceId : undefined;
		});
	};

	User.prototype.hasVoted = function () {
		return db.Vote.findOne({ where: { userId: this.id } }).then((vote) => {
			return !!vote;
		});
	};

	User.prototype.hasConfirmed = function () {
		return db.Vote.findOne({
			where: { userId: this.id, confirmed: 1, confirmResourceId: null },
		}).then((vote) => {
			return !!vote;
		});
	};

	User.prototype.willAnonymize = async function () {
		const result = { user: this };

		try {
			if (this.projectId) {
				this.project = await db.Project.findByPk(this.projectId);
			}

			if (this.project) {
				// wat gaat er allemaal gewijzigd worden
				result.project = this.project;
				result.resources = await this.getResources();
				result.comments = await this.getComments();

				// TODO: for now the check is on active vote but this is wrong; a new 'vote had ended' param should be created
				const voteIsActive = this.project.isVoteActive();
				if (voteIsActive) {
					result.votes = await this.getVotes();
				} else {
					result.votes = [];
				}
			}
		} catch (err) {
			console.log(err);
			throw err;
		}

		return result;
	};

	User.prototype.doAnonymize = async function () {
		const result = await this.willAnonymize();

		try {
			// anonymize

			const extraData = {};
			if (!this.project) throw Error("Project not found");
			if (this.project.config.users?.extraData) {
				Object.keys(this.project.config.users.extraData).map(
					(key) => (extraData[key] = null),
				);
			}

			await this.update({
				idpUser: {},
				role: "anonymous",
				passwordHash: null,
				listableByRole: "editor",
				detailsViewableByRole: "editor",
				viewableByRole: "admin",
				email: null,
				nickName: null,
				name: config.users?.anonymize?.name || "Gebruiker is ganonimiseerd",
				postcode: null,
				city: null,
				country: null,
				address: null,
				phoneNumber: null,
				extraData,
				lastLogin: "1970-01-01T00:00:00.000Z",
				isNotifiedAboutAnonymization: null,
			});

			// remove existing votes
			if (result.votes?.length) {
				for (const vote of result.votes) {
					await vote.destroy();
				}
			}
		} catch (err) {
			console.log(err);
			throw err;
		}

		return result;
	};

	User.auth = User.prototype.auth = {
		listableBy: "moderator",
		viewableBy: "all",
		createableBy: "moderator",
		updateableBy: ["moderator", "owner"],
		deleteableBy: ["moderator", "owner"],

		canCreate: function (user, self) {
			// copy the base functionality
			self = self || this;

			if (!user) user = self.auth?.user;
			if (!user || !user.role) user = { role: "all" };

			let valid = userHasRole(user, self.auth?.createableBy, self.id);

			// extra: geen acties op users met meer rechten dan je zelf hebt
			valid = valid && (!self.role || userHasRole(user, self.role));

			return valid;
		},

		canUpdate: function (self, user) {
			self = self || this;

			// The user can either be the one being updated or the one making the update. The user possessing the auth key is the one making the update.
			if (user?.auth) {
				self = user;
				user = self;
			}

			if (!user || !user.role) user = { role: "all" };

			let valid = userHasRole(self, self.auth?.updateableBy, self.id);

			// extra: isOwner through user on different project
			valid =
				valid ||
				(self.idpUser &&
					user.idpUser &&
					self.idpUser.identifier &&
					self.idpUser.identifier === user.idpUser.identifier);

			valid = valid && userHasRole(self, user.role);

			return valid;
		},

		canDelete: function (user, self) {
			// copy the base functionality
			self = self || this;

			if (!user) user = self.auth?.user;
			if (!user || !user.role) user = { role: "all" };

			let valid = userHasRole(user, self.auth?.updateableBy, self.id);

			// extra: admin on different project
			valid = valid && userHasRole(user, "admin");

			// extra: geen acties op users met meer rechten dan je zelf hebt
			valid = valid && userHasRole(user, self.role);

			return valid;
		},
	};

	return User;

	function beforeValidateHook(instance, options) {
		return new Promise((resolve, reject) => {
			if (instance.projectId && !instance.config) {
				db.Project.findByPk(instance.projectId)
					.then((project) => {
						instance.config = merge.recursive(true, config, project.config);
						return project;
					})
					.then((project) => {
						return resolve();
					})
					.catch((err) => {
						throw err;
					});
			} else {
				instance.config = config;
				return resolve();
			}
		});
	}
};
