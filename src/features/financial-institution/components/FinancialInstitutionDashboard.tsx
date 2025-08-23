import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

import { financialInstitutionAPI, type PortfolioMetrics, type LoanApplicationWithDetails } from '../financial-institution.api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface DashboardData {
  portfolioMetrics: PortfolioMetrics;
  recentApplications: LoanApplicationWithDetails[];
  pendingDecisions: LoanApplicationWithDetails[];
  alerts: Array<{
    id: string;
    type: 'overdue' | 'high_risk' | 'large_loan';
    message: string;
    urgent: boolean;
  }>;
}

export const FinancialInstitutionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await financialInstitutionAPI.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data
        setDashboardData({
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
          recentApplications: [],
          pendingDecisions: [],
          alerts: [
            {
              id: 'overdue_1',
              type: 'overdue',
              message: '5 loans have overdue payments',
              urgent: true
            },
            {
              id: 'high_risk_1',
              type: 'high_risk',
              message: '3 high-risk applications pending review',
              urgent: true
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load dashboard data</p>
      </div>
    );
  }

  const { portfolioMetrics, recentApplications, pendingDecisions, alerts } = dashboardData;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <Clock className="w-4 h-4 text-red-500" />;
      case 'high_risk':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'large_loan':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high_risk':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'large_loan':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return <Badge className="bg-green-100 text-green-800">Approve</Badge>;
      case 'reject':
        return <Badge className="bg-red-100 text-red-800">Reject</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>;
      default:
        return <Badge variant="outline">{recommendation}</Badge>;
    }
  };

  return (
    <div className="space-y-6 mt-12 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Loan Officer Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Portfolio overview and loan management</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => navigate({ to: '/financial-institution/applications' })}>
            View All Applications
          </Button>
          <Button size="sm" className="text-xs sm:text-sm" onClick={() => navigate({ to: '/financial-institution/portfolio' })}>
            Portfolio Analytics
          </Button>
        </div>
      </div>

      {/* Quick Actions - Moved to top */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <Button 
              variant="outline" 
              className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate({ to: '/financial-institution/applications' })}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Review Applications</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate({ to: '/financial-institution/portfolio' })}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-xs">Portfolio Analytics</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate({ to: '/financial-institution/risk-assessment' })}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs">Risk Assessment</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1"
              onClick={() => navigate({ to: '/financial-institution/reports' })}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Generate Reports</span>
            </Button>
            

          </div>
        </CardContent>
      </Card>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Alerts & Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  {alert.urgent && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Applications</span>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/applications' })}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{application.application_id}</span>
                        {getStatusBadge(application.status)}
                        {application.recommendation && getRecommendationBadge(application.recommendation)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {application.farmer?.full_name} • ETB {application.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id } })}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent applications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Decisions</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingDecisions.length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDecisions.length > 0 ? (
              <div className="space-y-4">
                {pendingDecisions.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{application.application_id}</span>
                        {application.recommendation && getRecommendationBadge(application.recommendation)}
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
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id }, search: { action: 'approve' } })}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id }, search: { action: 'reject' } })}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending decisions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
