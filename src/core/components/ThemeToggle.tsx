import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@core/hooks/useTheme';
import { UITheme } from '@core/store/uiStore';

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="cursor-pointer"
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === UITheme.Light ? UITheme.Dark : UITheme.Light} mode`}
			title={`Switch to ${theme === UITheme.Light ? UITheme.Dark : UITheme.Light} mode`}
		>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
};

export default ThemeToggle;