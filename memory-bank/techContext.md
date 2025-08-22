# Technical Context

## Current Technology Stack

### Frontend Framework
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 7.1.2** - Fast build tool and dev server

### Routing & State Management
- **TanStack Router 1.131.8** - Type-safe routing with file-based routing
- **Zustand 5.0.7** - Lightweight state management
- **TanStack React Query 5.85.0** - Server state management

### UI & Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - Avatar, Dialog, Dropdown Menu, Label, Select, Slider
- **Lucide React 0.539.0** - Icon library
- **Class Variance Authority 0.7.1** - Component variant management

### Internationalization
- **i18next 25.3.6** - Internationalization framework
- **react-i18next 15.6.1** - React bindings for i18next

### Development Tools
- **ESLint 9.33.0** - Code linting with TypeScript support
- **TypeScript ESLint 8.39.1** - TypeScript-specific linting rules

### Additional Libraries
- **Axios 1.11.0** - HTTP client
- **QRCode 1.5.4** - QR code generation
- **RxJS 7.8.2** - Reactive programming utilities

## Project Structure

```
src/
├── components/ui/          # Reusable UI components (Radix-based)
├── core/                   # Core application logic
│   ├── api/               # API client and endpoints
│   ├── components/        # Core components (auth, navigation)
│   ├── constants/         # Application constants
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Layout components
│   ├── models/            # Data models
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── features/              # Feature-based modules
│   ├── auth/              # Authentication feature
│   ├── home/              # Home page feature
│   └── user-management/   # User management feature
├── lib/                   # Third-party library configurations
│   ├── localization/      # i18n setup
│   └── utils.ts           # Utility functions
└── router.tsx             # Main router configuration
```

## Development Setup

### Prerequisites
- Node.js (latest LTS)
- pnpm (package manager)

### Available Scripts
- `pnpm dev` - Start development server on port 3007
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

### Key Configuration Files
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `components.json` - UI components configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Current Implementation Status

### ✅ Implemented
- Basic authentication system (login, signup, forgot password)
- Multi-language support setup
- Basic routing structure with TanStack Router
- UI component library with Radix UI
- State management with Zustand
- Responsive design foundation

### 🚧 In Progress
- User role-based access control
- Feature-based routing architecture

### ❌ Not Yet Implemented
- USSD simulator interface
- Farmer mobile dashboard
- Data collector workspace
- Financial institution workspace
- System administrator workspace
- Offline sync capabilities
- Real-time notifications
- AI-powered recommendations
- Comprehensive reporting and analytics

## Development Patterns

### Feature-Based Architecture
- Each feature is self-contained with its own routes, components, and API
- Features are referenced using `@features/` prefix
- Shared functionality is placed in `@core/` modules

### Authentication Pattern
- Role-based access control
- JWT token management
- Protected routes based on user roles

### Routing Pattern
- File-based routing with TanStack Router
- Layout-based route organization
- Nested routing for feature modules
