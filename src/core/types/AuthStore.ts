// Auth store types
export interface AuthStore {
	user: AppUser | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	setUser: (user: AppUser | null) => void;
	setToken: (token: string | null) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<{ success: boolean; error?: string }>;
	clearError: () => void;
}

export interface AppUser {
    id: string;
    email: string;
    name: string;
    role: string;
}



