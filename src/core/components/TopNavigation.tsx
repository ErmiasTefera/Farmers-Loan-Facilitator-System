import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { AuthStatus } from '@/features/auth/components/AuthStatus';

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
  logoIcon?: React.ReactNode;
  className?: string;
}

const roleColors = {
  'farmer': 'bg-green-600',
  'data-collector': 'bg-blue-600', 
  'financial-institution': 'bg-purple-600',
  'admin': 'bg-red-600'
};

const roleLetters = {
  'farmer': 'F',
  'data-collector': 'DC',
  'financial-institution': 'FI',
  'admin': 'A'
};

export const TopNavigation: React.FC<TopNavigationProps> = ({ 
  title, 
  titleKey,
  userRole, 
  logoIcon,
  className = "" 
}) => {
  const { t } = useTranslation();

  const displayTitle = titleKey ? t(titleKey) : title;
  const logoColorClass = roleColors[userRole];
  const logoText = roleLetters[userRole];

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {logoIcon ? (
                <div className={`w-8 h-8 ${logoColorClass} rounded-full flex items-center justify-center`}>
                  {logoIcon}
                </div>
              ) : (
                <div className={`w-8 h-8 ${logoColorClass} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{logoText}</span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {displayTitle}
              </h1>
            </div>
          </div>
          
          {/* Right Side - Controls and User Info */}
          <div className="flex items-center space-x-4">
            
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
