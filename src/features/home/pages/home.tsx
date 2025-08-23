import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/core/store/authStore';
import { useRoleState } from '@/core/hooks/useRoleState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Phone,
  Smartphone,
  Building,
  Settings
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();
  const { currentRole } = useRoleState();

  const isLoggedIn = !!user && !!session;

  // Quick start navigation items for different roles
  const getQuickStartItems = () => {
    switch (currentRole) {
      case 'farmer':
        return [
          {
            title: 'Apply for Loan',
            description: 'Submit a new loan application',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-blue-500',
            route: '/farmer/apply-loan'
          },
          {
            title: 'My Loans',
            description: 'View your loan applications and status',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-green-500',
            route: '/farmer/loans'
          },
          {
            title: 'Check Eligibility',
            description: 'Check if you qualify for a loan',
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-purple-500',
            route: '/farmer/check-eligibility'
          },
          {
            title: 'USSD Access',
            description: 'Access via USSD (*789#)',
            icon: <Phone className="w-6 h-6" />,
            color: 'bg-orange-500',
            route: '/farmer/ussd'
          }
        ];
      
      case 'data-collector':
        return [
          {
            title: 'Register Farmer',
            description: 'Register a new farmer',
            icon: <User className="w-6 h-6" />,
            color: 'bg-blue-500',
            route: '/data-collector/register'
          },
          {
            title: 'Farmers List',
            description: 'View and manage registered farmers',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-green-500',
            route: '/data-collector/farmers'
          },
          {
            title: 'Verifications',
            description: 'Review and verify farmer data',
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-purple-500',
            route: '/data-collector/verifications'
          },
          {
            title: 'Offline Mode',
            description: 'Work without internet connection',
            icon: <Smartphone className="w-6 h-6" />,
            color: 'bg-orange-500',
            route: '/data-collector/offline'
          }
        ];
      
      case 'financial-institution':
        return [
          {
            title: 'Review Applications',
            description: 'Review pending loan applications',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-blue-500',
            route: '/financial-institution/applications'
          },
          {
            title: 'Portfolio Analytics',
            description: 'View portfolio performance and insights',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-green-500',
            route: '/financial-institution/portfolio'
          },
          {
            title: 'Risk Assessment',
            description: 'Assess loan application risks',
            icon: <Shield className="w-6 h-6" />,
            color: 'bg-purple-500',
            route: '/financial-institution/risk-assessment'
          },
          {
            title: 'Reports',
            description: 'Generate and view reports',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-orange-500',
            route: '/financial-institution/reports'
          }
        ];
      
      case 'admin':
        return [
          {
            title: 'User Management',
            description: 'Manage system users and roles',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-500',
            route: '/admin/users'
          },
          {
            title: 'System Configuration',
            description: 'Configure system settings',
            icon: <Settings className="w-6 h-6" />,
            color: 'bg-green-500',
            route: '/admin/config'
          },
          {
            title: 'System Monitoring',
            description: 'Monitor system performance',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-purple-500',
            route: '/admin/monitoring'
          },
          {
            title: 'Reports & Analytics',
            description: 'System-wide reports and analytics',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-orange-500',
            route: '/admin/analytics'
          }
        ];
      
      default:
        return [];
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'farmer': return 'Farmer';
      case 'data-collector': return 'Data Collector';
      case 'financial-institution': return 'Financial Institution';
      case 'admin': return 'System Administrator';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return <User className="w-5 h-5" />;
      case 'data-collector': return <Users className="w-5 h-5" />;
      case 'financial-institution': return <Building className="w-5 h-5" />;
      case 'admin': return <Settings className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  // Non-logged-in user experience
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Hero Title */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  <span className="text-primary block">Farmers Loan Facilitator</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Empowering Ethiopian farmers with accessible financial services
                </p>
              </div>

              {/* Hero Description */}
              <div className="mb-12">
                <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                  A comprehensive platform connecting farmers, data collectors, and financial institutions 
                  to facilitate loan applications and financial inclusion across Ethiopia.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={() => navigate({ to: '/auth/signin' })}
                >
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-3"
                  onClick={() => navigate({ to: '/auth/signup' })}
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Platform Features
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive tools for all stakeholders in the agricultural finance ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-semibold mb-2">For Farmers</h3>
                  <p className="text-muted-foreground">
                    Easy loan applications via USSD and web interface
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">For Data Collectors</h3>
                  <p className="text-muted-foreground">
                    Field data collection with offline capabilities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Building className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-xl font-semibold mb-2">For Financial Institutions</h3>
                  <p className="text-muted-foreground">
                    Portfolio management and risk assessment tools
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h3 className="text-xl font-semibold mb-2">For Administrators</h3>
                  <p className="text-muted-foreground">
                    System configuration and user management
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Logged-in user experience
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user?.full_name || 'User'}!
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {getRoleIcon(currentRole)}
                <Badge variant="outline" className="text-sm">
                  {getRoleDisplayName(currentRole)}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate({ to: '/auth/signin' })}
            >
              Switch Account
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start Navigation */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Quick Start
            </h2>
            <p className="text-lg text-gray-600">
              Get started with your most common tasks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getQuickStartItems().map((item, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate({ to: item.route })}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${item.color} text-white`}>
                      {item.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity or Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <p className="text-lg text-gray-600">
              Key insights and recent activity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                <p className="text-gray-600">User Roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                <p className="text-gray-600">Languages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <p className="text-gray-600">USSD Access</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
