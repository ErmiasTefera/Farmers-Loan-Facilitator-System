import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/core/store/authStore';
import { APP_ROUTES } from '@/core/constants/routes.constant';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LogoutButtonProps {
	variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	className?: string;
	children?: React.ReactNode;
	showConfirmation?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
	variant = 'outline',
	size = 'default',
	className,
	children = 'Logout',
	showConfirmation = true,
}) => {
	const navigate = useNavigate();
	const { logout, isLoading } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

	const handleLogout = async () => {
		const result = await logout();
		
		if (result.success) {
			// Close dialog
			setIsOpen(false);
			
			// Navigate to home page
			navigate({ to: APP_ROUTES.DISCOVERY.root });
		}
		// If logout fails, the error will be handled by the store
	};

	const handleCancel = () => {
		setIsOpen(false);
	};

	if (!showConfirmation) {
		return (
			<Button
				variant={variant}
				size={size}
				className={className}
				onClick={handleLogout}
				disabled={isLoading}
				aria-label={isLoading ? t('auth.loggingOut') : t('auth.logout')}
			>
				<LogOut className="size-4" />
				{isLoading ? t('auth.loggingOut') : (children || t('auth.logout'))}
			</Button>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className={className}
				>
					<LogOut className="size-4" />
					{children || t('auth.logout')}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('auth.confirmLogoutTitle')}</DialogTitle>
					<DialogDescription>
						{t('auth.confirmLogoutDescription')}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading} aria-label={t('auth.cancel')}>
						{t('auth.cancel')}
					</Button>
					<Button variant="destructive" onClick={handleLogout} disabled={isLoading}>
						<LogOut className="size-4 mr-2" />
						{isLoading ? t('auth.loggingOut') : t('auth.logout')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};