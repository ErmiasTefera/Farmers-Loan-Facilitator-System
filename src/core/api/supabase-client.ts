import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh the session
    autoRefreshToken: true,
    // Persist the session in localStorage
    persistSession: true,
    // Detect session in URL (for magic links)
    detectSessionInUrl: true,
  },
  realtime: {
    // Enable real-time subscriptions
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export types for better TypeScript support
export type SupabaseClient = typeof supabase;
