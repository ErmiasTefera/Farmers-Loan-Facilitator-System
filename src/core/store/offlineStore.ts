import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineStorage } from '@/core/services/offlineStorage';

interface OfflineStore {
  // State
  isOnline: boolean;
  isOfflineMode: boolean; // Manual offline mode toggle
  pendingSyncCount: number;
  lastSyncAttempt: string;
  syncErrors: string[];
  syncInProgress: boolean;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  toggleOfflineMode: () => void;
  setOfflineMode: (isOffline: boolean) => void;
  updateSyncStatus: (pendingCount: number, lastAttempt: string, errors: string[]) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  checkOnlineStatus: () => Promise<void>;
  syncData: () => Promise<{ success: number; failed: number; errors: string[] }>;
  clearSyncErrors: () => void;
  getOfflineStats: () => Promise<{
    totalFarmers: number;
    pendingSync: number;
    syncedFarmers: number;
    failedSync: number;
  }>;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnline: true,
      isOfflineMode: false,
      pendingSyncCount: 0,
      lastSyncAttempt: new Date().toISOString(),
      syncErrors: [],
      syncInProgress: false,

      // Set online status
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        offlineStorage.updateOfflineStatus(isOnline);
      },

      // Toggle offline mode
      toggleOfflineMode: () => {
        const { isOfflineMode } = get();
        set({ isOfflineMode: !isOfflineMode });
      },

      // Set offline mode
      setOfflineMode: (isOffline: boolean) => {
        set({ isOfflineMode: isOffline });
      },

      // Update sync status
      updateSyncStatus: (pendingCount: number, lastAttempt: string, errors: string[]) => {
        set({ 
          pendingSyncCount: pendingCount,
          lastSyncAttempt: lastAttempt,
          syncErrors: errors
        });
      },

      // Set sync in progress
      setSyncInProgress: (inProgress: boolean) => {
        set({ syncInProgress: inProgress });
      },

      // Check online status
      checkOnlineStatus: async () => {
        try {
          const isOnline = await offlineStorage.checkOnlineStatus();
          get().setOnlineStatus(isOnline);
        } catch (error) {
          console.error('Error checking online status:', error);
          get().setOnlineStatus(false);
        }
      },

      // Sync data
      syncData: async () => {
        const { setSyncInProgress, updateSyncStatus } = get();
        
        setSyncInProgress(true);
        
        try {
          // Import dataCollectorAPI dynamically to avoid circular dependencies
          const { dataCollectorAPI } = await import('@/features/data-collector/data-collector.api');
          
          const result = await offlineStorage.processSyncQueue(dataCollectorAPI);
          
          // Update sync status
          updateSyncStatus(
            result.failed, // Remaining failed items
            new Date().toISOString(),
            result.errors
          );
          
          return result;
        } catch (error) {
          console.error('Sync failed:', error);
          const errors = [error instanceof Error ? error.message : 'Unknown sync error'];
          updateSyncStatus(get().pendingSyncCount, new Date().toISOString(), errors);
          return { success: 0, failed: get().pendingSyncCount, errors };
        } finally {
          setSyncInProgress(false);
        }
      },

      // Clear sync errors
      clearSyncErrors: () => {
        set({ syncErrors: [] });
      },

      // Get offline statistics
      getOfflineStats: async () => {
        return await offlineStorage.getSyncStats();
      },
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        isOfflineMode: state.isOfflineMode,
        lastSyncAttempt: state.lastSyncAttempt,
      }),
    }
  )
);
