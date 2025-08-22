import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { HomeButton } from '@/core/components/HomeButton';
import ThemeToggle from '@/core/components/ThemeToggle';
import LanguageSelector from '@/core/components/LanguageSelector';

export default function AuthLayout(): React.JSX.Element {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
          <div className="bg-muted relative hidden lg:block">
            <img
              src="/auth-welcome.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex gap-2 justify-between">
              <HomeButton />
              <div className="flex gap-2">
              <ThemeToggle />
              <LanguageSelector />
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xs">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      )
}