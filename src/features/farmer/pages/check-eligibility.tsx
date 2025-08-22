import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckEligibility } from '@/features/farmer/components/CheckEligibility';

export const CheckEligibilityPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <a 
            href="/farmer/dashboard" 
            className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2"
          >
            <span>←</span>
            <span>{t('farmer.layout.backToDashboard')}</span>
          </a>
        </div>

        {/* Main Content */}
        <CheckEligibility />
      </div>
    </div>
  );
};
