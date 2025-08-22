import type { AppUser } from '@/core/types/AuthStore';

// Demo user credentials
export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
  name: 'Demo User'
};

// Mock user data
const mockUser: AppUser = {
  id: '1',
  email: DEMO_CREDENTIALS.email,
  name: DEMO_CREDENTIALS.name,
  role: 'user'
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
interface AuthResponse {
  success: boolean;
  user?: AppUser;
  token?: string;
  message?: string;
}

export const authAPI = {
  // Mock login
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay
    
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const token = `mock-jwt-token-${Date.now()}`;
      return {
        success: true,
        user: mockUser,
        token
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  },

  // Mock signup
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay
    
    // Check if email already exists (demo email)
    if (email === DEMO_CREDENTIALS.email) {
      return {
        success: false,
        message: 'Email already exists'
      };
    }
    
    const newUser: AppUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user'
    };
    
    const token = `mock-jwt-token-${Date.now()}`;
    
    console.log('AuthAPI - Signup successful:', newUser, password);
    return {
      success: true,
      user: newUser,
      token
    };
  },

  // Mock logout
  async logout(): Promise<AuthResponse> {
    await delay(500); // Simulate network delay
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  // Mock forgot password
  async forgotPassword(email: string): Promise<AuthResponse> {
    await delay(1000); // Simulate network delay
    
    return {
      success: true,
      message: `Password reset link sent to ${email}`
    };
  }
};
