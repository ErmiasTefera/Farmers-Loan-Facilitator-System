import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoanStatusBadge } from './LoanStatus';
import { 
  DollarSign, 
  Calendar, 
  FileText,
  TrendingUp
} from 'lucide-react';

export interface LoanSummaryData {
  id: string;
  application_id: string;
  amount: number;
  remaining: number;
  nextPayment?: number;
  dueDate?: string;
  status: string;
  purpose?: string;
}

interface LoanSummaryProps {
  loan: LoanSummaryData;
  showApplicationId?: boolean;
  showProgress?: boolean;
  showNextPayment?: boolean;
  className?: string;
}

export const LoanSummary: React.FC<LoanSummaryProps> = ({ 
  loan,
  showApplicationId = true,
  showProgress = true,
  showNextPayment = true,
  className = ""
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progressPercentage = loan.amount > 0 
    ? Math.round(((loan.amount - loan.remaining) / loan.amount) * 100)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span>Active Loan</span>
          <LoanStatusBadge status={loan.status as any} className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showApplicationId && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Application ID:</span>
                <span className="font-mono font-semibold text-gray-900">#{loan.application_id}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {loan.status}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ETB {loan.amount?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Loan</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ETB {loan.remaining?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          
          {showNextPayment && loan.nextPayment && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ETB {loan.nextPayment.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Next Payment</div>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Repayment Progress</span>
              <span className="font-medium">{progressPercentage}% paid</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}

        {loan.dueDate && (
          <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Next payment due:</span>
            </div>
            <span className="font-medium text-orange-700">{formatDate(loan.dueDate)}</span>
          </div>
        )}

        {loan.purpose && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Purpose:</span> {loan.purpose}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Empty state component when no active loan
interface EmptyLoanSummaryProps {
  onApplyLoan?: () => void;
  className?: string;
}

export const EmptyLoanSummary: React.FC<EmptyLoanSummaryProps> = ({ 
  onApplyLoan,
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <span>Active Loan</span>
          <Badge variant="outline" className="ml-auto">
            No active loan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Loans</h3>
        <p className="text-gray-600 mb-4">No active loans</p>
        {onApplyLoan && (
          <button 
            onClick={onApplyLoan}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Apply for Loan
          </button>
        )}
      </CardContent>
    </Card>
  );
};
