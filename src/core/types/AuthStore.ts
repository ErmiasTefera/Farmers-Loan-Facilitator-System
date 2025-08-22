// Auth store types
import type { User } from './database.types';

export interface AuthStore {
	user: User | null;
	session: any | null; // Supabase session
	isLoading: boolean;
	error: string | null;
	setUser: (user: User | null) => void;
	setSession: (session: any | null) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signup: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<{ success: boolean; error?: string }>;
	clearError: () => void;
	initializeAuth: () => Promise<void>;
}

// Legacy AppUser interface for backward compatibility
export interface AppUser extends User {}



