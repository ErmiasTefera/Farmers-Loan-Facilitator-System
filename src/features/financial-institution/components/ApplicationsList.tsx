import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';

import { financialInstitutionAPI, type LoanApplicationWithDetails } from '../financial-institution.api';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  User,
  Shield,
  FileText
} from 'lucide-react';

export const ApplicationsList: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await financialInstitutionAPI.getAllLoanApplications();
        setApplications(data);
        setFilteredApplications(data);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  useEffect(() => {
    // Apply search filter only
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.farmer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const aValue = new Date(a.created_at).getTime();
      const bValue = new Date(b.created_at).getTime();
      return bValue - aValue; // Descending order
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm]);

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

  const getRiskBadge = (riskScore: number) => {
    if (riskScore < 400) {
      return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
    } else if (riskScore < 600) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
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



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-12 md:mt-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
          <p className="text-gray-600">
            {filteredApplications.length} of {applications.length} applications
          </p>
        </div>
                 <Button onClick={() => navigate({ to: '/financial-institution/dashboard' })}>
           Back to Dashboard
         </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span className="text-sm md:text-base">Search Applications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by application ID, farmer name, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>
        </CardContent>
      </Card>

            {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ETB {applications
                  .filter(app => app.status === 'approved')
                  .reduce((sum, app) => sum + app.amount, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Header with Application ID and Date */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application #{application.application_id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(application.status)}
                    {application.riskScore && getRiskBadge(application.riskScore)}
                    {application.recommendation && getRecommendationBadge(application.recommendation)}
                  </div>
                </div>

                {/* Application Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Farmer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Farmer</span>
                    </div>
                    <p className="font-semibold text-gray-900">{application.farmer?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{application.farmer?.phone || 'No phone'}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Purpose</span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{application.purpose.replace('_', ' ')}</p>
                  </div>

                  {/* Loan Amount */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Amount</span>
                    </div>
                    <p className="font-semibold text-gray-900">ETB {application.amount.toLocaleString()}</p>
                  </div>

                  {/* Risk Score */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Risk Score</span>
                    </div>
                    <p className="font-semibold text-gray-900">{application.riskScore || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{application.payments?.length || 0} payments</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id } })}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Review
                    </Button>
                    
                    {application.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                          onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id }, search: { action: 'approve' } })}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => navigate({ to: '/financial-institution/applications/$applicationId', params: { applicationId: application.id }, search: { action: 'reject' } })}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✗</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No applications found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
