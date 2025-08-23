import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { financialInstitutionAPI, type PortfolioMetrics, type LoanApplicationWithDetails } from '../financial-institution.api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';

interface PortfolioAnalyticsData {
  portfolioMetrics: PortfolioMetrics;
  applications: LoanApplicationWithDetails[];
  monthlyData: Array<{
    month: string;
    disbursements: number;
    collections: number;
    applications: number;
  }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  statusDistribution: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const PortfolioAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('disbursements');

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        
        // Get portfolio metrics and applications
        const [metrics, applications] = await Promise.all([
          financialInstitutionAPI.getPortfolioMetrics(),
          financialInstitutionAPI.getAllLoanApplications()
        ]);

        // Generate mock monthly data (in real app, this would come from API)
        const monthlyData = generateMonthlyData();
        
        // Calculate distributions
        const riskDistribution = calculateRiskDistribution(applications);
        const statusDistribution = calculateStatusDistribution(applications);

        setData({
          portfolioMetrics: metrics,
          applications,
          monthlyData,
          riskDistribution,
          statusDistribution
        });
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Fallback to mock data
        setData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      disbursements: Math.floor(Math.random() * 500000) + 200000,
      collections: Math.floor(Math.random() * 400000) + 150000,
      applications: Math.floor(Math.random() * 50) + 20
    }));
  };

  const calculateRiskDistribution = (applications: LoanApplicationWithDetails[]) => {
    const distribution = { low: 0, medium: 0, high: 0 };
    applications.forEach(app => {
      const riskScore = app.riskScore || 500;
      if (riskScore < 400) distribution.low++;
      else if (riskScore < 600) distribution.medium++;
      else distribution.high++;
    });
    return distribution;
  };

  const calculateStatusDistribution = (applications: LoanApplicationWithDetails[]) => {
    const distribution = { pending: 0, approved: 0, rejected: 0 };
    applications.forEach(app => {
      distribution[app.status as keyof typeof distribution]++;
    });
    return distribution;
  };

  const generateMockData = (): PortfolioAnalyticsData => ({
    portfolioMetrics: {
      totalLoans: 45,
      activeLoans: 32,
      totalPortfolioValue: 2500000,
      averageLoanAmount: 55555,
      repaymentRate: 87.5,
      defaultRate: 3.2,
      monthlyDisbursements: 450000,
      monthlyCollections: 380000
    },
    applications: [],
    monthlyData: generateMonthlyData(),
    riskDistribution: { low: 15, medium: 20, high: 10 },
    statusDistribution: { pending: 8, approved: 25, rejected: 12 }
  });

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'disbursements':
        return 'text-green-600';
      case 'collections':
        return 'text-blue-600';
      case 'applications':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'disbursements':
        return <TrendingUp className="w-4 h-4" />;
      case 'collections':
        return <DollarSign className="w-4 h-4" />;
      case 'applications':
        return <Users className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading portfolio analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load portfolio data</p>
      </div>
    );
  }

  const { portfolioMetrics, applications, monthlyData, riskDistribution, statusDistribution } = data;

  return (
    <div className="space-y-6 mt-12 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Portfolio Analytics</h1>
          <p className="text-sm md:text-base text-gray-600">Comprehensive portfolio analysis and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </Select>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/applications' })}>
            View Applications
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {portfolioMetrics.totalPortfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {portfolioMetrics.activeLoans} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.repaymentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {portfolioMetrics.defaultRate.toFixed(1)}% default rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Disbursements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {portfolioMetrics.monthlyDisbursements.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Collections</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {portfolioMetrics.monthlyCollections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Trends</span>
              <Select
                value={selectedMetric}
                onValueChange={setSelectedMetric}
              >
                <option value="disbursements">Disbursements</option>
                <option value="collections">Collections</option>
                <option value="applications">Applications</option>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getMetricColor(selectedMetric)}`}></div>
                    <span className="text-sm font-medium">{item.month}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      ETB {item[selectedMetric as keyof typeof item].toLocaleString()}
                    </span>
                    {getMetricIcon(selectedMetric)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Risk Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
                <Badge variant="outline">{riskDistribution.low}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <Badge variant="outline">{riskDistribution.medium}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <Badge variant="outline">{riskDistribution.high}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Application Status Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Pending</p>
                  <p className="text-sm text-yellow-600">{statusDistribution.pending} applications</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">{statusDistribution.pending}</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Approved</p>
                  <p className="text-sm text-green-600">{statusDistribution.approved} applications</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">{statusDistribution.approved}</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Rejected</p>
                  <p className="text-sm text-red-600">{statusDistribution.rejected} applications</p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-800">{statusDistribution.rejected}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent High-Value Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent High-Value Applications</span>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/applications' })}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications
              .filter(app => app.amount > 50000)
              .slice(0, 5)
              .map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">#{application.application_id}</span>
                      <Badge variant="outline">{application.status}</Badge>
                      {application.riskScore && (
                        <Badge variant="outline">Risk: {application.riskScore}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {application.farmer?.full_name} • ETB {application.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id } })}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
