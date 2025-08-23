import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import DataCollectorLayout from './layouts/data-collector.layout';
import DataCollectorDashboardPage from './pages/data-collector-dashboard';
import FarmersPage from './pages/farmers';
import RegisterFarmerPage from './pages/register-farmer';
import FarmerDetailsPage from './pages/farmer-details';
import VerificationsPage from './pages/verifications';
import DebugAuth from './components/DebugAuth';

export function dataCollectorRoutes(rootRoute: AnyRoute) {
  // Data Collector layout route that wraps all data collector routes
  const dataCollectorLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'data-collector',
    component: DataCollectorLayout
  });

  // Index route that redirects to dashboard
  const dataCollectorIndexRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: '/',
    beforeLoad: () => {
      throw redirect({
        to: '/data-collector/dashboard',
        replace: true,
      });
    },
  });

  // Dashboard route
  const dataCollectorDashboardRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'dashboard',
    component: DataCollectorDashboardPage,
  });

  // Farmers list route
  const farmersRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'farmers',
    component: FarmersPage,
  });

  // Register farmer route
  const registerFarmerRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'register-farmer',
    component: RegisterFarmerPage,
  });

  // Farmer details route
  const farmerDetailsRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'farmers/$farmerId',
    component: FarmerDetailsPage,
  });

  // Verifications route
  const verificationsRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'verifications',
    component: VerificationsPage,
  });

  // Debug route
  const debugRoute = createRoute({
    getParentRoute: () => dataCollectorLayoutRoute,
    path: 'debug',
    component: DebugAuth,
  });

  // Add all data collector child routes to the layout route
  dataCollectorLayoutRoute.addChildren([dataCollectorIndexRoute, dataCollectorDashboardRoute, farmersRoute, registerFarmerRoute, farmerDetailsRoute, verificationsRoute, debugRoute]);

  return dataCollectorLayoutRoute;
}

// Add more routes as needed
// export const farmersListRoute = createRoute({
//   getParentRoute: () => dataCollectorLayoutRoute,
//   path: '/farmers',
//   component: FarmersListPage,
// });

// export const registerFarmerRoute = createRoute({
//   getParentRoute: () => dataCollectorLayoutRoute,
//   path: '/register-farmer',
//   component: RegisterFarmerPage,
// });

// export const verificationsRoute = createRoute({
//   getParentRoute: () => dataCollectorLayoutRoute,
//   path: '/verifications',
//   component: VerificationsPage,
// });
