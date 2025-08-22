import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { 
  DollarSign, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Receipt
} from 'lucide-react';

interface LoanDetailsProps {
  loanId: string;
}

interface Loan {
  id: string;
  application_id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  application_date: string;
  notes?: string;
  approved_date?: string;
  rejected_date?: string;
  approved_by?: string;
  rejection_reason?: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({ loanId }) => {
  const { user } = useAuthStore();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'documents' | 'timeline'>('overview');

  useEffect(() => {
    const loadLoanDetails = async () => {
      if (!user?.id || !loanId) return;

      try {
        setLoading(true);
        const [loanData, paymentsData] = await Promise.all([
          farmerAPI.getLoanApplicationById(loanId),
          farmerAPI.getPaymentsByFarmer(user.id)
        ]);

        setLoan(loanData);
        // Filter payments for this specific loan (in real app, payments would have loan_id)
        setPayments(paymentsData.slice(0, 3).map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.payment_date,
          status: payment.status,
          method: payment.payment_method || 'Unknown'
        }))); // Show last 3 payments for demo
      } catch (error) {
        console.error('Error loading loan details:', error);
        // Fallback to mock data
        setLoan({
          id: loanId,
          application_id: '100001',
          amount: 25000,
          purpose: 'Seeds and Fertilizer for Maize Farming',
          status: 'approved',
          application_date: '2024-03-15T00:00:00Z',
          approved_date: '2024-03-20T00:00:00Z',
          approved_by: 'Loan Officer John Doe',
          notes: 'Approved for maize farming season. Farmer has good credit history.'
        });

        setPayments([
          {
            id: 'P001',
            amount: 5000,
            date: '2024-04-15T00:00:00Z',
            status: 'completed',
            method: 'USSD'
          },
          {
            id: 'P002',
            amount: 5000,
            date: '2024-05-15T00:00:00Z',
            status: 'completed',
            method: 'Mobile Money'
          },
          {
            id: 'P003',
            amount: 5000,
            date: '2024-06-15T00:00:00Z',
            status: 'pending',
            method: 'Bank Transfer'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLoanDetails();
  }, [user?.id, loanId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimelineSteps = () => {
    if (!loan) return [];

    const steps = [
      {
        title: 'Application Submitted',
        date: loan.application_date,
        status: 'completed',
        description: 'Loan application was submitted successfully'
      }
    ];

    if (loan.status === 'approved' && loan.approved_date) {
      steps.push({
        title: 'Application Approved',
        date: loan.approved_date,
        status: 'completed',
        description: `Approved by ${loan.approved_by || 'Loan Officer'}`
      });
    } else if (loan.status === 'rejected' && loan.rejected_date) {
      steps.push({
        title: 'Application Rejected',
        date: loan.rejected_date,
        status: 'failed',
        description: loan.rejection_reason || 'Application was rejected'
      });
    } else if (loan.status === 'pending') {
      steps.push({
        title: 'Under Review',
        date: '2024-03-20',
        status: 'pending',
        description: 'Application is being reviewed by loan officer'
      });
    }

    return steps;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading loan details...</span>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loan not found</h3>
        <p className="text-gray-600 mb-4">The requested loan could not be found.</p>
        <a href="/farmer/loans" className="text-green-600 hover:text-green-700 font-medium">
          ← Back to Loans
        </a>
      </div>
    );
  }

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = loan.amount - totalPaid;
  const paymentProgress = (totalPaid / loan.amount) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Loan Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(loan.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Loan #{loan.application_id}
                  </h1>
                  {getStatusBadge(loan.status)}
                </div>
                
                <p className="text-lg text-gray-600 mb-4">{loan.purpose}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Loan Amount</p>
                      <p className="font-semibold">ETB {loan.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Application Date</p>
                      <p className="font-semibold">{formatDate(loan.application_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Applicant</p>
                      <p className="font-semibold">{user?.full_name || 'Farmer'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'documents', label: 'Documents', icon: Download },
            { id: 'timeline', label: 'Timeline', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold">ETB {loan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">ETB {totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-lg font-semibold text-orange-600">ETB {remainingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-semibold">{paymentProgress.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Progress</span>
                    <span>{paymentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                </div>

                {loan.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{loan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">+251 911 123 456</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">support@farmersloan.et</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Office</p>
                    <p className="font-medium">Adama, Oromia Region</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                    <p className="text-gray-600 mb-4">Payment history will appear here once payments are made.</p>
                    <Button>Make Payment</Button>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Receipt className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">Payment #{payment.id}</h4>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {payment.method} • {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">ETB {payment.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Loan Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Loan Agreement', type: 'PDF', size: '2.3 MB', date: '2024-03-20' },
                  { name: 'Terms and Conditions', type: 'PDF', size: '1.1 MB', date: '2024-03-20' },
                  { name: 'Payment Schedule', type: 'PDF', size: '0.8 MB', date: '2024-03-20' },
                  { name: 'Application Form', type: 'PDF', size: '1.5 MB', date: '2024-03-15' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.type} • {doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getTimelineSteps().map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100' :
                        step.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : step.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      {step.date && (
                        <p className="text-sm text-gray-600">{formatDate(step.date)}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center space-y-1">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Make Payment</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <Download className="w-6 h-6" />
              <span className="text-sm">Download Documents</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <Phone className="w-6 h-6" />
              <span className="text-sm">Contact Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
