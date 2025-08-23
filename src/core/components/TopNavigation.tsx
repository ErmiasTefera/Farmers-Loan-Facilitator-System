import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { AuthStatus } from '@/features/auth/components/AuthStatus';
import { RoleSwitcher } from './RoleSwitcher';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { ImpersonationSwitcher } from './ImpersonationSwitcher';

/**
 * TopNavigation - Shared navigation component for all user roles
 * 
 * Features:
 * - Language selector (English/Amharic)
 * - Theme toggle (Light/Dark)
 * - User authentication status
 * - Role-based branding (colors and logos)
 * 
 * Usage Examples:
 * 
 * // Farmer Layout
 * <TopNavigation 
 *   title="Farmer Portal"
 *   titleKey="farmer.layout.title"
 *   userRole="farmer"
 * />
 * 
 * // Data Collector Layout
 * <TopNavigation 
 *   title="Data Collection Hub"
 *   titleKey="dataCollector.layout.title"
 *   userRole="data-collector"
 * />
 * 
 * // Financial Institution Layout
 * <TopNavigation 
 *   title="Loan Management"
 *   titleKey="financial.layout.title"
 *   userRole="financial-institution"
 * />
 * 
 * // Admin Layout
 * <TopNavigation 
 *   title="System Administration"
 *   titleKey="admin.layout.title"
 *   userRole="admin"
 * />
 */

interface TopNavigationProps {
  title: string;
  titleKey?: string; // Translation key for the title
  userRole: 'farmer' | 'data-collector' | 'financial-institution' | 'admin';
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ 
  title, 
  titleKey,
  userRole, 
  className = "" 
}) => {
  const { t } = useTranslation();

  const displayTitle = titleKey ? t(titleKey) : title;

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Title (Role Switcher) */}
          <div className="flex items-center space-x-4">
            <RoleSwitcher 
              title={displayTitle}
              userRole={userRole}
            />
          </div>
          
          {/* Right Side - Controls and User Info */}
          <div className="flex items-center space-x-4">
            
            {/* Impersonation Switcher - For testing different users */}
            <ImpersonationSwitcher />
            
            {/* Offline Status Indicator - Only for data collectors */}
            {userRole === 'data-collector' && (
              <div className="hidden sm:block">
                <OfflineStatusIndicator variant="compact" />
              </div>
            )}
            
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Auth Status - Hidden on mobile, shown on tablet and up */}
            <div className="hidden sm:block">
              <AuthStatus />
            </div>
            
            {/* Mobile Menu Button - Only shown on mobile */}
            <div className="sm:hidden">
              <AuthStatus showDropdown={false} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
