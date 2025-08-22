import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_ROUTES } from "@/core/constants/routes.constant"
import { useAuthStore } from "@/core/store/authStore"
import { authAPI } from "@/features/auth/auth.api"
import { useTranslation } from 'react-i18next'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useTranslation();

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        setSuccess(response.message || t('auth.passwordResetSuccess'));
        setEmail(''); // Clear the form
      } else {
        setError(response.message || t('auth.passwordResetFailed'));
      }
    } catch (error) {
      console.error('Error in forgot password:', error);
      setError(t('auth.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.forgotPasswordQuestion')}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t('auth.forgotPasswordDescription')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-md">
          {success}
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
        <Button type="submit" className="w-full" disabled={isLoading} aria-label={isLoading ? t('auth.sending') : t('auth.sendResetLink')}>
          {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t('auth.rememberYourPasswordQuestion')} {" "}
        <a href={APP_ROUTES.AUTH.signin} className="underline underline-offset-4">
          {t('auth.signIn')}
        </a>
      </div>
    </form>
  )
}


