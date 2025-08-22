import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoanList } from '@/features/farmer/components/LoanList';

export const LoanListPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('farmer.loans.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          View and manage all your loan applications and their current status.
        </p>
        
        <LoanList />
      </div>
    </div>
  );
};
