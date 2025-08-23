import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { LoanCard } from '@/components/shared';
import type { LoanCardData } from '@/components/shared';
import { 
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  Search,
  TrendingUp
} from 'lucide-react';
import { useImpersonation } from '@/core/hooks/useImpersonation';

// Using LoanCardData from shared components
type Loan = LoanCardData;

export const LoanList: React.FC = () => {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { getEffectiveUser } = useImpersonation();

  useEffect(() => {
    const loadLoans = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const effectiveUser = getEffectiveUser();
        if (!effectiveUser?.id) return;
        const entityId = effectiveUser.entity_id || effectiveUser.id;
        const loanApplications = await farmerAPI.getLoanApplicationsByFarmer(entityId);
        setLoans(loanApplications);
      } catch (error) {
        console.error('Error loading loans:', error);
        // Fallback to mock data
        setLoans([
          {
            id: 'L001',
            application_id: '100001',
            amount: 15000,
            purpose: 'Seeds and Fertilizer',
            status: 'approved',
            application_date: '2024-01-15T00:00:00Z',
            notes: 'Approved for maize farming'
          },
          {
            id: 'L002',
            application_id: '100002',
            amount: 25000,
            purpose: 'Equipment Purchase',
            status: 'pending',
            application_date: '2024-03-20T00:00:00Z',
            notes: 'Pending review'
          },
          {
            id: 'L003',
            application_id: '100003',
            amount: 10000,
            purpose: 'Irrigation System',
            status: 'rejected',
            application_date: '2024-02-10T00:00:00Z',
            notes: 'Insufficient credit score'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [user?.id]);

  const filteredLoans = loans.filter(loan => {
    const matchesFilter = filter === 'all' || loan.status === filter;
    const matchesSearch = loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading loans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search loans by purpose or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Loans</p>
                <p className="text-2xl font-bold">{loans.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loans.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {loans.filter(l => l.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  ETB {loans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'No loans match your current filters.'
                  : 'You haven\'t applied for any loans yet.'
                }
              </p>
              <a href="/farmer/apply-loan">
                <Button>Apply for Loan</Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          filteredLoans.map((loan) => (
            <LoanCard 
              key={loan.id}
              loan={loan}
              onViewDetails={(loanId) => window.location.href = `/farmer/loans/${loanId}`}
              showViewButton={true}
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/farmer/apply-loan">
              <Button className="h-16 flex flex-col items-center justify-center space-y-1 w-full">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Apply for New Loan</span>
              </Button>
            </a>
            
            <a href="/farmer/check-eligibility">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Check Eligibility</span>
              </Button>
            </a>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Make Payment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
