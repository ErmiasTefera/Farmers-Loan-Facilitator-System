import { create } from 'zustand';
import type { AuthStore } from '../types/AuthStore';
import { authAPI } from '@/features/auth/auth.api';

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	session: null,
	isLoading: false,
	error: null,
	
	setUser: (user) => {
		console.log('AuthStore - Setting user:', user);
		set({ user });
	},
	setSession: (session) => {
		console.log('AuthStore - Setting session:', session);
		set({ session });
	},
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	
	// Initialize auth on app start
	initializeAuth: async () => {
		console.log('AuthStore - Initializing auth');
		set({ isLoading: true });
		
		try {
			const response = await authAPI.getCurrentSession();
			console.log('AuthStore - Session check response:', response);
			
			if (response.success && response.user && response.session) {
				console.log('AuthStore - Found active session, setting user and session');
				set({ 
					user: response.user, 
					session: response.session, 
					isLoading: false,
					error: null 
				});
			} else {
				console.log('AuthStore - No active session found');
				set({ 
					user: null, 
					session: null, 
					isLoading: false,
					error: null 
				});
			}
		} catch (error) {
			console.log('AuthStore - Session check error:', error);
			set({ 
				user: null, 
				session: null, 
				isLoading: false,
				error: 'Failed to check session' 
			});
		}
	},
	
	// Login function
	login: async (email: string, password: string) => {
		console.log('AuthStore - Login attempt:', { email });
		set({ isLoading: true, error: null });
		
		try {
			const response = await authAPI.login(email, password);
			console.log('AuthStore - Login response:', response);
			
			if (response.success && response.user && response.session) {
				console.log('AuthStore - Login successful, setting user and session');
				set({ 
					user: response.user, 
					session: response.session, 
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
	
	// Signup function
	signup: async (email: string, password: string, name: string, role?: string) => {
		console.log('AuthStore - Signup attempt:', { email, name, role });
		set({ isLoading: true, error: null });
		
		try {
			const response = await authAPI.signup(email, password, name, role as any);
			console.log('AuthStore - Signup response:', response);
			
			if (response.success && response.user && response.session) {
				console.log('AuthStore - Signup successful, setting user and session');
				set({ 
					user: response.user, 
					session: response.session, 
					isLoading: false,
					error: null 
				});
				return { success: true };
			} else {
				console.log('AuthStore - Signup failed:', response.message);
				set({ 
					isLoading: false, 
					error: response.message || 'Signup failed' 
				});
				return { success: false, error: response.message };
			}
		} catch (error) {
			console.log('AuthStore - Signup error:', error);
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
			const response = await authAPI.logout();
			console.log('AuthStore - Logout response:', response);
			
			if (response.success) {
				console.log('AuthStore - Logout successful, clearing user and session');
				set({ 
					user: null, 
					session: null, 
					isLoading: false,
					error: null 
				});
				return { success: true };
			} else {
				console.log('AuthStore - Logout failed:', response.message);
				set({ 
					isLoading: false, 
					error: response.message || 'Logout failed' 
				});
				return { success: false, error: response.message };
			}
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