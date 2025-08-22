import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_ROUTES } from "@/core/constants/routes.constant"
import { useAuthStore } from "@/core/store/authStore"
import { authAPI } from "@/features/auth/auth.api"
import { useTranslation } from 'react-i18next'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const { setUser, setSession, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.signup(name, email, password);
      
      if (response.success && response.user && response.session) {
        setUser(response.user);
        setSession(response.session);
        // Use proper navigation instead of window.location.href
        navigate({ to: APP_ROUTES.DISCOVERY.root });
      } else {
        setError(response.message || t('auth.signupFailed'));
      }
    } catch (error) {
      console.error('Error in signup:', error);
      setError(t('auth.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.createYourAccount')}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t('auth.createAccountDescription')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">{t('auth.fullName')}</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder={t('auth.fullNamePlaceholder')}
            aria-label={t('auth.fullName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
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
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input 
            id="password" 
            type="password" 
            aria-label={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            aria-label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading} aria-label={isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}>
          {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t('auth.alreadyHaveAnAccountQuestion')} {" "}
        <a href={APP_ROUTES.AUTH.signin} className="underline underline-offset-4">
          {t('auth.signIn')}
        </a>
      </div>
    </form>
  )
}


