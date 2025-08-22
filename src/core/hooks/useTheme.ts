import { useUIStore } from '@core/store/uiStore';

// Hook to use theme from Zustand store
export const useTheme = () => {
	const { theme, setTheme, toggleTheme } = useUIStore();
	return {
		theme,
		setTheme,
		toggleTheme,
	};
};
