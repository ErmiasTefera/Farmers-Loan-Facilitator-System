import React from 'react';
import { useParams } from '@tanstack/react-router';
import { LoanDetails } from '@/features/farmer/components/LoanDetails';

export const LoanDetailsPage: React.FC = () => {
  const { loanId } = useParams({ from: '/farmer/loans/$loanId' });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Loan Details
            </h2>
            <p className="text-gray-600">
              Comprehensive information about your loan application
            </p>
          </div>
          <a 
            href="/farmer/loans" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Loans
          </a>
        </div>
        
        <LoanDetails loanId={loanId} />
      </div>
    </div>
  );
};
