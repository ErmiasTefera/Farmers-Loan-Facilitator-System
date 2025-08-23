import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard
} from 'lucide-react';

export interface PaymentData {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method?: string;
  reference?: string;
}

interface PaymentHistoryProps {
  payments: PaymentData[];
  title?: string;
  maxItems?: number;
  showMethod?: boolean;
  showReference?: boolean;
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
  payments,
  title,
  maxItems = 5,
  showMethod = true,
  showReference = false,
  className = ""
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('common.payment_history');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusIcon = (status: PaymentData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusBadge = (status: PaymentData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t('common.paymentStatus.completed')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('common.paymentStatus.pending')}</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">{t('common.paymentStatus.failed')}</Badge>;
      default:
        return <Badge variant="secondary">{t('common.paymentStatus.unknown')}</Badge>;
    }
  };

  const displayPayments = payments.slice(0, maxItems);

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <span>{displayTitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('common.noPaymentHistory')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <span>{displayTitle}</span>
          <Badge variant="outline" className="ml-auto">
            {payments.length} {payments.length !== 1 ? t('common.payments') : t('common.payment')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayPayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getPaymentStatusIcon(payment.status)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    ETB {payment.amount.toLocaleString()}
                  </span>
                  {getPaymentStatusBadge(payment.status)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(payment.date)}</span>
                  </div>
                  {showMethod && payment.method && (
                    <span>via {payment.method}</span>
                  )}
                  {showReference && payment.reference && (
                    <span className="font-mono">#{payment.reference}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {payments.length > maxItems && (
          <div className="text-center pt-2">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all {payments.length} payments
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simplified payment row component for compact displays
interface PaymentRowProps {
  payment: PaymentData;
  showMethod?: boolean;
  showReference?: boolean;
  className?: string;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({ 
  payment,
  showMethod = false,
  showReference = false,
  className = ""
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusIcon = (status: PaymentData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <div className="flex items-center space-x-3">
        {getPaymentStatusIcon(payment.status)}
        <div>
          <div className="font-medium text-gray-900">
            ETB {payment.amount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(payment.date)}
            {showMethod && payment.method && ` • ${payment.method}`}
            {showReference && payment.reference && ` • #${payment.reference}`}
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 capitalize">
        {payment.status}
      </div>
    </div>
  );
};
