import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { FileText, BarChart3, Users, UserPlus, ClipboardCheck } from 'lucide-react';
import { TopNavigation } from '@/core/components/TopNavigation';
import { OfflineStatusIndicator } from '@/core/components/OfflineStatusIndicator';

const DataCollectorLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <TopNavigation 
        title="Data Collection Hub"
        titleKey="dataCollector.layout.title"
        userRole="data-collector"
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
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{t('dataCollector.layout.quickNavigation')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Offline Status Indicator */}
                <div className="mb-4">
                  <OfflineStatusIndicator variant="detailed" />
                </div>
                {/* Desktop Layout - Full cards with descriptions */}
                <div className="hidden lg:block space-y-3">
                  <a 
                    href="/data-collector/dashboard" 
                    className="block p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <h3 className="font-medium text-blue-800 mb-1">{t('dataCollector.layout.dashboard')}</h3>
                    <p className="text-sm text-blue-700">{t('dataCollector.layout.dashboardDescription')}</p>
                  </a>
                  
                  <a 
                    href="/data-collector/farmers" 
                    className="block p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <h3 className="font-medium text-indigo-800 mb-1">{t('dataCollector.layout.myFarmers')}</h3>
                    <p className="text-sm text-indigo-700">{t('dataCollector.layout.myFarmersDescription')}</p>
                  </a>
                  
                  <a 
                    href="/data-collector/register-farmer" 
                    className="block p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <h3 className="font-medium text-green-800 mb-1">{t('dataCollector.layout.registerFarmer')}</h3>
                    <p className="text-sm text-green-700">{t('dataCollector.layout.registerFarmerDescription')}</p>
                  </a>

                  <a 
                    href="/data-collector/verifications" 
                    className="block p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <h3 className="font-medium text-purple-800 mb-1">{t('dataCollector.layout.verifications')}</h3>
                    <p className="text-sm text-purple-700">{t('dataCollector.layout.verificationsDescription')}</p>
                  </a>
                </div>

                {/* Mobile Layout - Compact buttons with icons */}
                <div className="grid grid-cols-2 gap-3 lg:hidden">
                  <a href="/data-collector/dashboard">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full bg-blue-50 border-blue-200 hover:bg-blue-100">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-800 font-medium">{t('dataCollector.layout.dashboard')}</span>
                    </Button>
                  </a>
                  
                  <a href="/data-collector/farmers">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full bg-indigo-50 border-indigo-200 hover:bg-indigo-100">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs text-indigo-800 font-medium">{t('dataCollector.layout.myFarmers')}</span>
                    </Button>
                  </a>
                  
                  <a href="/data-collector/register-farmer">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full bg-green-50 border-green-200 hover:bg-green-100">
                      <UserPlus className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-800 font-medium">{t('dataCollector.layout.registerFarmer')}</span>
                    </Button>
                  </a>

                  <a href="/data-collector/verifications">
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 w-full bg-purple-50 border-purple-200 hover:bg-purple-100">
                      <ClipboardCheck className="w-5 h-5 text-purple-600" />
                      <span className="text-xs text-purple-800 font-medium">{t('dataCollector.layout.verifications')}</span>
                    </Button>
                  </a>
                </div>
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

export default DataCollectorLayout;
