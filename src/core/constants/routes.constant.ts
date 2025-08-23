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
	FARMER: {
		root: '/farmer',
		ussd: '/farmer/ussd',
		dashboard: '/farmer/dashboard',
		loans: '/farmer/loans',
		loanDetails: '/farmer/loans/$loanId',
		applyLoan: '/farmer/apply-loan',
		checkEligibility: '/farmer/check-eligibility'
	},
	DATA_COLLECTOR: {
		root: '/data-collector',
		dashboard: '/data-collector/dashboard',
		farmers: '/data-collector/farmers',
		registerFarmer: '/data-collector/register-farmer',
		verifications: '/data-collector/verifications',
	},
    HARVESTING: {
        root: '/harvesting',
    },
};