import { createRoute, redirect } from '@tanstack/react-router';
import { FinancialInstitutionLayout } from './layouts/financial-institution.layout';
import { DashboardPage } from './pages/dashboard';
import { ApplicationsPage } from './pages/applications';
import { ApplicationReviewPage } from './pages/application-review';
import { PortfolioPage } from './pages/portfolio';
import type { AnyRoute } from '@tanstack/react-router';

export function financialInstitutionRoutes(rootRoute: AnyRoute) {
  const financialInstitutionLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/financial-institution',
    component: FinancialInstitutionLayout
  });

  // Dashboard route
  const dashboardRoute = createRoute({
    getParentRoute: () => financialInstitutionLayoutRoute,
    path: '/dashboard',
    component: DashboardPage,
  });

  // Applications list route
  const applicationsRoute = createRoute({
    getParentRoute: () => financialInstitutionLayoutRoute,
    path: '/applications',
    component: ApplicationsPage,
  });

  // Application review route
  const applicationReviewRoute = createRoute({
    getParentRoute: () => financialInstitutionLayoutRoute,
    path: '/applications/$applicationId',
    component: ApplicationReviewPage,
  });

  // Portfolio analytics route
  const portfolioRoute = createRoute({
    getParentRoute: () => financialInstitutionLayoutRoute,
    path: '/portfolio',
    component: PortfolioPage,
  });

  // Default redirect to dashboard
  const indexRoute = createRoute({
    getParentRoute: () => financialInstitutionLayoutRoute,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/financial-institution/dashboard' });
    },
  });

  // Add child routes
  financialInstitutionLayoutRoute.addChildren([indexRoute, dashboardRoute, applicationsRoute, applicationReviewRoute, portfolioRoute]);

  return financialInstitutionLayoutRoute;
}
