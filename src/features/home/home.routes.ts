import { createRoute, type AnyRoute } from '@tanstack/react-router';
import HomePage from './pages/home';
import HomeLayout from './layouts/home.layout';

// Build home routes under the provided root route
export function homeRoutes(rootRoute: AnyRoute) {
	// Pathless layout route that wraps all discovery routes
	const HomeLayoutRoute = createRoute({
		getParentRoute: () => rootRoute,
		id: 'homeLayout',
		component: HomeLayout,
	});

	// home route
	const discoveryHomeRoute = createRoute({
		getParentRoute: () => HomeLayoutRoute,
		path: '/',
		component: HomePage,
	});

	// Add all child routes to the pathless layout route
	HomeLayoutRoute.addChildren([
		discoveryHomeRoute,
	]);

	return HomeLayoutRoute;
}


