import { supabase } from '@/core/api/supabase-client';
import type { User, UserRole } from '@/core/types/database.types';

// Demo user credentials (for development/testing)
export const DEMO_CREDENTIALS = {
  email: 'ermiastefera21@gmail.com',
  password: 'pass2pass',
  name: 'Demo User',
  role: 'farmer' as UserRole
};

// API response interface
interface AuthResponse {
  success: boolean;
  user?: User;
  session?: any;
  message?: string;
  error?: any;
}

export const authAPI = {
  // Supabase login
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthAPI - Login error:', error);
        return {
          success: false,
          message: error.message || 'Login failed',
          error
        };
      }

      if (data.user && data.session) {
        // Get user profile from our custom users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('AuthAPI - Profile fetch error:', profileError);
          return {
            success: false,
            message: 'Failed to fetch user profile',
            error: profileError
          };
        }

        return {
          success: true,
          user: userProfile,
          session: data.session
        };
      }

      return {
        success: false,
        message: 'Login failed - no user data received'
      };
    } catch (error) {
      console.error('AuthAPI - Login exception:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error
      };
    }
  },

  // Supabase signup
  async signup(email: string, password: string, name: string, role: UserRole = 'farmer'): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        console.error('AuthAPI - Signup error:', error);
        return {
          success: false,
          message: error.message || 'Signup failed',
          error
        };
      }

      if (data.user && data.session) {
        // Create user profile in our custom users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            role
          })
          .select()
          .single();

        if (profileError) {
          console.error('AuthAPI - Profile creation error:', profileError);
          return {
            success: false,
            message: 'Failed to create user profile',
            error: profileError
          };
        }

        return {
          success: true,
          user: userProfile,
          session: data.session
        };
      }

      return {
        success: false,
        message: 'Signup failed - no user data received'
      };
    } catch (error) {
      console.error('AuthAPI - Signup exception:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error
      };
    }
  },

  // Supabase logout
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('AuthAPI - Logout error:', error);
        return {
          success: false,
          message: error.message || 'Logout failed',
          error
        };
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('AuthAPI - Logout exception:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error
      };
    }
  },

  // Supabase forgot password
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('AuthAPI - Forgot password error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send reset email',
          error
        };
      }

      return {
        success: true,
        message: `Password reset link sent to ${email}`
      };
    } catch (error) {
      console.error('AuthAPI - Forgot password exception:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error
      };
    }
  },

  // Get current session
  async getCurrentSession(): Promise<AuthResponse> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('AuthAPI - Get session error:', error);
        return {
          success: false,
          message: error.message || 'Failed to get session',
          error
        };
      }

      if (session?.user) {
        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('AuthAPI - Profile fetch error:', profileError);
          return {
            success: false,
            message: 'Failed to fetch user profile',
            error: profileError
          };
        }

        return {
          success: true,
          user: userProfile,
          session
        };
      }

      return {
        success: false,
        message: 'No active session'
      };
    } catch (error) {
      console.error('AuthAPI - Get session exception:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error
      };
    }
  }
};
