import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { TopNavigation } from '@/core/components/TopNavigation';

const FarmerLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <TopNavigation 
        title="Farmer Portal"
        titleKey="farmer.layout.title"
        userRole="farmer"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Navigation Links */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>{t('farmer.layout.quickNavigation')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="/farmer/dashboard" 
                  className="block p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <h3 className="font-medium text-purple-800 mb-1">{t('farmer.layout.dashboard')}</h3>
                  <p className="text-sm text-purple-700">{t('farmer.layout.dashboardDescription')}</p>
                </a>
                
                <a 
                  href="/farmer/loans" 
                  className="block p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-medium text-blue-800 mb-1">{t('farmer.layout.myLoans')}</h3>
                  <p className="text-sm text-blue-700">{t('farmer.layout.myLoansDescription')}</p>
                </a>
                
                <a 
                  href="/farmer/ussd" 
                  className="block p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <h3 className="font-medium text-green-800 mb-1">{t('farmer.layout.ussdSimulator')}</h3>
                  <p className="text-sm text-green-700">{t('farmer.layout.ussdSimulatorDescription')}</p>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerLayout;
