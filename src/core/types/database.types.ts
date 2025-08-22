// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'farmer' | 'data-collector' | 'loan-officer' | 'admin';
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'farmer' | 'data-collector' | 'loan-officer' | 'admin';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'farmer' | 'data-collector' | 'loan-officer' | 'admin';
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      farmers: {
        Row: {
          id: string;
          user_id: string;
          farmer_id: string;
          full_name: string;
          phone: string | null;
          village: string | null;
          district: string | null;
          region: string | null;
          farm_size_hectares: number | null;
          primary_crop: string | null;
          secondary_crops: string[] | null;
          annual_income: number | null;
          credit_score: number;
          verification_status: 'pending' | 'verified' | 'rejected';
          assigned_collector_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          farmer_id: string;
          full_name: string;
          phone?: string | null;
          village?: string | null;
          district?: string | null;
          region?: string | null;
          farm_size_hectares?: number | null;
          primary_crop?: string | null;
          secondary_crops?: string[] | null;
          annual_income?: number | null;
          credit_score?: number;
          verification_status?: 'pending' | 'verified' | 'rejected';
          assigned_collector_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farmer_id?: string;
          full_name?: string;
          phone?: string | null;
          village?: string | null;
          district?: string | null;
          region?: string | null;
          farm_size_hectares?: number | null;
          primary_crop?: string | null;
          secondary_crops?: string[] | null;
          annual_income?: number | null;
          credit_score?: number;
          verification_status?: 'pending' | 'verified' | 'rejected';
          assigned_collector_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          farmer_id: string;
          loan_amount: number;
          interest_rate: number;
          term_months: number;
          purpose: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
          approved_by: string | null;
          approved_at: string | null;
          disbursed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          loan_amount: number;
          interest_rate: number;
          term_months: number;
          purpose?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
          approved_by?: string | null;
          approved_at?: string | null;
          disbursed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          loan_amount?: number;
          interest_rate?: number;
          term_months?: number;
          purpose?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
          approved_by?: string | null;
          approved_at?: string | null;
          disbursed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          loan_id: string;
          amount: number;
          payment_date: string;
          payment_method: string | null;
          reference_number: string | null;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          amount: number;
          payment_date: string;
          payment_method?: string | null;
          reference_number?: string | null;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: string | null;
          reference_number?: string | null;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      ussd_requests: {
        Row: {
          id: string;
          farmer_id: string;
          session_id: string;
          menu_level: string;
          user_input?: string;
          response_text: string;
          action_type: 'menu_navigation' | 'input_submission' | 'result_display';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          session_id: string;
          menu_level: string;
          user_input?: string;
          response_text: string;
          action_type: 'menu_navigation' | 'input_submission' | 'result_display';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          session_id?: string;
          menu_level?: string;
          user_input?: string;
          response_text?: string;
          action_type?: 'menu_navigation' | 'input_submission' | 'result_display';
          created_at?: string;
          updated_at?: string;
        };
      };
      loan_applications: {
        Row: {
          id: string;
          farmer_id: string;
          amount: number;
          purpose: string;
          status: 'pending' | 'approved' | 'rejected';
          notes?: string;
          application_date: string;
          application_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          amount: number;
          purpose: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string;
          application_date?: string;
          application_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          amount?: number;
          purpose?: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string;
          application_date?: string;
          application_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific table types
export type User = Tables<'users'>;
export type Farmer = Tables<'farmers'>;
export type Loan = Tables<'loans'>;
export type Payment = Tables<'payments'>;
export type USSDRequest = Tables<'ussd_requests'>;
export type LoanApplication = Tables<'loan_applications'>;

// Helper types for database operations
export type UserRow = User;
export type UserInsert = Inserts<'users'>;
export type UserUpdate = Updates<'users'>;

export type FarmerRow = Farmer;
export type FarmerInsert = Inserts<'farmers'>;
export type FarmerUpdate = Updates<'farmers'>;

export type LoanRow = Loan;
export type LoanInsert = Inserts<'loans'>;
export type LoanUpdate = Updates<'loans'>;

export type PaymentRow = Payment;
export type PaymentInsert = Inserts<'payments'>;
export type PaymentUpdate = Updates<'payments'>;

export type USSDRequestRow = USSDRequest;
export type USSDRequestInsert = Inserts<'ussd_requests'>;
export type USSDRequestUpdate = Updates<'ussd_requests'>;

export type LoanApplicationRow = LoanApplication;
export type LoanApplicationInsert = Inserts<'loan_applications'>;
export type LoanApplicationUpdate = Updates<'loan_applications'>;

// Farmer Profile type alias
export type FarmerProfile = Farmer;

// User role type
export type UserRole = 'farmer' | 'data-collector' | 'loan-officer' | 'admin';

// Verification status type
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Loan status type
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';

// Payment status type
export type PaymentStatus = 'pending' | 'completed' | 'failed';
