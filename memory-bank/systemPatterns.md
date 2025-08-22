# System Patterns

## Architecture Overview

The Farmers Loan Facilitator System follows a **Feature-Based Architecture** with clear separation of concerns and modular design.

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
├── data-collector/         # Data collector workspace
├── financial-institution/  # Financial institution workspace
└── admin/                  # System administration
```

### 2. Core Module Pattern
```
core/
├── api/                   # Centralized API management
├── components/            # Shared UI components
├── constants/             # Application constants
├── hooks/                 # Custom React hooks
├── layouts/               # Shared layout components
├── models/                # Data models and types
├── store/                 # Global state management
├── types/                 # TypeScript type definitions
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
```

### 2. Supabase API Layer Pattern
```typescript
// Feature-specific API using Supabase client
import { supabase } from '@/core/api/supabase-client';

export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { success: !error, data, error };
  },
  signup: async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    return { success: !error, data, error };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error };
  }
};
```

### 3. Route Builder Pattern
```typescript
// Feature routes are functions that return route configurations
export function authRoutes(rootRoute: AnyRoute) {
  const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authLayout',
    component: AuthLayout,
  });
  
  // Add child routes
  authLayoutRoute.addChildren([loginRoute, signupRoute, forgotPasswordRoute]);
  
  return authLayoutRoute;
}
```

### 4. Layout Pattern
```typescript
// Layouts wrap feature pages and provide common UI elements
const AuthLayout = () => (
  <div className="auth-layout">
    <LanguageSelector />
    <Outlet />
  </div>
);
```

## Component Patterns

### 1. UI Component Pattern
```typescript
// Reusable UI components with variants
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### 2. Form Pattern
```typescript
// Controlled forms with validation
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## State Management Patterns

### 1. Global State (Zustand)
- **Auth Store**: User authentication state, tokens, loading states
- **UI Store**: Theme, language, notifications, sidebar state
- **Feature Stores**: Feature-specific state (loan data, farmer data, etc.)

### 2. Local State (React useState)
- Form inputs and validation
- Component-specific UI state
- Temporary data that doesn't need persistence

### 3. Server State (TanStack Query)
- API data caching and synchronization
- Background refetching
- Optimistic updates

## Routing Patterns

### 1. Nested Routing
```typescript
// Parent route with layout
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authLayout',
  component: AuthLayout,
});

// Child routes
const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'auth/signin',
  component: LoginPage,
});
```

### 2. Route Protection
```typescript
// Protected routes based on authentication and roles
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/auth/signin' });
    }
  },
});
```

## Supabase Integration Patterns

### 1. Supabase Client Configuration
```typescript
// Centralized Supabase client
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 2. Database Operations Pattern
```typescript
// Feature-specific database operations
export const farmerAPI = {
  getFarmers: async () => {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false });
    return { success: !error, data, error };
  },
  
  createFarmer: async (farmerData) => {
    const { data, error } = await supabase
      .from('farmers')
      .insert(farmerData)
      .select()
      .single();
    return { success: !error, data, error };
  }
};
```

### 3. Real-time Subscriptions Pattern
```typescript
// Real-time data subscriptions
export const useRealtimeFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel('farmers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'farmers' },
        (payload) => {
          // Handle real-time updates
          console.log('Change received!', payload);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
  
  return farmers;
};
```

### 4. Row Level Security (RLS) Pattern
```sql
-- Example RLS policy for farmers table
CREATE POLICY "Users can view their own data" ON farmers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Data collectors can view assigned farmers" ON farmers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_assignments 
      WHERE collector_id = auth.uid() 
      AND farmer_id = farmers.id
    )
  );
```

## Internationalization Pattern

### 1. Namespace Organization
```typescript
// Feature-specific translation namespaces
const resources = {
  en: {
    auth: { /* auth translations */ },
    common: { /* common translations */ },
    farmer: { /* farmer translations */ },
    // ... other namespaces
  }
};
```

### 2. Translation Hook Pattern
```typescript
// Consistent translation usage
export function LoginForm() {
  const { t } = useTranslation('auth');
  
  return (
    <h1>{t('loginWithYourAccount')}</h1>
  );
}
```

## Responsive Design Patterns

### 1. Mobile-First Approach
```css
/* Base styles for mobile */
.container { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: 3rem; }
}
```

### 2. Component Responsiveness
```typescript
// Components adapt to screen size
const Dashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Dashboard cards */}
  </div>
);
```

## Security Patterns

### 1. Supabase Authentication Flow
1. User submits credentials
2. Supabase validates and returns JWT token
3. Token stored in Zustand store and Supabase session
4. Supabase client automatically includes token in requests
5. Protected routes check for valid Supabase session
6. Row Level Security (RLS) policies enforce data access

### 2. Role-Based Access Control
```typescript
// Route protection based on user roles
const adminRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'admin') {
      throw redirect({ to: '/unauthorized' });
    }
  },
});
```

## Performance Patterns

### 1. Code Splitting
- Feature-based code splitting
- Lazy loading of routes
- Dynamic imports for heavy components

### 2. Caching Strategy
- API response caching with TanStack Query
- Local storage for user preferences
- Session storage for temporary data

### 3. Bundle Optimization
- Tree shaking for unused code
- Image optimization
- CSS purging with Tailwind
