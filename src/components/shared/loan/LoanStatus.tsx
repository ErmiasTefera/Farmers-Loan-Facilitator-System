import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'overdue';

interface LoanStatusIconProps {
  status: LoanStatus;
  className?: string;
}

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export const LoanStatusIcon: React.FC<LoanStatusIconProps> = ({ status, className = "w-5 h-5" }) => {
  switch (status) {
    case 'pending':
      return <Clock className={`text-yellow-500 ${className}`} />;
    case 'approved':
    case 'active':
      return <CheckCircle className={`text-green-500 ${className}`} />;
    case 'rejected':
      return <XCircle className={`text-red-500 ${className}`} />;
    case 'completed':
      return <CheckCircle className={`text-blue-500 ${className}`} />;
    case 'overdue':
      return <AlertCircle className={`text-red-600 ${className}`} />;
    default:
      return <Clock className={`text-gray-500 ${className}`} />;
  }
};

export const LoanStatusBadge: React.FC<LoanStatusBadgeProps> = ({ status, className = "" }) => {
  const getVariantAndText = (status: LoanStatus) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary' as const, text: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'approved':
        return { variant: 'default' as const, text: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'active':
        return { variant: 'default' as const, text: 'Active', className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'rejected':
        return { variant: 'destructive' as const, text: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' };
      case 'completed':
        return { variant: 'outline' as const, text: 'Completed', className: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'overdue':
        return { variant: 'destructive' as const, text: 'Overdue', className: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { variant: 'secondary' as const, text: 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const { variant, text, className: statusClassName } = getVariantAndText(status);
  
  return (
    <Badge variant={variant} className={`${statusClassName} ${className}`}>
      {text}
    </Badge>
  );
};

// Utility function to determine status from loan data
export const getLoanStatus = (loan: any): LoanStatus => {
  if (loan.status === 'approved' && loan.remaining && loan.remaining > 0) {
    return 'active';
  }
  if (loan.status === 'approved' && loan.remaining === 0) {
    return 'completed';
  }
  return loan.status as LoanStatus;
};
