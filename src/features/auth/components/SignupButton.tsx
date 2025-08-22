import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/core/constants/routes.constant';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SignupButtonProps {
	variant?: 'default' | 'outline' | 'ghost' | 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	children?: React.ReactNode;
}

export const SignupButton: React.FC<SignupButtonProps> = ({
	variant = 'outline',
	size = 'default',
	className,
	children = 'Sign Up',
}) => {
	const navigate = useNavigate();
  const { t } = useTranslation();

	const handleSignup = () => {
		navigate({ to: APP_ROUTES.AUTH.signup });
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={handleSignup}
			aria-label={t('auth.signUp')}
		>
			<UserPlus className="size-4" />
			{children || t('auth.signUp')}
		</Button>
	);
};
