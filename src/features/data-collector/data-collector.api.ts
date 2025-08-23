import { supabase } from '@/core/api/supabase-client';
import { offlineStorage, type OfflineFarmer } from '@/core/services/offlineStorage';
import { useOfflineStore } from '@/core/store/offlineStore';
import { useImpersonationStore } from '@/core/store/impersonationStore';

// Helper function to get effective data collector ID (considering impersonation)
const getEffectiveDataCollectorId = (): string | null => {
  const impersonationStore = useImpersonationStore.getState();
  return impersonationStore.isImpersonating && impersonationStore.impersonatedUser?.entity_id 
    ? impersonationStore.impersonatedUser.entity_id 
    : null;
};

// Types
export interface DataCollector {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  region: string;
  assigned_farmers_count: number;
  created_at: string;
  updated_at: string;
}

export interface FarmerRegistration {
  id: string;
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
  local_id?: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

export interface DataCollectorDashboard {
  total_assigned_farmers: number;
  pending_verifications: number;
  verified_farmers: number;
  rejected_farmers: number;
  recent_registrations: FarmerRegistration[];
  monthly_registrations: { month: string; count: number }[];
}

export interface FarmerSearchFilters {
  region?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  registration_date_from?: string;
  registration_date_to?: string;
  search_term?: string;
}

// API Functions
export const dataCollectorAPI = {
  // Get data collector profile
  async getDataCollectorProfile(userId: string): Promise<DataCollector | null> {
    const { data, error } = await supabase
      .from('data_collectors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching data collector profile:', error);
      throw new Error(`Failed to fetch data collector profile: ${error.message}`);
    }

    return data;
  },

  // Get dashboard data
  async getDashboardData(dataCollectorId?: string): Promise<DataCollectorDashboard> {
    // Use effective data collector ID (considering impersonation)
    const effectiveDataCollectorId = dataCollectorId || getEffectiveDataCollectorId();
    
    if (!effectiveDataCollectorId) {
      throw new Error('No data collector ID available');
    }

    // Get assigned farmers count
    const { data: farmers, error: farmersError } = await supabase
      .from('farmers')
      .select('id, verification_status, created_at')
      .eq('data_collector_id', effectiveDataCollectorId);

    if (farmersError) {
      console.error('Error fetching farmers:', farmersError);
      throw new Error(`Failed to fetch farmers: ${farmersError.message}`);
    }

    // Calculate dashboard metrics
    const total_assigned_farmers = farmers?.length || 0;
    const pending_verifications = farmers?.filter((f: { verification_status: string }) => f.verification_status === 'pending').length || 0;
    const verified_farmers = farmers?.filter((f: { verification_status: string }) => f.verification_status === 'verified').length || 0;
    const rejected_farmers = farmers?.filter((f: { verification_status: string }) => f.verification_status === 'rejected').length || 0;

    // Get recent registrations
    const { data: recentRegistrations, error: recentError } = await supabase
      .from('farmers')
      .select('*')
      .eq('data_collector_id', effectiveDataCollectorId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent registrations:', recentError);
      throw new Error(`Failed to fetch recent registrations: ${recentError.message}`);
    }

    // Mock monthly registrations data
    const monthly_registrations = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 22 },
      { month: 'May', count: 19 },
      { month: 'Jun', count: 25 },
    ];

    return {
      total_assigned_farmers,
      pending_verifications,
      verified_farmers,
      rejected_farmers,
      recent_registrations: recentRegistrations || [],
      monthly_registrations,
    };
  },

  // Get assigned farmers with filters (with offline support)
  async getAssignedFarmers(
    dataCollectorId: string,
    filters: FarmerSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ farmers: FarmerRegistration[]; total: number }> {
    // Check if we're in offline mode or offline
    const offlineStore = useOfflineStore.getState();
    const isOffline = offlineStore.isOfflineMode || !offlineStore.isOnline;

    if (isOffline) {
      // Get from offline storage
      const offlineFarmers = await offlineStorage.getOfflineFarmers(dataCollectorId);
      
      // Apply filters locally
      let filteredFarmers = offlineFarmers.filter(farmer => {
        if (filters.region && farmer.region !== filters.region) return false;
        if (filters.verification_status && farmer.verification_status !== filters.verification_status) return false;
        if (filters.search_term) {
          const searchTerm = filters.search_term.toLowerCase();
          const matches = 
            farmer.full_name.toLowerCase().includes(searchTerm) ||
            farmer.phone_number.includes(searchTerm) ||
            farmer.id_number.includes(searchTerm);
          if (!matches) return false;
        }
        return true;
      });

      // Apply date filters
      if (filters.registration_date_from) {
        filteredFarmers = filteredFarmers.filter(farmer => 
          new Date(farmer.created_at) >= new Date(filters.registration_date_from!)
        );
      }
      if (filters.registration_date_to) {
        filteredFarmers = filteredFarmers.filter(farmer => 
          new Date(farmer.created_at) <= new Date(filters.registration_date_to!)
        );
      }

      // Sort by created_at descending
      filteredFarmers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedFarmers = filteredFarmers.slice(from, to);

      return {
        farmers: paginatedFarmers as FarmerRegistration[],
        total: filteredFarmers.length,
      };
    }

    // Online mode - get from Supabase
    let query = supabase
      .from('farmers')
      .select('*', { count: 'exact' })
      .eq('data_collector_id', dataCollectorId);

    // Apply filters
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status);
    }
    if (filters.registration_date_from) {
      query = query.gte('created_at', filters.registration_date_from);
    }
    if (filters.registration_date_to) {
      query = query.lte('created_at', filters.registration_date_to);
    }
    if (filters.search_term) {
      query = query.or(`full_name.ilike.%${filters.search_term}%,phone_number.ilike.%${filters.search_term}%,id_number.ilike.%${filters.search_term}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching assigned farmers:', error);
      throw new Error(`Failed to fetch assigned farmers: ${error.message}`);
    }

    return {
      farmers: data || [],
      total: count || 0,
    };
  },

  // Register new farmer (with offline support)
  async registerFarmer(farmerData: Omit<FarmerRegistration, 'id' | 'data_collector_id' | 'created_at' | 'updated_at'>): Promise<FarmerRegistration> {
    // Check if we're in offline mode or offline
    const offlineStore = useOfflineStore.getState();
    const isOffline = offlineStore.isOfflineMode || !offlineStore.isOnline;

    if (isOffline) {
      // Save to offline storage
      const local_id = await offlineStorage.saveFarmerOffline({
        ...farmerData,
        sync_status: 'pending'
      } as OfflineFarmer);

      // Return a mock response for offline mode
      return {
        ...farmerData,
        id: local_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as FarmerRegistration;
    }

    // Online mode - save to Supabase
    const { data, error } = await supabase
      .from('farmers')
      .insert([farmerData])
      .select()
      .single();

    if (error) {
      console.error('Error registering farmer:', error);
      throw new Error(`Failed to register farmer: ${error.message}`);
    }

    return data;
  },

  // Update farmer verification status (with offline support)
  async updateFarmerVerification(
    farmerId: string,
    verificationStatus: 'pending' | 'verified' | 'rejected',
    verificationNotes?: string,
    verifiedBy?: string
  ): Promise<void> {
    // Check if we're in offline mode or offline
    const offlineStore = useOfflineStore.getState();
    const isOffline = offlineStore.isOfflineMode || !offlineStore.isOnline;

    const updateData: any = {
      verification_status: verificationStatus,
      verification_notes: verificationNotes,
      updated_at: new Date().toISOString(),
    };

    // Add verification timestamp and verifier if status is verified or rejected
    if (verificationStatus === 'verified' || verificationStatus === 'rejected') {
      updateData.verified_at = new Date().toISOString();
      if (verifiedBy) {
        updateData.verified_by = verifiedBy;
      }
    }

    if (isOffline) {
      // Update in offline storage
      await offlineStorage.updateFarmerOffline(farmerId, updateData);
      return;
    }

    // Online mode - update in Supabase
    const { error } = await supabase
      .from('farmers')
      .update(updateData)
      .eq('id', farmerId);

    if (error) {
      console.error('Error updating farmer verification:', error);
      throw new Error(`Failed to update farmer verification: ${error.message}`);
    }
  },

  // Get farmer details
  async getFarmerDetails(farmerId: string): Promise<FarmerRegistration | null> {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('id', farmerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching farmer details:', error);
      throw new Error(`Failed to fetch farmer details: ${error.message}`);
    }

    return data;
  },

  // Update farmer details (with offline support)
  async updateFarmerDetails(
    farmerId: string,
    updates: Partial<FarmerRegistration>
  ): Promise<FarmerRegistration> {
    // Check if we're in offline mode or offline
    const offlineStore = useOfflineStore.getState();
    const isOffline = offlineStore.isOfflineMode || !offlineStore.isOnline;

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isOffline) {
      // Update in offline storage
      await offlineStorage.updateFarmerOffline(farmerId, updateData);
      
      // Get updated farmer from offline storage
      const updatedFarmer = await offlineStorage.getFarmerById(farmerId);
      if (!updatedFarmer) {
        throw new Error('Farmer not found in offline storage');
      }
      
      return updatedFarmer as FarmerRegistration;
    }

    // Online mode - update in Supabase
    const { data, error } = await supabase
      .from('farmers')
      .update(updateData)
      .eq('id', farmerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating farmer details:', error);
      throw new Error(`Failed to update farmer details: ${error.message}`);
    }

    return data;
  },
};
