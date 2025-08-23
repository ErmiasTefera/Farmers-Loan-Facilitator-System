import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/core/store/authStore';
import { useImpersonation } from '@/core/hooks/useImpersonation';
import { dataCollectorAPI, type DataCollectorDashboard as DashboardData } from '../data-collector.api';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Plus,
  Calendar,
  MapPin,
  Phone,
  Eye
} from 'lucide-react';

const DataCollectorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { getEffectiveUser } = useImpersonation();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataCollectorId, setDataCollectorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataCollectorId = async () => {
      const effectiveUser = getEffectiveUser();
      if (!effectiveUser?.id) return;
      
      try {
        // If impersonating, use the impersonated entity ID directly
        if (effectiveUser.entity_id) {
          setDataCollectorId(effectiveUser.entity_id);
        } else {
          // Otherwise, fetch the profile for the current user
          const profile = await dataCollectorAPI.getDataCollectorProfile(effectiveUser.id);
          if (profile) {
            setDataCollectorId(profile.id);
          }
        }
      } catch (error) {
        console.error('Error fetching data collector profile:', error);
      }
    };

    fetchDataCollectorId();
  }, [user?.id, getEffectiveUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!dataCollectorId) return;
      
      try {
        setLoading(true);
        // The API will automatically use the effective data collector ID
        const data = await dataCollectorAPI.getDashboardData(dataCollectorId);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (dataCollectorId) {
      fetchDashboardData();
    }
  }, [dataCollectorId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">{t('dataCollector.dashboard.noData')}</p>
        </div>
      </div>
    );
  }

  const verificationRate = dashboardData.total_assigned_farmers > 0 
    ? (dashboardData.verified_farmers / dashboardData.total_assigned_farmers) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dataCollector.dashboard.welcome')}, {user?.full_name || 'Data Collector'}!
        </h1>
        <p className="text-gray-600">
          {t('dataCollector.dashboard.subtitle')}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataCollector.dashboard.totalFarmers')}
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_assigned_farmers}</div>
            <p className="text-xs text-blue-100">
              {t('dataCollector.dashboard.assignedFarmers')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataCollector.dashboard.pendingVerifications')}
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pending_verifications}</div>
            <p className="text-xs text-yellow-100">
              {t('dataCollector.dashboard.awaitingReview')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataCollector.dashboard.verifiedFarmers')}
            </CardTitle>
            <UserCheck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.verified_farmers}</div>
            <p className="text-xs text-green-100">
              {t('dataCollector.dashboard.verified')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dataCollector.dashboard.rejectedFarmers')}
            </CardTitle>
            <UserX className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.rejected_farmers}</div>
            <p className="text-xs text-red-100">
              {t('dataCollector.dashboard.rejected')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>{t('dataCollector.dashboard.verificationRate')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {t('dataCollector.dashboard.verificationProgress')}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {verificationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={verificationRate} className="h-2" />
            <p className="text-xs text-gray-500">
              {dashboardData.verified_farmers} {t('dataCollector.dashboard.of')} {dashboardData.total_assigned_farmers} {t('dataCollector.dashboard.farmersVerified')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>{t('dataCollector.dashboard.recentRegistrations')}</span>
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center space-x-2"
              onClick={() => window.location.href = '/data-collector/register-farmer'}
            >
              <Plus className="w-4 h-4" />
              <span>{t('dataCollector.dashboard.registerNew')}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dashboardData.recent_registrations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('dataCollector.dashboard.noRecentRegistrations')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recent_registrations.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {farmer.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{farmer.full_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{farmer.phone_number}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{farmer.region}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        farmer.verification_status === 'verified' ? 'default' :
                        farmer.verification_status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {t(`dataCollector.dashboard.status.${farmer.verification_status}`)}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => window.location.href = `/data-collector/farmers/${farmer.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Registrations Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>{t('dataCollector.dashboard.monthlyRegistrations')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {dashboardData.monthly_registrations.map((item, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="bg-purple-500 rounded-t w-8 transition-all duration-300 hover:bg-purple-600"
                  style={{ height: `${(item.count / 25) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600">{item.month}</span>
                <span className="text-xs font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectorDashboard;
