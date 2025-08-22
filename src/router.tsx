import React from 'react';
import { createRouter, RouterProvider, createRootRoute, Outlet } from '@tanstack/react-router';

// Feature route builders
import { userManagementRoutes } from '@features/user-management/user-management.routes';
import { authRoutes } from '@features/auth/auth.routes';
import { homeRoutes } from '@features/home/home.routes';

// Root route
const rootRoute = createRootRoute({
	component: () => <Outlet />,
});

// Build the route tree
rootRoute.addChildren([
	homeRoutes(rootRoute),
	userManagementRoutes(rootRoute),
	authRoutes(rootRoute),
]);

const router = createRouter({ routeTree: rootRoute });

export default function AppRouter(): React.JSX.Element {
	return <RouterProvider router={router} />;
}


