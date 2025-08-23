import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineStore } from '@/core/store/offlineStore';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Database,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

interface OfflineStatusIndicatorProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { t } = useTranslation();
  const {
    isOnline,
    isOfflineMode,
    pendingSyncCount,
    syncInProgress,
    syncErrors,
    lastSyncAttempt,
    toggleOfflineMode,
    checkOnlineStatus,
    syncData,
    clearSyncErrors,
    getOfflineStats
  } = useOfflineStore();

  const [stats, setStats] = useState<{
    totalFarmers: number;
    pendingSync: number;
    syncedFarmers: number;
    failedSync: number;
  } | null>(null);

  // Check online status periodically
  useEffect(() => {
    const checkStatus = () => {
      if (!isOfflineMode) {
        checkOnlineStatus();
      }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [isOfflineMode, checkOnlineStatus]);

  // Load stats when component mounts
  useEffect(() => {
    const loadStats = async () => {
      try {
        const offlineStats = await getOfflineStats();
        setStats(offlineStats);
      } catch (error) {
        console.error('Failed to load offline stats:', error);
      }
    };

    loadStats();
  }, [getOfflineStats]);

  // Handle manual sync
  const handleSync = async () => {
    try {
      const result = await syncData();
      console.log('Sync result:', result);
      
      // Reload stats after sync
      const offlineStats = await getOfflineStats();
      setStats(offlineStats);
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // Determine status icon and color
  const getStatusIcon = () => {
    if (isOfflineMode) {
      return { icon: WifiOff, color: 'text-orange-500', bgColor: 'bg-orange-100' };
    }
    if (!isOnline) {
      return { icon: WifiOff, color: 'text-red-500', bgColor: 'bg-red-100' };
    }
    if (pendingSyncCount > 0) {
      return { icon: RotateCcw, color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    }
    return { icon: Wifi, color: 'text-green-500', bgColor: 'bg-green-100' };
  };

  const statusIcon = getStatusIcon();

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Status Icon */}
        <div className={`p-1.5 rounded-full ${statusIcon.bgColor}`}>
          <statusIcon.icon className={`w-4 h-4 ${statusIcon.color}`} />
        </div>

        {/* Status Text */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {isOfflineMode 
              ? t('common.offline.manualOffline')
              : isOnline 
                ? t('common.offline.online')
                : t('common.offline.offline')
            }
          </span>
          {pendingSyncCount > 0 && (
            <span className="text-xs text-gray-500">
              {t('common.offline.pendingSync', { count: pendingSyncCount })}
            </span>
          )}
        </div>

        {/* Sync Button */}
        {pendingSyncCount > 0 && !syncInProgress && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t('common.offline.sync')}
          </Button>
        )}

        {/* Sync Progress */}
        {syncInProgress && (
          <div className="flex items-center space-x-1 ml-2">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
            <span className="text-xs text-gray-500">
              {t('common.offline.syncing')}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`flex items-center space-x-2 ${className}`}>
          <div className={`p-1 rounded-full ${statusIcon.bgColor}`}>
            <statusIcon.icon className={`w-4 h-4 ${statusIcon.color}`} />
          </div>
          <span className="text-sm">
            {isOfflineMode 
              ? t('common.offline.manualOffline')
              : isOnline 
                ? t('common.offline.online')
                : t('common.offline.offline')
            }
          </span>
          {pendingSyncCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pendingSyncCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 space-y-4">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${statusIcon.bgColor}`}>
                <statusIcon.icon className={`w-5 h-5 ${statusIcon.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isOfflineMode 
                    ? t('common.offline.manualOffline')
                    : isOnline 
                      ? t('common.offline.online')
                      : t('common.offline.offline')
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {t('common.offline.lastChecked', { 
                    time: new Date(lastSyncAttempt).toLocaleTimeString() 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Offline Stats */}
          {stats && (
            <Card>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span>{t('common.offline.totalFarmers')}: {stats.totalFarmers}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{t('common.offline.pendingSync')}: {stats.pendingSync}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{t('common.offline.synced')}: {stats.syncedFarmers}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{t('common.offline.failed')}: {stats.failedSync}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sync Errors */}
          {syncErrors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600">
                {t('common.offline.syncErrors')}
              </p>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {syncErrors.map((error, index) => (
                  <p key={index} className="text-xs text-red-500">
                    {error}
                  </p>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSyncErrors}
                className="w-full"
              >
                {t('common.offline.clearErrors')}
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <DropdownMenuItem onClick={handleSync} disabled={syncInProgress}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {syncInProgress 
                ? t('common.offline.syncing')
                : t('common.offline.syncNow')
              }
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={toggleOfflineMode}>
              <WifiOff className="w-4 h-4 mr-2" />
              {isOfflineMode 
                ? t('common.offline.enableOnline')
                : t('common.offline.enableOffline')
              }
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={checkOnlineStatus}>
              <Wifi className="w-4 h-4 mr-2" />
              {t('common.offline.checkConnection')}
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
