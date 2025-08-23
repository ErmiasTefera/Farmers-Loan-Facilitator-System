# System Patterns

## Architecture Overview

The Farmers Loan Facilitator System follows a **Feature-Based Architecture** with clear separation of concerns and modular design, enhanced with advanced patterns for user impersonation, offline capabilities, and proper loan-payment relationships.

## Core Architectural Patterns

### 1. Feature-Based Organization
```
features/
├── auth/                    # Authentication feature
│   ├── components/         # Feature-specific components
│   ├── layouts/           # Feature-specific layouts
│   ├── pages/             # Feature pages
│   ├── auth.api.ts        # Feature API layer
│   └── auth.routes.ts     # Feature routing
├── farmer/                 # Farmer-specific features
│   ├── components/        # USSD simulator, dashboard, loan management
│   ├── layouts/           # Farmer-specific layouts
│   ├── pages/             # Farmer pages
│   ├── farmer.api.ts      # Farmer API layer
│   └── farmer.routes.ts   # Farmer routing
├── data-collector/         # Data collector workspace
│   ├── components/        # Registration, verification, offline sync
│   ├── layouts/           # Collector-specific layouts
│   ├── pages/             # Collector pages
│   ├── data-collector.api.ts # Collector API layer
│   └── data-collector.routes.ts # Collector routing
├── financial-institution/  # Financial institution workspace
└── admin/                  # System administration
```

### 2. Core Module Pattern
```
core/
├── api/                   # Centralized API management
│   ├── client.ts         # Supabase client configuration
│   ├── queryClient.ts    # TanStack Query configuration
│   └── supabase-client.ts # Supabase client instance
├── components/            # Shared UI components
│   ├── auth/             # Authentication components
│   ├── shared/           # Reusable components (loans, payments, etc.)
│   └── TopNavigation.tsx # Shared navigation with role switcher
├── constants/             # Application constants
├── hooks/                 # Custom React hooks
│   ├── useRoleState.ts   # Role state management
│   ├── useImpersonation.ts # Impersonation utilities
│   └── useTheme.ts       # Theme management
├── layouts/               # Shared layout components
├── models/                # Data models and types
├── store/                 # Global state management
│   ├── authStore.ts      # Authentication state
│   ├── uiStore.ts        # UI state
│   ├── roleStore.ts      # Role state
│   ├── impersonationStore.ts # Impersonation state
│   └── offlineStore.ts   # Offline state and sync
├── types/                 # TypeScript type definitions
│   └── database.types.ts # Supabase database types
└── utils/                 # Utility functions
```

## Design Patterns

### 1. Store Pattern (Zustand)
```typescript
// Centralized state management with actions
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  // Actions
  login: async (email, password) => { /* implementation */ },
  logout: async () => { /* implementation */ },
  clearError: () => set({ error: null })
}));

// Impersonation store for testing
export const useImpersonationStore = create<ImpersonationState>()(
  persist(
    (set, get) => ({
      isImpersonating: false,
      impersonatedUser: null,
      availableUsers: {},
      loading: false,
      error: null,
      
      startImpersonation: (user) => set({ isImpersonating: true, impersonatedUser: user }),
      stopImpersonation: () => set({ isImpersonating: false, impersonatedUser: null }),
      loadUsersForRole: async (role) => { /* implementation */ },
      switchRoleAndSelectFirst: async (role) => { /* implementation */ }
    }),
    { name: 'impersonation-storage' }
  )
);
```

### 2. Supabase API Layer Pattern
```typescript
// Feature-specific API using Supabase client
import { supabase } from '@/core/api/supabase-client';

export const farmerAPI = {
  // Loan application management with proper relationships
  async getDashboardData(farmerId: string) {
    const [payments, loanApplications, eligibility] = await Promise.all([
      this.getPaymentsByFarmer(farmerId),
      this.getLoanApplicationsByFarmer(farmerId),
      this.checkEligibility(farmerId)
    ]);

    // Link payments to loan applications
    const activeLoan = loanApplications.find(app => app.status === 'approved');
    if (activeLoan) {
      const loanPayments = payments.filter(payment => 
        payment.loan_application_id === activeLoan.id || 
        (activeLoan.loan_id && payment.loan_id === activeLoan.loan_id)
      );
      activeLoan.payments = loanPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status
      }));
    }

    return { activeLoan, creditScore: eligibility.creditScore, recentPayments: payments };
  },

  // Payment creation with proper relationships
  async createPayment(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select('*, farmer:farmer_id(*), loan_application:loan_application_id(*)')
      .single();
    
    if (error) throw new Error(`Failed to create payment: ${error.message}`);
    return data;
  }
};
```

### 3. Route Builder Pattern
```typescript
// Feature routes are functions that return route configurations
export function farmerRoutes(rootRoute: AnyRoute) {
  const farmerLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'farmerLayout',
    component: FarmerLayout,
    beforeLoad: ({ context }) => {
      // Role-based access control
      if (context.user?.role !== 'farmer') {
        throw redirect({ to: '/auth/signin' });
      }
    }
  });
  
  // Add child routes
  farmerLayoutRoute.addChildren([
    dashboardRoute,
    ussdSimulatorRoute,
    applyLoanRoute,
    checkEligibilityRoute,
    loanListRoute,
    loanDetailsRoute
  ]);
  
  return farmerLayoutRoute;
}
```

### 4. Impersonation Pattern
```typescript
// Impersonation hook for API integration
export const useImpersonation = () => {
  const { isImpersonating, impersonatedUser } = useImpersonationStore();
  
  const getEffectiveUser = () => {
    return isImpersonating && impersonatedUser ? impersonatedUser : null;
  };
  
  const getEffectiveUserId = () => {
    const effectiveUser = getEffectiveUser();
    return effectiveUser?.id || null;
  };
  
  const getEffectiveEntityId = () => {
    const effectiveUser = getEffectiveUser();
    return effectiveUser?.entity_id || null;
  };
  
  return {
    isImpersonating,
    impersonatedUser,
    getEffectiveUser,
    getEffectiveUserId,
    getEffectiveEntityId
  };
};

// API integration with impersonation
const getEffectiveFarmerId = (): string | null => {
  const impersonationStore = useImpersonationStore.getState();
  return impersonationStore.isImpersonating && impersonationStore.impersonatedUser?.entity_id 
    ? impersonationStore.impersonatedUser.entity_id 
    : null;
};
```

### 5. Offline-Aware API Pattern
```typescript
// Offline-aware API operations
export const offlineAwareAPI = {
  async createFarmer(farmerData: FarmerRegistration) {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
      try {
        // Try online operation first
        const result = await supabase.from('farmers').insert(farmerData);
        return { success: true, data: result.data, source: 'online' };
      } catch (error) {
        // Fallback to offline storage
        return await this.storeOffline(farmerData);
      }
    } else {
      // Store offline
      return await this.storeOffline(farmerData);
    }
  },

  async storeOffline(data: any) {
    const offlineStore = useOfflineStore.getState();
    await offlineStore.addToSyncQueue('farmers', 'create', data);
    return { success: true, data, source: 'offline' };
  }
};
```

### 6. Loan-Payment Relationship Pattern
```typescript
// Smart payment calculation in components
export const LoanSummary: React.FC<LoanSummaryProps> = ({ loan }) => {
  // Calculate remaining amount from payments
  const calculateRemaining = () => {
    if (loan.remaining !== undefined) {
      return loan.remaining;
    }
    
    if (loan.payments && loan.payments.length > 0) {
      const totalPaid = loan.payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);
      return Math.max(0, loan.amount - totalPaid);
    }
    
    return loan.amount; // If no payments, full amount is remaining
  };

  const remainingAmount = calculateRemaining();
  const progressPercentage = loan.amount > 0 
    ? Math.round(((loan.amount - remainingAmount) / loan.amount) * 100)
    : 0;

  return (
    // Component JSX with calculated values
  );
};
```

### 7. Role Switching Pattern
```typescript
// Smart role switching with auto-selection
export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ title, userRole }) => {
  const { switchRoleAndSelectFirst } = useImpersonationStore();
  
  const handleRoleChange = async (role: Role) => {
    // Switch role and automatically select the first user if available
    if (role.id === 'farmer' || role.id === 'data-collector') {
      await switchRoleAndSelectFirst(role.id);
    }
    
    updateRole(role.id);
    navigate({ to: role.baseUrl as any });
  };

  return (
    // Role switcher UI
  );
};
```

## Database Relationship Patterns

### 1. Loan-Payment Relationship Schema
```sql
-- Loan applications table with loan relationship
ALTER TABLE loan_applications 
ADD COLUMN loan_id UUID REFERENCES loans(id);

-- Payments table with both loan and loan_application relationships
ALTER TABLE payments 
ADD COLUMN loan_application_id UUID REFERENCES loan_applications(id);

-- Automatic loan creation trigger
CREATE TRIGGER trigger_create_loan_from_application
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_loan_from_application();

-- Automatic payment linking trigger
CREATE TRIGGER trigger_link_payment_to_application
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION link_payment_to_application();
```

### 2. TypeScript Type Extensions
```typescript
// Extended types for relationships
export type LoanApplication = Tables<'loan_applications'> & {
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
  loan?: Loan;
};

export type Payment = Tables<'payments'> & {
  loan_application?: LoanApplication;
  farmer?: Farmer;
};
```

## Component Patterns

### 1. Shared Component Pattern
```typescript
// Reusable loan components
export const LoanSummary: React.FC<LoanSummaryProps> = ({ 
  loan,
  showProgress = true,
  showNextPayment = true,
  className = ""
}) => {
  // Smart calculation logic
  const calculateRemaining = () => { /* implementation */ };
  const remainingAmount = calculateRemaining();
  
  return (
    <Card className={className}>
      {/* Responsive loan summary UI */}
    </Card>
  );
};

// Shared payment history component
export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {payments.map(payment => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </div>
  );
};
```

### 2. Responsive Navigation Pattern
```typescript
// Shared top navigation with role switching and impersonation
export const TopNavigation: React.FC<TopNavigationProps> = ({ title }) => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b">
      <RoleSwitcher title={title} />
      <div className="flex items-center space-x-4">
        <LanguageSelector />
        <ThemeToggle />
        <ImpersonationSwitcher />
        <AuthStatus />
      </div>
    </nav>
  );
};
```

## State Management Patterns

### 1. Multi-Store Architecture
```typescript
// Centralized store exports
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useRoleState } from './roleStore';
export { useImpersonationStore } from './impersonationStore';
export { useOfflineStore } from './offlineStore';

// Store composition pattern
export const useAppState = () => {
  const auth = useAuthStore();
  const ui = useUIStore();
  const role = useRoleState();
  const impersonation = useImpersonationStore();
  const offline = useOfflineStore();
  
  return { auth, ui, role, impersonation, offline };
};
```

### 2. Offline State Management
```typescript
// Offline store with sync queue
export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      syncQueue: [],
      conflicts: [],
      
      addToSyncQueue: async (table, operation, data) => {
        const queue = get().syncQueue;
        const newItem = { id: Date.now(), table, operation, data, timestamp: Date.now() };
        set({ syncQueue: [...queue, newItem] });
        await get().processSyncQueue();
      },
      
      processSyncQueue: async () => {
        if (!get().isOnline) return;
        
        const queue = get().syncQueue;
        for (const item of queue) {
          try {
            await processSyncItem(item);
            set({ syncQueue: queue.filter(q => q.id !== item.id) });
          } catch (error) {
            // Handle conflicts and retries
          }
        }
      }
    }),
    { name: 'offline-storage' }
  )
);
```

## Error Handling Patterns

### 1. API Error Handling
```typescript
// Consistent error handling across APIs
export const handleAPIError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  if (error.code === 'PGRST116') {
    return { success: false, error: 'No data found' };
  }
  
  if (error.message?.includes('network')) {
    return { success: false, error: 'Network error - check connection' };
  }
  
  return { success: false, error: error.message || 'Unknown error occurred' };
};

// Usage in API methods
export const farmerAPI = {
  async getFarmerProfile(farmerId: string) {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return handleAPIError(error, 'getFarmerProfile');
    }
  }
};
```

### 2. Component Error Boundaries
```typescript
// Error boundary for feature components
export const FeatureErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Something went wrong. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      {children}
    </ErrorBoundary>
  );
};
```

## Performance Patterns

### 1. Code Splitting
```typescript
// Lazy loading for feature routes
const FarmerDashboard = lazy(() => import('./components/FarmerDashboard'));
const DataCollectorDashboard = lazy(() => import('./components/DataCollectorDashboard'));

// Route-based code splitting
export const farmerRoutes = (rootRoute: AnyRoute) => {
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: FarmerDashboard,
  });
  
  return dashboardRoute;
};
```

### 2. Optimistic Updates
```typescript
// Optimistic updates for better UX
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  const optimisticUpdate = async (mutationFn: () => Promise<any>, updateFn: () => void) => {
    // Apply optimistic update immediately
    updateFn();
    
    try {
      // Perform actual update
      await mutationFn();
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries();
    }
  };
  
  return { optimisticUpdate };
};
```

## Security Patterns

### 1. Row Level Security (RLS)
```sql
-- RLS policies for data protection
CREATE POLICY "Users can view their own loan applications" ON loan_applications
FOR SELECT USING (farmer_id = auth.uid());

CREATE POLICY "Users can insert payments for their loan applications" ON payments
FOR INSERT WITH CHECK (
  loan_application_id IN (
    SELECT id FROM loan_applications WHERE farmer_id = auth.uid()
  )
);
```

### 2. Input Validation
```typescript
// Comprehensive input validation
export const validateFarmerData = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.full_name?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!data.phone_number?.match(/^\+?[1-9]\d{1,14}$/)) {
    errors.push('Valid phone number is required');
  }
  
  if (data.farm_size_hectares && data.farm_size_hectares <= 0) {
    errors.push('Farm size must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## Testing Patterns

### 1. Impersonation Testing
```typescript
// Test different user roles with impersonation
export const TestWithImpersonation: React.FC<{ role: string }> = ({ role, children }) => {
  const { loadUsersForRole, startImpersonation } = useImpersonationStore();
  
  useEffect(() => {
    const setupImpersonation = async () => {
      await loadUsersForRole(role as any);
      const users = useImpersonationStore.getState().availableUsers[role];
      if (users?.length > 0) {
        startImpersonation(users[0]);
      }
    };
    
    setupImpersonation();
  }, [role]);
  
  return <>{children}</>;
};
```

### 2. Offline Testing
```typescript
// Test offline functionality
export const OfflineTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setOfflineMode } = useOfflineStore();
  
  const toggleOffline = () => {
    setOfflineMode(!navigator.onLine);
  };
  
  return (
    <div>
      <button onClick={toggleOffline}>Toggle Offline Mode</button>
      {children}
    </div>
  );
};
```

## Internationalization Patterns

### 1. Translation Organization
```typescript
// Organized translation namespaces
export const i18n = createInstance({
  resources: {
    en: {
      common: commonTranslations,
      auth: authTranslations,
      farmer: farmerTranslations,
      'data-collector': dataCollectorTranslations,
      'financial-institution': financialInstitutionTranslations,
      admin: adminTranslations
    },
    am: {
      // Amharic translations
    },
    om: {
      // Afaan Oromoo translations
    }
  }
});
```

### 2. Dynamic Translation Loading
```typescript
// Load translations based on feature
export const useFeatureTranslation = (feature: string) => {
  const { t, i18n } = useTranslation(feature);
  
  useEffect(() => {
    if (!i18n.hasResourceBundle(i18n.language, feature)) {
      import(`@/lib/localization/i18n.${feature}.ts`).then((module) => {
        i18n.addResourceBundle(i18n.language, feature, module.default);
      });
    }
  }, [feature, i18n]);
  
  return { t };
};
```

## Summary

The system implements a comprehensive set of patterns that support:

1. **Feature-Based Architecture**: Clear separation of concerns with modular design
2. **Advanced State Management**: Multi-store architecture with offline support
3. **User Impersonation**: Complete testing system for multi-role development
4. **Offline-First Design**: Robust offline capabilities with sync management
5. **Proper Data Relationships**: Loan-payment relationships with automatic linking
6. **Role-Based Access Control**: Comprehensive role management and switching
7. **Performance Optimization**: Code splitting, optimistic updates, and caching
8. **Security**: RLS policies and input validation
9. **Testing**: Impersonation and offline testing patterns
10. **Internationalization**: Multi-language support with organized translations

These patterns ensure the system is scalable, maintainable, and provides an excellent user experience across all user roles and scenarios.
