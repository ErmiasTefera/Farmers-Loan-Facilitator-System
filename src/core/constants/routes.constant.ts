// routes for the application grouped by feature
export const APP_ROUTES = {
	DISCOVERY: {
		root: '/',
		search: '/search',
	},
	AUTH: {
		root: '/auth',
		signin: '/auth/signin',
		signup: '/auth/signup',
		forgotPassword: '/auth/forgot-password',
	},
	USER_MANAGEMENT: {
		root: '/user-management',
        users: '/user-management/users',
		profile: '/user-management/profile',
        roles: '/user-management/roles',
        permissions: '/user-management/permissions',
	},
    HARVESTING: {
        root: '/harvesting',
    },
};