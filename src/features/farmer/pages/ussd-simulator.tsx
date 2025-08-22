import React from 'react';
import { useTranslation } from 'react-i18next';
import { USSDSimulator } from '@/features/farmer/components/USSDSimulator';

export const USSDSimulatorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('farmer.ussd.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('farmer.ussd.description')}
        </p>
        
        <USSDSimulator />
      </div>
    </div>
  );
};
