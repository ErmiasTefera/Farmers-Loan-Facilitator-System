import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from '@tanstack/react-router';
import { financialInstitutionAPI, type LoanApplicationWithDetails, type RiskAssessment } from '../financial-institution.api';
import { 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Phone,
  CreditCard,
  Shield,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

interface ApplicationReviewProps {
  applicationId: string;
}

export const ApplicationReview: React.FC<ApplicationReviewProps> = ({ applicationId }) => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplicationWithDetails | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        setLoading(true);
        const [appData, riskData] = await Promise.all([
          financialInstitutionAPI.getLoanApplicationById(applicationId),
          financialInstitutionAPI.assessRisk(applicationId)
        ]);
        
        setApplication(appData);
        setRiskAssessment(riskData);
        setDecisionNotes(appData?.notes || '');
      } catch (error) {
        console.error('Error loading application data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      loadApplicationData();
    }
  }, [applicationId]);

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!application) return;

    try {
      setProcessingDecision(true);
      await financialInstitutionAPI.updateLoanApplicationStatus(
        application.id,
        status,
        decisionNotes
      );
      
      // Update local state
      setApplication(prev => prev ? { ...prev, status, notes: decisionNotes } : null);
      
      // Show success dialog
      setDialogTitle('Success');
      setDialogMessage(`Application ${status} successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error updating application status:', error);
      setDialogTitle('Error');
      setDialogMessage('Error updating application status. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setProcessingDecision(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return 'text-green-600 bg-green-50';
      case 'reject':
        return 'text-red-600 bg-red-50';
      case 'review':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading application details...</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Application not found</p>
      </div>
    );
  }

  const farmer = application.farmer;
  const payments = application.payments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mt-12 md:mt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600">Application #{application.application_id}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(application.status)}
          {application.riskScore && (
            <Badge variant="outline">Risk Score: {application.riskScore}</Badge>
          )}
        </div>
      </div>

                {/* Quick Actions */}
                <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col sm:flex-row gap-2">
                             <Button
                 variant="outline"
                 className="justify-start"
                 onClick={() => window.history.back()}
               >
                 <ArrowLeft className="w-4 h-4 mr-2" />
                 Back to Applications
               </Button>
                             <Button
                 variant="outline"
                 className="justify-start"
                 onClick={() => navigate({ to: '/financial-institution/applications' })}
               >
                 <FileText className="w-4 h-4 mr-2" />
                 View All Applications
               </Button>
            </CardContent>
          </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Application Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                  <p className="text-lg font-semibold">ETB {application.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Purpose</label>
                  <p className="text-lg font-semibold capitalize">{application.purpose.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-lg font-semibold">{new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(application.status)}</div>
                </div>
              </div>
              
              {application.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-700 mt-1">{application.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farmer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Farmer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {farmer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold">{farmer.full_name}</p>
                  </div>
                                     <div>
                     <label className="text-sm font-medium text-gray-500">Phone Number</label>
                     <p className="text-lg font-semibold flex items-center">
                       <Phone className="w-4 h-4 mr-2" />
                       {farmer.phone || 'Not available'}
                     </p>
                   </div>
                   <div>
                     <label className="text-sm font-medium text-gray-500">Location</label>
                     <p className="text-lg font-semibold flex items-center">
                       <MapPin className="w-4 h-4 mr-2" />
                       {farmer.village || farmer.district || 'Not specified'}
                     </p>
                   </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credit Score</label>
                    <p className="text-lg font-semibold flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {farmer.credit_score || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <div className="mt-1">
                      <Badge className={
                        farmer.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                        farmer.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {farmer.verification_status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registration Date</label>
                    <p className="text-lg font-semibold">
                      {farmer.created_at ? new Date(farmer.created_at).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Farmer information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Payment History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">ETB {payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No payment history available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Risk Assessment & Decision */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskAssessment ? (
                <>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                      {riskAssessment.riskLevel.toUpperCase()} RISK
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Credit Score</label>
                    <p className="text-2xl font-bold">{riskAssessment.creditScore}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Recommendation</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRecommendationColor(riskAssessment.recommendation)}`}>
                      {riskAssessment.recommendation.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Max Loan Amount</label>
                    <p className="text-lg font-semibold">ETB {riskAssessment.maxLoanAmount.toLocaleString()}</p>
                  </div>

                  {riskAssessment.riskFactors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Risk Factors</label>
                      <ul className="mt-2 space-y-1">
                        {riskAssessment.riskFactors.map((factor, index) => (
                          <li key={index} className="flex items-center text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Suggested Terms</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Amount:</strong> ETB {riskAssessment.suggestedTerms.amount.toLocaleString()}<br />
                        <strong>Term:</strong> {riskAssessment.suggestedTerms.term_months} months<br />
                        <strong>Interest Rate:</strong> {riskAssessment.suggestedTerms.interest_rate}%
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Risk assessment not available</p>
              )}
            </CardContent>
          </Card>

          {/* Decision Panel */}
          {application.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Make Decision</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div>
                   <label className="text-sm font-medium text-gray-500">Decision Notes</label>
                   <textarea
                     value={decisionNotes}
                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDecisionNotes(e.target.value)}
                     placeholder="Add notes about your decision..."
                     className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     rows={4}
                   />
                 </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDecision('approved')}
                    disabled={processingDecision}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDecision('rejected')}
                    disabled={processingDecision}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>

                {processingDecision && (
                  <div className="text-center text-sm text-gray-500">
                    Processing decision...
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>{dialogTitle}</span>
            </DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>{dialogTitle}</span>
            </DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowErrorDialog(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
