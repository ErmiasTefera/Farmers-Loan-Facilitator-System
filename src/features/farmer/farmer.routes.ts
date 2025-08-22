import { createRoute, type AnyRoute } from '@tanstack/react-router';
import FarmerLayout from '@/features/farmer/layouts/farmer.layout';
import { USSDSimulatorPage } from './pages/ussd-simulator';
import { FarmerDashboardPage } from './pages/farmer-dashboard';
import { LoanListPage } from './pages/loan-list';
import { LoanDetailsPage } from './pages/loan-details';
import { ApplyLoanPage } from './pages/apply-loan';
import { CheckEligibilityPage } from './pages/check-eligibility';

export function farmerRoutes(rootRoute: AnyRoute) {
  // Farmer layout route that wraps all farmer routes
  const farmerLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'farmer',
    component: FarmerLayout,

  });

  // USSD Simulator route
  const ussdSimulatorRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'ussd',
    component: USSDSimulatorPage,
  });

  // Farmer Dashboard route
  const farmerDashboardRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'dashboard',
    component: FarmerDashboardPage,
  });

  // Loan List route
  const loanListRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'loans',
    component: LoanListPage,
  });

  // Loan Details route
  const loanDetailsRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'loans/$loanId',
    component: LoanDetailsPage,
  });

  // Apply Loan route
  const applyLoanRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'apply-loan',
    component: ApplyLoanPage,
  });

  // Check Eligibility route
  const checkEligibilityRoute = createRoute({
    getParentRoute: () => farmerLayoutRoute,
    path: 'check-eligibility',
    component: CheckEligibilityPage,
  });

  // Add all farmer child routes to the farmer layout route
  farmerLayoutRoute.addChildren([ussdSimulatorRoute, farmerDashboardRoute, loanListRoute, loanDetailsRoute, applyLoanRoute, checkEligibilityRoute]);

  return farmerLayoutRoute;
}
