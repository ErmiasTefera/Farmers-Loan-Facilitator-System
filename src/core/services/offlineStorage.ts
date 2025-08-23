import Dexie, { type Table } from 'dexie';

// Types for offline storage
export interface OfflineFarmer {
  id?: string;
  local_id: string; // Local ID for offline records
  data_collector_id: string;
  full_name: string;
  phone_number: string;
  id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  village: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  family_size: number;
  education_level: 'none' | 'primary' | 'secondary' | 'tertiary';
  primary_occupation: 'farming' | 'mixed' | 'other';
  monthly_income: number;
  farm_size_hectares: number;
  primary_crop: string;
  secondary_crops: string[];
  livestock_count: number;
  has_bank_account: boolean;
  bank_name?: string;
  account_number?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  sync_status: 'pending' | 'synced' | 'failed';
  last_sync_attempt?: string;
  sync_error?: string;
}

export interface SyncQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  local_id?: string;
  timestamp: string;
  retry_count: number;
  max_retries: number;
}

export interface OfflineStatus {
  isOnline: boolean;
  lastOnlineCheck: string;
  pendingSyncCount: number;
  lastSyncAttempt: string;
  syncErrors: string[];
}

// Offline Database using Dexie
export class OfflineDatabase extends Dexie {
  farmers!: Table<OfflineFarmer>;
  syncQueue!: Table<SyncQueueItem>;
  offlineStatus!: Table<OfflineStatus>;

  constructor() {
    super('FarmersLoanFacilitatorDB');
    
    this.version(1).stores({
      farmers: '++id, local_id, data_collector_id, sync_status, phone_number',
      syncQueue: '++id, action, table, timestamp, retry_count',
      offlineStatus: 'id'
    });
  }
}

// Singleton instance
export const offlineDB = new OfflineDatabase();

// Offline Storage Service
export class OfflineStorageService {
  private db: OfflineDatabase;
  private syncInProgress = false;

  constructor() {
    this.db = offlineDB;
  }

  // Check if we're online
  async checkOnlineStatus(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Update offline status
  async updateOfflineStatus(isOnline: boolean): Promise<void> {
    const status: OfflineStatus = {
      isOnline,
      lastOnlineCheck: new Date().toISOString(),
      pendingSyncCount: await this.getPendingSyncCount(),
      lastSyncAttempt: new Date().toISOString(),
      syncErrors: []
    };

    await this.db.offlineStatus.put(status, 1);
  }

  // Get current offline status
  async getOfflineStatus(): Promise<OfflineStatus> {
    const status = await this.db.offlineStatus.get(1);
    if (!status) {
      return {
        isOnline: true,
        lastOnlineCheck: new Date().toISOString(),
        pendingSyncCount: 0,
        lastSyncAttempt: new Date().toISOString(),
        syncErrors: []
      };
    }
    return status;
  }

  // Save farmer data offline
  async saveFarmerOffline(farmerData: Omit<OfflineFarmer, 'local_id' | 'sync_status'>): Promise<string> {
    const local_id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const offlineFarmer: OfflineFarmer = {
      ...farmerData,
      local_id,
      sync_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.db.farmers.add(offlineFarmer);
    
    // Add to sync queue
    await this.addToSyncQueue('create', 'farmers', { ...farmerData, local_id });
    
    return local_id;
  }

  // Update farmer data offline
  async updateFarmerOffline(farmerId: string, updates: Partial<OfflineFarmer>): Promise<void> {
    const farmer = await this.db.farmers.get(farmerId);
    if (!farmer) {
      throw new Error('Farmer not found in offline storage');
    }

    const updatedFarmer = {
      ...farmer,
      ...updates,
      sync_status: 'pending' as const,
      updated_at: new Date().toISOString()
    };

    await this.db.farmers.update(farmerId, updatedFarmer);
    
    // Add to sync queue
    await this.addToSyncQueue('update', 'farmers', { id: farmerId, ...updates });
  }

  // Get all offline farmers
  async getOfflineFarmers(dataCollectorId: string): Promise<OfflineFarmer[]> {
    return await this.db.farmers
      .where('data_collector_id')
      .equals(dataCollectorId)
      .toArray();
  }

  // Get farmer by ID (check both local and remote IDs)
  async getFarmerById(farmerId: string): Promise<OfflineFarmer | null> {
    // First try to find by local ID
    let farmer = await this.db.farmers.where('local_id').equals(farmerId).first();
    
    if (!farmer) {
      // Then try to find by regular ID
      farmer = await this.db.farmers.get(farmerId);
    }
    
    return farmer || null;
  }

  // Add item to sync queue
  async addToSyncQueue(action: SyncQueueItem['action'], table: string, data: any, local_id?: string): Promise<void> {
    const queueItem: SyncQueueItem = {
      action,
      table,
      data,
      local_id,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3
    };

    await this.db.syncQueue.add(queueItem);
  }

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    return await this.db.syncQueue.count();
  }

  // Get sync queue items
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.db.syncQueue
      .orderBy('timestamp')
      .toArray();
  }

  // Process sync queue
  async processSyncQueue(supabaseAPI: any): Promise<{ success: number; failed: number; errors: string[] }> {
    if (this.syncInProgress) {
      return { success: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      const queueItems = await this.getSyncQueue();
      
      for (const item of queueItems) {
        try {
          await this.processSyncItem(item, supabaseAPI);
          await this.db.syncQueue.delete(item.id!);
          success++;
        } catch (error) {
          console.error('Sync item failed:', error);
          item.retry_count++;
          
          if (item.retry_count >= item.max_retries) {
            await this.db.syncQueue.delete(item.id!);
            errors.push(`Failed to sync ${item.action} on ${item.table}: ${error}`);
            failed++;
          } else {
            await this.db.syncQueue.update(item.id!, {
              retry_count: item.retry_count,
              timestamp: item.timestamp
            });
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return { success, failed, errors };
  }

  // Process individual sync item
  private async processSyncItem(item: SyncQueueItem, supabaseAPI: any): Promise<void> {
    switch (item.action) {
      case 'create':
        if (item.table === 'farmers') {
          const result = await supabaseAPI.registerFarmer(item.data);
          // Update local record with server ID
          if (item.local_id) {
            await this.db.farmers
              .where('local_id')
              .equals(item.local_id)
              .modify({ 
                id: result.id, 
                sync_status: 'synced',
                local_id: undefined // Remove local ID since we now have server ID
              });
          }
        }
        break;
        
      case 'update':
        if (item.table === 'farmers') {
          await supabaseAPI.updateFarmerDetails(item.data.id, item.data);
          // Update sync status
          await this.db.farmers
            .where('id')
            .equals(item.data.id)
            .modify({ sync_status: 'synced' });
        }
        break;
        
      case 'delete':
        // Handle delete operations if needed
        break;
    }
  }

  // Clear all offline data (for testing)
  async clearAllData(): Promise<void> {
    await this.db.farmers.clear();
    await this.db.syncQueue.clear();
    await this.db.offlineStatus.clear();
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    totalFarmers: number;
    pendingSync: number;
    syncedFarmers: number;
    failedSync: number;
  }> {
    const farmers = await this.db.farmers.toArray();
    const pendingSync = await this.getPendingSyncCount();
    
    return {
      totalFarmers: farmers.length,
      pendingSync,
      syncedFarmers: farmers.filter(f => f.sync_status === 'synced').length,
      failedSync: farmers.filter(f => f.sync_status === 'failed').length
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
