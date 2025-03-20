import { type Role, roles } from "./roles";

interface MustHaveRole {
	role: Role;
}

export default function hasRole(
	user: MustHaveRole,
	minRoles: Role | Array<Role>,
) {
	minRoles = minRoles || "admin"; // admin can do anything
	if (!Array.isArray(minRoles)) minRoles = [minRoles];

	const userRole = user?.role || "all";

	const valid = minRoles.find((minRole) => {
		return roles[userRole] && roles[userRole].indexOf(minRole) !== -1;
	});

	return valid;
}
