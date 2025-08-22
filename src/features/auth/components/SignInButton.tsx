import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { APP_ROUTES } from '@/core/constants/routes.constant';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SigninButtonProps {
	variant?: 'default' | 'outline' | 'ghost' | 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	children?: React.ReactNode;
}

export const SigninButton: React.FC<SigninButtonProps> = ({
	variant = 'default',
	size = 'default',
	className,
	children = 'Sign In',
}) => {
	const navigate = useNavigate();
  const { t } = useTranslation();

	const handleSignin = () => {
		navigate({ to: APP_ROUTES.AUTH.signin });
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={handleSignin}
			aria-label={t('auth.signIn')}
		>
			<User className="size-4" />
			{children || t('auth.signIn')}
		</Button>
	);
};