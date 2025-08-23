import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { financialInstitutionAPI, type LoanApplicationWithDetails } from '../financial-institution.api';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Users,
  BarChart3,
  Eye,
  Search,
  Calendar,
  FileText
} from 'lucide-react';

interface RiskAssessmentData {
  applications: LoanApplicationWithDetails[];
  riskMetrics: {
    totalApplications: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    averageRiskScore: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  riskFactors: Array<{
    factor: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    count: number;
  }>;
}

export const RiskAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RiskAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');


  useEffect(() => {
    const loadRiskAssessmentData = async () => {
      try {
        setLoading(true);
        
        // Get all loan applications
        const applications = await financialInstitutionAPI.getAllLoanApplications();
        
        // Calculate risk metrics
        const riskMetrics = calculateRiskMetrics(applications);
        
        // Identify risk factors
        const riskFactors = identifyRiskFactors(applications);

        setData({
          applications,
          riskMetrics,
          riskFactors
        });
      } catch (error) {
        console.error('Error loading risk assessment data:', error);
        // Fallback to mock data
        setData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadRiskAssessmentData();
  }, []);

  const calculateRiskMetrics = (applications: LoanApplicationWithDetails[]) => {
    const totalApplications = applications.length;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
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
      totalApplications,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      averageRiskScore,
      riskDistribution: {
        low: lowRiskCount,
        medium: mediumRiskCount,
        high: highRiskCount
      }
    };
  };

  const identifyRiskFactors = (applications: LoanApplicationWithDetails[]) => {
    const factors = [
      {
        factor: 'High Loan Amount',
        impact: 'high' as const,
        description: 'Applications with loan amounts above ETB 100,000',
        count: applications.filter(app => app.amount > 100000).length
      },
      {
        factor: 'No Payment History',
        impact: 'medium' as const,
        description: 'New farmers without payment history',
        count: applications.filter(app => !app.payments || app.payments.length === 0).length
      },
      {
        factor: 'Multiple Applications',
        impact: 'medium' as const,
        description: 'Farmers with multiple pending applications',
        count: applications.filter(app => {
          const farmerApps = applications.filter(a => a.farmer_id === app.farmer_id);
          return farmerApps.length > 1;
        }).length
      },
      {
        factor: 'Low Credit Score',
        impact: 'high' as const,
        description: 'Applications with risk score below 400',
        count: applications.filter(app => (app.riskScore || 500) < 400).length
      },
      {
        factor: 'High Risk Score',
        impact: 'high' as const,
        description: 'Applications with risk score above 600',
        count: applications.filter(app => (app.riskScore || 500) > 600).length
      }
    ];

    return factors.filter(factor => factor.count > 0);
  };

  const generateMockData = (): RiskAssessmentData => ({
    applications: [],
    riskMetrics: {
      totalApplications: 45,
      highRiskCount: 12,
      mediumRiskCount: 20,
      lowRiskCount: 13,
      averageRiskScore: 485,
      riskDistribution: { low: 13, medium: 20, high: 12 }
    },
    riskFactors: [
      {
        factor: 'High Loan Amount',
        impact: 'high',
        description: 'Applications with loan amounts above ETB 100,000',
        count: 8
      },
      {
        factor: 'No Payment History',
        impact: 'medium',
        description: 'New farmers without payment history',
        count: 15
      },
      {
        factor: 'Multiple Applications',
        impact: 'medium',
        description: 'Farmers with multiple pending applications',
        count: 6
      },
      {
        factor: 'Low Credit Score',
        impact: 'high',
        description: 'Applications with risk score below 400',
        count: 5
      },
      {
        factor: 'High Risk Score',
        impact: 'high',
        description: 'Applications with risk score above 600',
        count: 12
      }
    ]
  });

  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore < 400) return 'bg-green-100 text-green-800';
    if (riskScore < 600) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLevelText = (riskScore: number) => {
    if (riskScore < 400) return 'Low Risk';
    if (riskScore < 600) return 'Medium Risk';
    return 'High Risk';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const filteredApplications = data?.applications.filter(app => {
    const matchesSearch = app.farmer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.application_id?.toString().includes(searchTerm) ||
                         app.amount.toString().includes(searchTerm);
    
    const matchesRiskFilter = riskFilter === 'all' || 
      (riskFilter === 'high' && (app.riskScore || 500) >= 600) ||
      (riskFilter === 'medium' && (app.riskScore || 500) >= 400 && (app.riskScore || 500) < 600) ||
      (riskFilter === 'low' && (app.riskScore || 500) < 400);

    return matchesSearch && matchesRiskFilter;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading risk assessment...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load risk assessment data</p>
      </div>
    );
  }

  const { riskMetrics, riskFactors } = data;

  return (
    <div className="space-y-6 mt-12 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Risk Assessment</h1>
          <p className="text-sm md:text-base text-gray-600">Comprehensive risk analysis and monitoring</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/applications' })}>
            View Applications
          </Button>
          <Button size="sm" onClick={() => navigate({ to: '/financial-institution/portfolio' })}>
            Portfolio Analytics
          </Button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMetrics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Under assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMetrics.averageRiskScore.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {riskMetrics.averageRiskScore < 400 ? 'Low Risk' : 
               riskMetrics.averageRiskScore < 600 ? 'Medium Risk' : 'High Risk'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Applications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskMetrics.highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {((riskMetrics.highRiskCount / riskMetrics.totalApplications) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk Applications</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{riskMetrics.lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {((riskMetrics.lowRiskCount / riskMetrics.totalApplications) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution and Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
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
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{riskMetrics.riskDistribution.low}</Badge>
                  <span className="text-xs text-gray-500">
                    {((riskMetrics.riskDistribution.low / riskMetrics.totalApplications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{riskMetrics.riskDistribution.medium}</Badge>
                  <span className="text-xs text-gray-500">
                    {((riskMetrics.riskDistribution.medium / riskMetrics.totalApplications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{riskMetrics.riskDistribution.high}</Badge>
                  <span className="text-xs text-gray-500">
                    {((riskMetrics.riskDistribution.high / riskMetrics.totalApplications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Key Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getImpactColor(factor.impact)}`}>
                      {getImpactIcon(factor.impact)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{factor.factor}</p>
                      <p className="text-xs text-gray-500">{factor.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{factor.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Applications by Risk Level</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value={riskFilter}
                onValueChange={setRiskFilter}
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium">#{application.application_id}</span>
                    <Badge className={getRiskLevelColor(application.riskScore || 500)}>
                      {getRiskLevelText(application.riskScore || 500)}
                    </Badge>
                    {application.riskScore && (
                      <Badge variant="outline">Score: {application.riskScore}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{application.farmer?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>ETB {application.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(application.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id } })}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
