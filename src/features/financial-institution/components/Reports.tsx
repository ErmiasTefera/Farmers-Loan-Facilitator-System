import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { financialInstitutionAPI, type LoanApplicationWithDetails } from '../financial-institution.api';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp,
  DollarSign,
  Users,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ReportData {
  applications: LoanApplicationWithDetails[];
  farmersByRegion: Array<{
    region: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }>;
  loanMetrics: {
    totalLoans: number;
    totalAmount: number;
    averageLoanAmount: number;
    approvalRate: number;
    rejectionRate: number;
    pendingRate: number;
  };
  monthlyTrends: Array<{
    month: string;
    applications: number;
    approvals: number;
    rejections: number;
    totalAmount: number;
  }>;
  riskMetrics: {
    lowRiskCount: number;
    mediumRiskCount: number;
    highRiskCount: number;
    averageRiskScore: number;
  };
}

interface ReportFilter {
  dateRange: string;
  region: string;
  riskLevel: string;
  status: string;
}

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: '30',
    region: 'all',
    riskLevel: 'all',
    status: 'all'
  });

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        
        // Get all loan applications
        const applications = await financialInstitutionAPI.getAllLoanApplications();
        
        // Generate report data
        const reportData = generateReportData(applications);

        setData(reportData);
      } catch (error) {
        console.error('Error loading report data:', error);
        // Fallback to mock data
        setData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const generateReportData = (applications: LoanApplicationWithDetails[]): ReportData => {
    // Farmers by region
    const farmersByRegion = generateFarmersByRegion(applications);
    
    // Loan metrics
    const loanMetrics = calculateLoanMetrics(applications);
    
    // Monthly trends
    const monthlyTrends = generateMonthlyTrends();
    
    // Risk metrics
    const riskMetrics = calculateRiskMetrics(applications);

    return {
      applications,
      farmersByRegion,
      loanMetrics,
      monthlyTrends,
      riskMetrics
    };
  };

  const generateFarmersByRegion = (applications: LoanApplicationWithDetails[]) => {
    const regionMap = new Map<string, { count: number; totalAmount: number; farmers: Set<string> }>();
    
    applications.forEach(app => {
      const region = app.farmer?.region || 'Unknown Region';
      const farmerId = app.farmer_id;
      
      if (!regionMap.has(region)) {
        regionMap.set(region, { count: 0, totalAmount: 0, farmers: new Set() });
      }
      
      const regionData = regionMap.get(region)!;
      regionData.count++;
      regionData.totalAmount += app.amount;
      regionData.farmers.add(farmerId);
    });

    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      count: data.farmers.size,
      totalAmount: data.totalAmount,
      averageAmount: data.totalAmount / data.count
    })).sort((a, b) => b.count - a.count);
  };

  const calculateLoanMetrics = (applications: LoanApplicationWithDetails[]) => {
    const totalLoans = applications.length;
    const totalAmount = applications.reduce((sum, app) => sum + app.amount, 0);
    const averageLoanAmount = totalLoans > 0 ? totalAmount / totalLoans : 0;
    
    const statusCounts = applications.reduce((counts, app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const approvalRate = totalLoans > 0 ? ((statusCounts.approved || 0) / totalLoans) * 100 : 0;
    const rejectionRate = totalLoans > 0 ? ((statusCounts.rejected || 0) / totalLoans) * 100 : 0;
    const pendingRate = totalLoans > 0 ? ((statusCounts.pending || 0) / totalLoans) * 100 : 0;

    return {
      totalLoans,
      totalAmount,
      averageLoanAmount,
      approvalRate,
      rejectionRate,
      pendingRate
    };
  };

  const generateMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      applications: Math.floor(Math.random() * 20) + 5,
      approvals: Math.floor(Math.random() * 15) + 3,
      rejections: Math.floor(Math.random() * 8) + 1,
      totalAmount: Math.floor(Math.random() * 500000) + 100000
    }));
  };

  const calculateRiskMetrics = (applications: LoanApplicationWithDetails[]) => {
    let lowRiskCount = 0;
    let mediumRiskCount = 0;
    let highRiskCount = 0;
    let totalRiskScore = 0;
    let validRiskScores = 0;

    applications.forEach(app => {
      const riskScore = app.riskScore || 500;
      totalRiskScore += riskScore;
      validRiskScores++;

      if (riskScore < 400) {
        lowRiskCount++;
      } else if (riskScore < 600) {
        mediumRiskCount++;
      } else {
        highRiskCount++;
      }
    });

    const averageRiskScore = validRiskScores > 0 ? totalRiskScore / validRiskScores : 500;

    return {
      lowRiskCount,
      mediumRiskCount,
      highRiskCount,
      averageRiskScore
    };
  };

  const generateMockData = (): ReportData => ({
    applications: [],
    farmersByRegion: [
      { region: 'Addis Ababa', count: 45, totalAmount: 2500000, averageAmount: 55555 },
      { region: 'Oromia', count: 38, totalAmount: 1800000, averageAmount: 47368 },
      { region: 'Amhara', count: 32, totalAmount: 1600000, averageAmount: 50000 },
      { region: 'SNNPR', count: 28, totalAmount: 1400000, averageAmount: 50000 },
      { region: 'Tigray', count: 22, totalAmount: 1100000, averageAmount: 50000 }
    ],
    loanMetrics: {
      totalLoans: 165,
      totalAmount: 8400000,
      averageLoanAmount: 50909,
      approvalRate: 65.5,
      rejectionRate: 18.2,
      pendingRate: 16.3
    },
    monthlyTrends: [
      { month: 'Jan', applications: 12, approvals: 8, rejections: 2, totalAmount: 450000 },
      { month: 'Feb', applications: 15, approvals: 10, rejections: 3, totalAmount: 520000 },
      { month: 'Mar', applications: 18, approvals: 12, rejections: 4, totalAmount: 580000 },
      { month: 'Apr', applications: 14, approvals: 9, rejections: 3, totalAmount: 480000 },
      { month: 'May', applications: 20, approvals: 13, rejections: 5, totalAmount: 620000 },
      { month: 'Jun', applications: 16, approvals: 11, rejections: 3, totalAmount: 540000 }
    ],
    riskMetrics: {
      lowRiskCount: 45,
      mediumRiskCount: 78,
      highRiskCount: 42,
      averageRiskScore: 485
    }
  });



  const handleDownloadReport = (reportType: string) => {
    // Mock download functionality
    console.log(`Downloading ${reportType} report...`);
    // In a real implementation, this would generate and download a PDF/Excel file
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load report data</p>
      </div>
    );
  }

  const { farmersByRegion, loanMetrics, monthlyTrends, riskMetrics } = data;

  return (
    <div className="space-y-6 mt-12 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm md:text-base text-gray-600">Comprehensive reporting and data insights</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/portfolio' })}>
            Portfolio Analytics
          </Button>
          <Button size="sm" onClick={() => navigate({ to: '/financial-institution/risk-assessment' })}>
            Risk Assessment
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Report Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant={selectedReport === 'overview' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setSelectedReport('overview')}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Overview</span>
            </Button>
            <Button
              variant={selectedReport === 'farmers' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setSelectedReport('farmers')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Farmers by Region</span>
            </Button>
            <Button
              variant={selectedReport === 'loans' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setSelectedReport('loans')}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Loan Analytics</span>
            </Button>
            <Button
              variant={selectedReport === 'trends' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setSelectedReport('trends')}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Monthly Trends</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Region</label>
              <Select
                value={filters.region}
                onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
              >
                <option value="all">All Regions</option>
                {farmersByRegion.map(region => (
                  <option key={region.region} value={region.region}>{region.region}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Risk Level</label>
              <Select
                value={filters.riskLevel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanMetrics.totalLoans}</div>
                <p className="text-xs text-muted-foreground">
                  ETB {loanMetrics.totalAmount.toLocaleString()} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{loanMetrics.approvalRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {loanMetrics.rejectionRate.toFixed(1)}% rejection rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Loan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {loanMetrics.averageLoanAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Per application
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskMetrics.averageRiskScore.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">
                  {riskMetrics.highRiskCount} high risk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Download Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overview Report</span>
                <Button onClick={() => handleDownloadReport('overview')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive overview of all loan applications, approval rates, and risk metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'farmers' && (
        <div className="space-y-6">
          {/* Farmers by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Farmers by Region</span>
                <Button onClick={() => handleDownloadReport('farmers')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmersByRegion.map((region, index) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{region.region}</h3>
                        <p className="text-sm text-gray-600">
                          {region.count} farmers • ETB {region.averageAmount.toLocaleString()} avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ETB {region.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total amount
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'loans' && (
        <div className="space-y-6">
          {/* Loan Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">{loanMetrics.approvalRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-red-100 text-red-800">{loanMetrics.rejectionRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-100 text-yellow-800">{loanMetrics.pendingRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{riskMetrics.lowRiskCount}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{riskMetrics.mediumRiskCount}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{riskMetrics.highRiskCount}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Loan Analytics Report</span>
                <Button onClick={() => handleDownloadReport('loans')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Detailed analysis of loan performance, approval rates, and risk distribution.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === 'trends' && (
        <div className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly Trends</span>
                <Button onClick={() => handleDownloadReport('trends')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">{trend.month}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{trend.month} 2024</h3>
                        <p className="text-sm text-gray-600">
                          {trend.applications} applications • {trend.approvals} approved • {trend.rejections} rejected
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ETB {trend.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total disbursed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
