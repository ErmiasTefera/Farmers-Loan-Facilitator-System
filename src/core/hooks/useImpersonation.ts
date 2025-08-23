import { useImpersonationStore } from '@/core/store/impersonationStore';
import { useAuthStore } from '@/core/store/authStore';

export const useImpersonation = () => {
  const { 
    isImpersonating, 
    impersonatedUser, 
    getEffectiveUserId, 
    getEffectiveEntityId 
  } = useImpersonationStore();
  const { user } = useAuthStore();

  // Get the effective user (either impersonated or actual)
  const getEffectiveUser = () => {
    if (isImpersonating && impersonatedUser) {
      return {
        id: impersonatedUser.id,
        entity_id: impersonatedUser.entity_id,
        full_name: impersonatedUser.full_name,
        phone_number: impersonatedUser.phone_number,
        region: impersonatedUser.region,
        role: impersonatedUser.role,
        isImpersonated: true
      };
    }
    return user ? { ...user, isImpersonated: false } : null;
  };

  // Get the effective user ID for API calls
  const getUserId = () => {
    return getEffectiveUserId() || user?.id || null;
  };

  // Get the effective entity ID (for farmers, data collectors, etc.)
  const getEntityId = () => {
    return getEffectiveEntityId();
  };

  // Check if currently impersonating
  const isCurrentlyImpersonating = () => {
    return isImpersonating && impersonatedUser !== null;
  };

  // Get impersonation context for debugging/logging
  const getImpersonationContext = () => {
    if (isImpersonating && impersonatedUser) {
      return {
        isImpersonating: true,
        impersonatedUserId: impersonatedUser.id,
        impersonatedEntityId: impersonatedUser.entity_id,
        impersonatedRole: impersonatedUser.role,
        originalUserId: user?.id
      };
    }
    return {
      isImpersonating: false,
      impersonatedUserId: null,
      impersonatedEntityId: null,
      impersonatedRole: null,
      originalUserId: user?.id
    };
  };

  return {
    // State
    isImpersonating,
    impersonatedUser,
    
    // Getters
    getEffectiveUser,
    getUserId,
    getEntityId,
    isCurrentlyImpersonating,
    getImpersonationContext,
  };
};
