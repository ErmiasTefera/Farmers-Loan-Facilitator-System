import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const UITheme = {
	Dark: 'dark',
	Light: 'light',
	System: 'system',
} as const;

type Theme = typeof UITheme[keyof typeof UITheme];

interface UIState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set, get) => ({
			theme: UITheme.System,
			setTheme: (theme: Theme) => {
				set({ theme });
				applyTheme(theme);
			},
			toggleTheme: () => {
				const currentTheme = get().theme;
				const newTheme: Theme = currentTheme === UITheme.Light ? UITheme.Dark : UITheme.Light;
				set({ theme: newTheme });
				applyTheme(newTheme);
			},
		}),
		{
			name: 'ui-theme',
			partialize: (state) => ({ theme: state.theme }),
		}
	)
);

// Helper function to apply theme to DOM
function applyTheme(theme: Theme): void {
	const root = window.document.documentElement;
	
	// Remove existing theme classes
	root.classList.remove('light', 'dark');
	
	if (theme === UITheme.System) {
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		root.classList.add(systemTheme);
	} else {
		root.classList.add(theme);
	}
}

// Initialize theme and set up system theme listener
if (typeof window !== 'undefined') {
	// Apply initial theme
	const store = useUIStore.getState();
	applyTheme(store.theme);
	
	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handleSystemThemeChange = () => {
		const currentTheme = useUIStore.getState().theme;
		if (currentTheme === UITheme.System) {
			applyTheme(UITheme.System);
		}
	};
	
	mediaQuery.addEventListener('change', handleSystemThemeChange);
}
