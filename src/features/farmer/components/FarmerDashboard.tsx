import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { LoanSummary, EmptyLoanSummary, PaymentHistory } from '@/components/shared';
import type { PaymentData, LoanSummaryData } from '@/components/shared';
import { 
  TrendingUp, 
  AlertCircle, 
  Smartphone,
  FileText,
  CreditCard,
  Info,
  Calendar
} from 'lucide-react';

interface DashboardData {
  activeLoan?: LoanSummaryData;
  creditScore: number;
  recentPayments: PaymentData[];
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    urgent: boolean;
  }>;
}

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await farmerAPI.getDashboardData(user.id);
        setDashboardData({
          ...data,
          recentPayments: data.recentPayments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            date: payment.payment_date,
            status: payment.status
          }))
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data
        setDashboardData({
          activeLoan: {
            id: 'L002',
            application_id: '100002',
            amount: 25000,
            remaining: 15000,
            nextPayment: 5000,
            dueDate: '2024-04-15',
            status: 'active'
          },
          creditScore: 750,
          recentPayments: [
            { id: 'P001', amount: 5000, date: '2024-03-01', status: 'completed' },
            { id: 'P002', amount: 5000, date: '2024-02-01', status: 'completed' }
          ],
          notifications: [
            { id: 'N001', type: 'payment', message: 'Payment due in 5 days', urgent: true },
            { id: 'N002', type: 'info', message: 'New loan products available', urgent: false }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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



  return (
    <div className="space-y-6">

 {/* Quick Access */}
 <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/farmer/apply-loan">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full">
                <FileText className="w-5 h-5" />
                <span className="text-xs">Apply for Loan</span>
              </Button>
            </a>
            
            <a href="/farmer/check-eligibility">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Check Eligibility</span>
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
            
      {/* Loan Status */}
      {dashboardData.activeLoan ? (
        <LoanSummary loan={dashboardData.activeLoan} />
      ) : (
        <EmptyLoanSummary onApplyLoan={() => window.location.href = '/farmer/apply-loan'} />
      )}

      {/* Credit Score & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Credit Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-purple-600">
                {dashboardData.creditScore}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.creditScore >= 700 ? 'Excellent' : 
                 dashboardData.creditScore >= 600 ? 'Good' : 'Fair'} Credit Rating
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(dashboardData.creditScore / 900) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Higher scores increase your loan eligibility and reduce interest rates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>Farming Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Seasonal Advisory</h4>
              <p className="text-sm text-blue-700">
                Consider planting drought-resistant crops this season due to expected low rainfall.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-1">Market Price</h4>
              <p className="text-sm text-green-700">
                Current maize price: ETB 2,500 per quintal. Good time to plan harvest.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1">Financial Tip</h4>
              <p className="text-sm text-yellow-700">
                Save 10% of your harvest income for next season's inputs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentHistory 
          payments={dashboardData.recentPayments}
          title="Recent Payments"
          maxItems={3}
          showMethod={false}
        />

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.notifications.map((notification: any) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  notification.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    notification.urgent ? 'text-red-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className={`text-sm ${
                      notification.urgent ? 'text-red-800' : 'text-gray-800'
                    }`}>
                      {notification.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
