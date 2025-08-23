import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoanStatusBadge, type LoanStatus } from './LoanStatus';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp
} from 'lucide-react';

export interface LoanSummaryData {
  id: string;
  application_id: string;
  amount: number;
  remaining?: number; // Made optional since we'll calculate it
  nextPayment?: number;
  dueDate?: string;
  status: string;
  purpose?: string;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
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
  showProgress = true,
  showNextPayment = true,
  className = ""
}) => {
  const { t } = useTranslation();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.notAvailable');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate remaining amount from payments
  const calculateRemaining = () => {
    if (loan.remaining !== undefined) {
      return loan.remaining;
    }
    
    if (loan.payments && loan.payments.length > 0) {
      const totalPaid = loan.payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);
      return Math.max(0, loan.amount - totalPaid);
    }
    
    return loan.amount; // If no payments, full amount is remaining
  };

  const remainingAmount = calculateRemaining();
  const progressPercentage = loan.amount > 0 
    ? Math.round(((loan.amount - remainingAmount) / loan.amount) * 100)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span>{t('common.loanStatus.active')}</span>
          <span className="font-mono font-semibold text-gray-900">#{loan.application_id}</span>
          <LoanStatusBadge status={loan.status as LoanStatus} className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ETB {loan.amount?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{t('common.totalLoan')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ETB {remainingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{t('common.remaining')}</div>
          </div>
          
          {showNextPayment && loan.nextPayment && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ETB {loan.nextPayment.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t('common.nextPayment')}</div>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('common.repaymentProgress')}</span>
              <span className="font-medium">{progressPercentage}% {t('common.paid')}</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}

        {loan.dueDate && (
          <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>{t('common.payment_due_date')}:</span>
            </div>
            <span className="font-medium text-orange-700">{formatDate(loan.dueDate)}</span>
          </div>
        )}

        {loan.purpose && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t('common.loan_purpose')}:</span> {loan.purpose}
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
  const { t } = useTranslation();
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <span>{t('common.loanStatus.active')}</span>
          <Badge variant="outline" className="ml-auto">
            {t('common.noData')}
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
