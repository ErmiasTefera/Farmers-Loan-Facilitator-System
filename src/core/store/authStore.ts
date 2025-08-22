import { create } from 'zustand';
import type { AuthStore } from '../types/AuthStore';
import { authAPI } from '@/features/auth/auth.api';

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	token: null,
	isLoading: false,
	error: null,
	setUser: (user) => {
		console.log('AuthStore - Setting user:', user);
		set({ user });
	},
	setToken: (token) => {
		console.log('AuthStore - Setting token:', token);
		set({ token });
	},
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	
	// Login function
	login: async (email: string, password: string) => {
		console.log('AuthStore - Login attempt:', { email });
		set({ isLoading: true, error: null });
		
		try {
			const response = await authAPI.login(email, password);
			console.log('AuthStore - Login response:', response);
			
			if (response.success && response.user && response.token) {
				console.log('AuthStore - Login successful, setting user and token');
				set({ 
					user: response.user, 
					token: response.token, 
					isLoading: false,
					error: null 
				});
				return { success: true };
			} else {
				console.log('AuthStore - Login failed:', response.message);
				set({ 
					isLoading: false, 
					error: response.message || 'Login failed' 
				});
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.log('AuthStore - Login error:', error);
			set({ 
				isLoading: false, 
				error: 'Network error occurred' 
			});
			return { success: false, error: 'Network error occurred' };
		}
	},
	
	// Logout function
	logout: async () => {
		console.log('AuthStore - Logout attempt');
		set({ isLoading: true });
		
		try {
			await authAPI.logout();
			console.log('AuthStore - Logout successful, clearing user and token');
			set({ 
				user: null, 
				token: null, 
				isLoading: false,
				error: null 
			});
			return { success: true };
		} catch (error) {
			console.log('AuthStore - Logout error:', error);
			set({ 
				isLoading: false, 
				error: 'Logout failed' 
			});
			return { success: false, error: 'Logout failed' };
		}
	},
	
	// Clear error
	clearError: () => set({ error: null })
}));