import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/core/store/authStore';
import { APP_ROUTES } from '@/core/constants/routes.constant';
import { LogoutButton } from './LogoutButton.tsx';
import { 
	User, 
	ChevronDown, 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserAvatarProps {
	className?: string;
	showDropdown?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
	className,
	showDropdown = true,
}) => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { t } = useTranslation();

	if (!user) {
		return null;
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const handleProfileClick = () => {
		navigate({ to: APP_ROUTES.USER_MANAGEMENT.profile });
	};

	if (!showDropdown) {
		return (
			<Avatar className={className}>
				<AvatarImage src="" alt={user.full_name} />
				<AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
			</Avatar>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors" aria-label={t('auth.profile')}>
					<Avatar className="size-8">
						<AvatarImage src="" alt={user.full_name} />
						<AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
					</Avatar>
					<div className="hidden sm:flex flex-col items-start text-sm">
						<span className="font-medium">{user.full_name}</span>
						<span className="text-muted-foreground">{user.email}</span>
					</div>
					<ChevronDown className="size-4 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.full_name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
						<p className="text-xs leading-none text-muted-foreground capitalize">
							{user.role}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleProfileClick} aria-label={t('auth.profile')}>
					<User className="size-4 mr-2" />
					{t('auth.profile')}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<LogoutButton 
						variant="ghost" 
						size="sm" 
						showConfirmation={true}
						className="w-full justify-start h-auto p-0"
					>
						{t('auth.logout')}
					</LogoutButton>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};