import { supabase } from '@/core/api/supabase-client';
import type { 
  USSDRequest, 
  LoanApplication, 
  Payment, 
  FarmerProfile,
  USSDRequestInsert,
  LoanApplicationInsert,
  PaymentInsert
} from '@/core/types/database.types';

export const farmerAPI = {
  // USSD Request Management
  async createUSSDRequest(request: USSDRequestInsert): Promise<USSDRequest> {
    const { data, error } = await supabase
      .from('ussd_requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      console.error('Error creating USSD request:', error);
      throw new Error(`Failed to create USSD request: ${error.message}`);
    }

    return data;
  },

  async getUSSDRequestsByFarmer(farmerId: string): Promise<USSDRequest[]> {
    const { data, error } = await supabase
      .from('ussd_requests')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching USSD requests:', error);
      throw new Error(`Failed to fetch USSD requests: ${error.message}`);
    }

    return data || [];
  },

  // Loan Application Management
  async createLoanApplication(application: LoanApplicationInsert): Promise<LoanApplication> {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert(application)
      .select()
      .single();

    if (error) {
      console.error('Error creating loan application:', error);
      throw new Error(`Failed to create loan application: ${error.message}`);
    }

    return data;
  },

  async getLoanApplicationsByFarmer(farmerId: string): Promise<LoanApplication[]> {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loan applications:', error);
      throw new Error(`Failed to fetch loan applications: ${error.message}`);
    }

    return data || [];
  },

  async getLoanApplicationById(applicationId: string): Promise<LoanApplication | null> {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching loan application:', error);
      throw new Error(`Failed to fetch loan application: ${error.message}`);
    }

    return data;
  },

  async getLoanApplicationByApplicationId(applicationId: string): Promise<LoanApplication | null> {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching loan application by application ID:', error);
      throw new Error(`Failed to fetch loan application: ${error.message}`);
    }

    return data;
  },

  async updateLoanApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<LoanApplication> {
    const { data, error } = await supabase
      .from('loan_applications')
      .update({ 
        status, 
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating loan application:', error);
      throw new Error(`Failed to update loan application: ${error.message}`);
    }

    return data;
  },

  // Payment Management
  async createPayment(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    return data;
  },

  async getPaymentsByFarmer(farmerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return data || [];
  },

  // Farmer Profile Management
  async getFarmerProfile(farmerId: string): Promise<FarmerProfile | null> {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('user_id', farmerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching farmer profile:', error);
      throw new Error(`Failed to fetch farmer profile: ${error.message}`);
    }

    return data;
  },

  async updateFarmerProfile(
    farmerId: string, 
    updates: Partial<FarmerProfile>
  ): Promise<FarmerProfile> {
    const { data, error } = await supabase
      .from('farmers')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', farmerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating farmer profile:', error);
      throw new Error(`Failed to update farmer profile: ${error.message}`);
    }

    return data;
  },

  // Eligibility Check
  async checkEligibility(farmerId: string): Promise<{
    eligible: boolean;
    creditScore: number;
    maxLoanAmount: number;
    reasons: string[];
  }> {
    try {
      // Get farmer's payment history
      const payments = await this.getPaymentsByFarmer(farmerId);
      const loanApplications = await this.getLoanApplicationsByFarmer(farmerId);
      const farmerProfile = await this.getFarmerProfile(farmerId);

      // Calculate credit score based on payment history
      const onTimePayments = payments.filter(p => p.status === 'completed').length;
      const totalPayments = payments.length;
      const paymentRate = totalPayments > 0 ? onTimePayments / totalPayments : 0;

      // Base credit score calculation
      let creditScore = 300; // Base score
      creditScore += Math.floor(paymentRate * 400); // Up to 400 points for payment history
      creditScore += Math.min(loanApplications.length * 50, 200); // Up to 200 points for loan history

      // Adjust based on farmer profile
      if (farmerProfile?.verification_status === 'verified') {
        creditScore += 100;
      }

      const eligible = creditScore >= 500;
      const maxLoanAmount = eligible ? Math.min(creditScore * 100, 100000) : 0;
      const reasons = [];

      if (paymentRate >= 0.8) {
        reasons.push('Good payment history');
      }
      if (farmerProfile?.verification_status === 'verified') {
        reasons.push('Verified farmer profile');
      }
      if (loanApplications.length > 0) {
        reasons.push('Previous loan experience');
      }

      // If no farmer profile exists, add a note
      if (!farmerProfile) {
        reasons.push('Profile needs verification');
      }

      return {
        eligible,
        creditScore: Math.min(creditScore, 900),
        maxLoanAmount,
        reasons
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw new Error('Failed to check eligibility');
    }
  },

  // Dashboard Data
  async getDashboardData(farmerId: string): Promise<{
    activeLoan: any;
    creditScore: number;
    recentPayments: Payment[];
    notifications: any[];
  }> {
    try {
      const [payments, loanApplications, eligibility] = await Promise.all([
        this.getPaymentsByFarmer(farmerId),
        this.getLoanApplicationsByFarmer(farmerId),
        this.checkEligibility(farmerId)
      ]);

      // Get active loan
      const activeLoan = loanApplications.find(app => app.status === 'approved') || null;

      // Get recent payments (last 5)
      const recentPayments = payments.slice(0, 5);

      // Generate notifications
      const notifications = [];
      
      if (activeLoan) {
        const nextPaymentDate = new Date(activeLoan.created_at);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilPayment <= 5) {
          notifications.push({
            id: 'payment-due',
            type: 'payment',
            message: `Payment due in ${daysUntilPayment} days`,
            urgent: true
          });
        }
      }

      if (eligibility.eligible && !activeLoan) {
        notifications.push({
          id: 'loan-available',
          type: 'info',
          message: 'New loan products available',
          urgent: false
        });
      }

      return {
        activeLoan,
        creditScore: eligibility.creditScore,
        recentPayments,
        notifications
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
};
