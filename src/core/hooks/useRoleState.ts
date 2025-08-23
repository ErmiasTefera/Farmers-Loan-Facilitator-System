import { useState, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

export type UserRole = 'farmer' | 'data-collector' | 'financial-institution' | 'admin';

const ROLE_STORAGE_KEY = 'selectedUserRole';

export const useRoleState = () => {
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');

  // Initialize role from localStorage or URL
  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
    const currentPath = location.pathname;
    
    // Try to determine role from current URL
    let urlRole: UserRole | undefined;
    if (currentPath.startsWith('/farmer')) {
      urlRole = 'farmer';
    } else if (currentPath.startsWith('/data-collector')) {
      urlRole = 'data-collector';
    } else if (currentPath.startsWith('/financial-institution')) {
      urlRole = 'financial-institution';
    } else if (currentPath.startsWith('/admin')) {
      urlRole = 'admin';
    }

    // Priority: URL role > saved role > default to farmer
    const roleToSet = urlRole || savedRole || 'farmer';
    
    setCurrentRole(roleToSet);
    
    // Update localStorage if different from saved
    if (roleToSet !== savedRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, roleToSet);
    }
  }, [location.pathname]);

  const updateRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  return {
    currentRole,
    updateRole,
  };
};
