import { createRoute, type AnyRoute } from '@tanstack/react-router';
import UserManagementLayout from './layouts/user-management.layout';
import UsersListPage from './pages/users/users-list';

export function userManagementRoutes(rootRoute: AnyRoute) {
	// user management layout route that wraps user management routes
	const userManagementLayoutRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: 'user-management',
		component: UserManagementLayout,
	});

	// Users route
	const usersRoute = createRoute({
		getParentRoute: () => userManagementLayoutRoute,
		path: 'users',
		component: UsersListPage,
	});


	// Add user management routes to the user management layout route
	userManagementLayoutRoute.addChildren([usersRoute]);

	return userManagementLayoutRoute;
}


