import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_ROUTES } from "@/core/constants/routes.constant"
import { useAuthStore } from "@/core/store/authStore"
import { DEMO_CREDENTIALS } from "@/features/auth/auth.api"
import { useTranslation } from 'react-i18next'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const { t } = useTranslation();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginPage - Form submitted:', { email, password });
    
    const result = await login(email, password);
    console.log('LoginPage - Login result:', result);
    
    if (result.success) {
      console.log('LoginPage - Login successful, navigating to home');
      // Use proper navigation instead of window.location.href
      navigate({ to: APP_ROUTES.DISCOVERY.root });
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.loginWithYourAccount')}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t('auth.loginDescription')}
        </p>
      </div>

      {/* Demo Credentials Card */}
      <div className="bg-muted/50 p-4 rounded-lg border" aria-label={t('auth.demoCredentialsTitle')}>
        <h3 className="text-sm font-medium mb-2">{t('auth.demoCredentialsTitle')}</h3>
        <div className="text-xs space-y-1 text-muted-foreground">
          <p><strong>{t('auth.email')}:</strong> {DEMO_CREDENTIALS.email}</p>
          <p><strong>{t('auth.password')}:</strong> {DEMO_CREDENTIALS.password}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder={t('auth.emailPlaceholder')}
            aria-label={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <a
              href={APP_ROUTES.AUTH.forgotPassword}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t('auth.forgotPasswordQuestion')}
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            aria-label={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading} aria-label={isLoading ? t('auth.loggingIn') : t('auth.login')}>
          {isLoading ? t('auth.loggingIn') : t('auth.login')}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t('auth.dontHaveAnAccount')} {" "}
        <a href={APP_ROUTES.AUTH.signup} className="underline underline-offset-4">
          {t('auth.signUp')}
        </a>
      </div>
    </form>
  )
}