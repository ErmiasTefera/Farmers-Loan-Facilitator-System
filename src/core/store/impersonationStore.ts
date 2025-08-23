import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/core/api/supabase-client';

export interface ImpersonationUser {
  id: string;
  entity_id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  region?: string;
  role: 'farmer' | 'data-collector';
}

export interface ImpersonationState {
  // State
  isImpersonating: boolean;
  impersonatedUser: ImpersonationUser | null;
  availableUsers: Record<string, ImpersonationUser[]>; // keyed by role
  loading: boolean;
  error: string | null;

  // Actions
  startImpersonation: (user: ImpersonationUser) => void;
  stopImpersonation: () => void;
  loadUsersForRole: (role: 'farmer' | 'data-collector') => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  getEffectiveUserId: () => string | null;
  getEffectiveEntityId: () => string | null;
  switchRoleAndSelectFirst: (role: 'farmer' | 'data-collector') => Promise<void>;
}

export const useImpersonationStore = create<ImpersonationState>()(
  persist(
    (set, get) => ({
      // Initial state
      isImpersonating: false,
      impersonatedUser: null,
      availableUsers: {},
      loading: false,
      error: null,

      // Start impersonating a user
      startImpersonation: (user: ImpersonationUser) => {
        set({
          isImpersonating: true,
          impersonatedUser: user,
          error: null
        });
      },

      // Stop impersonation
      stopImpersonation: () => {
        set({
          isImpersonating: false,
          impersonatedUser: null,
          error: null
        });
      },

      // Load users for a specific role
      loadUsersForRole: async (role: 'farmer' | 'data-collector') => {
        const state = get();
        if (state.loading) return;

        set({ loading: true, error: null });

        try {
          let users: ImpersonationUser[] = [];

          if (role === 'farmer') {
            const { data: farmers, error: farmersError } = await supabase
              .from('farmers')
              .select('id, full_name, user_id, phone_number, region')
              .order('full_name');

            if (farmersError) throw farmersError;

            users = farmers?.map((farmer: any) => ({
              id: farmer.user_id,
              entity_id: farmer.id,
              full_name: farmer.full_name,
              phone_number: farmer.phone_number,
              region: farmer.region,
              role: 'farmer' as const
            })) || [];
          } else if (role === 'data-collector') {
            const { data: dataCollectors, error: dataCollectorsError } = await supabase
              .from('data_collectors')
              .select('id, full_name, user_id, phone_number, region')
              .order('full_name');

            if (dataCollectorsError) throw dataCollectorsError;

            users = dataCollectors?.map((collector: any) => ({
              id: collector.user_id,
              entity_id: collector.id,
              full_name: collector.full_name,
              phone_number: collector.phone_number,
              region: collector.region,
              role: 'data-collector' as const
            })) || [];
          }

          set(state => ({
            availableUsers: {
              ...state.availableUsers,
              [role]: users
            },
            loading: false
          }));
        } catch (error) {
          console.error(`Error loading users for role ${role}:`, error);
          set({ 
            error: error instanceof Error ? error.message : `Failed to load ${role} users`,
            loading: false 
          });
        }
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Get effective user ID (impersonated or actual)
      getEffectiveUserId: () => {
        const state = get();
        return state.isImpersonating && state.impersonatedUser 
          ? state.impersonatedUser.id 
          : null;
      },

      // Get effective entity ID (impersonated or actual)
      getEffectiveEntityId: () => {
        const state = get();
        return state.isImpersonating && state.impersonatedUser 
          ? state.impersonatedUser.entity_id 
          : null;
      },

      // Switch role and automatically select the first user
      switchRoleAndSelectFirst: async (role: 'farmer' | 'data-collector') => {
        // First, load users for the new role
        await get().loadUsersForRole(role);
        
        // Get the updated state after loading users
        const updatedState = get();
        const usersForRole = updatedState.availableUsers[role] || [];
        
        if (usersForRole.length > 0) {
          // Select the first user automatically
          const firstUser = usersForRole[0];
          set({
            isImpersonating: true,
            impersonatedUser: firstUser,
            error: null
          });
        } else {
          // No users available, stop impersonation
          set({
            isImpersonating: false,
            impersonatedUser: null,
            error: null
          });
        }
      }
    }),
    {
      name: 'impersonation-storage',
      partialize: (state) => ({
        isImpersonating: state.isImpersonating,
        impersonatedUser: state.impersonatedUser,
      }),
    }
  )
);
