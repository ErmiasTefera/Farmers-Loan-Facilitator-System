import React from 'react';
import { HomeButton } from './HomeButton';
import { AuthStatus } from '@/features/auth/components/AuthStatus';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

interface TopbarNavProps {
  className?: string;
}

export const TopbarNav: React.FC<TopbarNavProps> = ({ className }) => {
  return (
    <nav className={`flex items-center justify-between w-full p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}>
      {/* Left side - Home Button */}
      <div className="flex items-center">
        <HomeButton />
      </div>

      {/* Right side - Auth Status and Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

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
    </nav>
  );
};
