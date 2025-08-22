import { createRoute, type AnyRoute } from '@tanstack/react-router';
import AuthLayout from '@/features/auth/layouts/auth.layout';
import { LoginPage } from './pages/auth/login';
import { SignupPage } from './pages/auth/signup';
import { ForgotPasswordPage } from './pages/auth/forgot-password';

export function authRoutes(rootRoute: AnyRoute) {

	// Pathless auth layout route that wraps all auth routes
	const authLayoutRoute = createRoute({
		getParentRoute: () => rootRoute,
		id: 'authLayout',
		component: AuthLayout,
	});

	// Auth login route
	const loginRoute = createRoute({
		getParentRoute: () => authLayoutRoute,
		path: 'auth/signin',
		component: LoginPage,
	});

	// Auth signup route
	const signupRoute = createRoute({
		getParentRoute: () => authLayoutRoute,
		path: 'auth/signup',
		component: SignupPage,
	});

	// Auth forgot password route
	const forgotPasswordRoute = createRoute({
		getParentRoute: () => authLayoutRoute,
		path: 'auth/forgot-password',
		component: ForgotPasswordPage,
	});

	// Add all auth child routes to the auth layout route
	authLayoutRoute.addChildren([loginRoute, signupRoute, forgotPasswordRoute]);

	return authLayoutRoute;
}


