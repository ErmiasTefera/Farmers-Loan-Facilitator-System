import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { UserAvatar } from './UserAvatar';
import { SigninButton } from './SignInButton';
import { useTranslation } from 'react-i18next';

interface AuthStatusProps {
	className?: string;
	showDropdown?: boolean;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
	className,
	showDropdown = true,
}) => {
	const { user, isLoading } = useAuthStore();
  const { t } = useTranslation();

	if (isLoading) {
		return <div className="text-sm text-muted-foreground" aria-live="polite">{t('auth.loading')}</div>;
	}

	if (user) {
		return <UserAvatar className={className} showDropdown={showDropdown} />;
	}

	return <SigninButton variant="outline" className={className}>{t('auth.signIn')}</SigninButton>;
};
