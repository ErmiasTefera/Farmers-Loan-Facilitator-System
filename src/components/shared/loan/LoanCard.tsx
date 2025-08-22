import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoanStatusIcon, LoanStatusBadge, getLoanStatus } from './LoanStatus';
import type { LoanStatus } from './LoanStatus';
import { 
  DollarSign, 
  Calendar,
  FileText
} from 'lucide-react';

export interface LoanCardData {
  id: string;
  application_id: string;
  amount: number;
  purpose: string;
  status: LoanStatus;
  application_date: string;
  notes?: string;
  remaining?: number;
}

interface LoanCardProps {
  loan: LoanCardData;
  onViewDetails?: (loanId: string) => void;
  showViewButton?: boolean;
  className?: string;
}

export const LoanCard: React.FC<LoanCardProps> = ({ 
  loan, 
  onViewDetails,
  showViewButton = true,
  className = ""
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const actualStatus = getLoanStatus(loan);

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <LoanStatusIcon status={actualStatus} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Loan #{loan.application_id}
                </h3>
                <LoanStatusBadge status={actualStatus} />
              </div>
              
              <p className="text-gray-600 mb-2">{loan.purpose}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>ETB {loan.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Applied: {formatDate(loan.application_date)}</span>
                </div>
              </div>
              
              {loan.remaining !== undefined && loan.remaining > 0 && (
                <div className="flex items-center space-x-1 text-sm text-blue-600 mt-1">
                  <FileText className="w-4 h-4" />
                  <span>Remaining: ETB {loan.remaining.toLocaleString()}</span>
                </div>
              )}
              
              {loan.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{loan.notes}</p>
                </div>
              )}
            </div>
          </div>

          {showViewButton && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(loan.id)}
                className="ml-4"
              >
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
