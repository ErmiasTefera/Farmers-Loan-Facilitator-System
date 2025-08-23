import { supabase } from '@/core/api/supabase-client';
import type { 
  LoanApplication, 
  Farmer,
  LoanApplicationUpdate
} from '@/core/types/database.types';

/**
 * Financial Institution API - Optimized for Performance
 * 
 * This API uses Supabase's powerful query capabilities to minimize API calls:
 * - Single queries with joins instead of multiple separate calls
 * - Efficient data fetching with proper relationships
 * - Optimized portfolio calculations from aggregated data
 * 
 * Key optimizations:
 * 1. getAllLoanApplications: Single query fetches applications + farmers + payments
 * 2. getPortfolioMetrics: Uses the same data structure for calculations
 * 3. getDashboardData: Reuses getAllLoanApplications data for metrics
 * 4. Risk assessment: Calculated from already-fetched data
 */
export interface PortfolioMetrics {
  totalLoans: number;
  activeLoans: number;
  totalPortfolioValue: number;
  averageLoanAmount: number;
  repaymentRate: number;
  defaultRate: number;
  monthlyDisbursements: number;
  monthlyCollections: number;
}

export interface LoanApplicationWithDetails extends LoanApplication {
  farmer?: Farmer;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    payment_date: string;
  }>;
  riskScore?: number;
  recommendation?: 'approve' | 'reject' | 'review';
  decisionNotes?: string;
}

export interface RiskAssessment {
  creditScore: number;
  riskFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'approve' | 'reject' | 'review';
  maxLoanAmount: number;
  suggestedTerms: {
    amount: number;
    term_months: number;
    interest_rate: number;
  };
}

export const financialInstitutionAPI = {
  // Portfolio Management
  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    try {
      // Get all loan applications with payments in a single query
      const { data: loanApplications, error: loanError } = await supabase
        .from('loan_applications')
        .select(`
          *,
          farmer:farmer_id(*),
          payments:payments!loan_application_id(*)
        `)
        .order('created_at', { ascending: false });

      if (loanError) throw loanError;

      // Extract all payments from loan applications
      const allPayments = (loanApplications || []).flatMap(app => app.payments || []);

      // Calculate metrics
      const totalLoans = loanApplications?.length || 0;
      const activeLoans = loanApplications?.filter(loan => loan.status === 'approved').length || 0;
      const totalPortfolioValue = loanApplications
        ?.filter(loan => loan.status === 'approved')
        .reduce((sum, loan) => sum + loan.amount, 0) || 0;
      
      const averageLoanAmount = totalLoans > 0 ? totalPortfolioValue / totalLoans : 0;

      // Calculate repayment rate
      const completedPayments = allPayments.filter(p => p.status === 'completed').length || 0;
      const totalPayments = allPayments.length || 0;
      const repaymentRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

      // Calculate default rate (simplified - loans with no payments in 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const defaultedLoans = loanApplications?.filter(loan => {
        if (loan.status !== 'approved') return false;
        const loanPayments = allPayments.filter(p => 
          p.loan_application_id === loan.id || 
          (loan.loan_id && p.loan_id === loan.loan_id)
        );
        const hasRecentPayment = loanPayments.some(p => 
          new Date(p.payment_date) > thirtyDaysAgo
        );
        return !hasRecentPayment;
      }).length || 0;

      const defaultRate = activeLoans > 0 ? (defaultedLoans / activeLoans) * 100 : 0;

      // Calculate monthly metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyDisbursements = loanApplications
        ?.filter(loan => {
          const loanDate = new Date(loan.created_at);
          return loan.status === 'approved' && 
                 loanDate.getMonth() === currentMonth && 
                 loanDate.getFullYear() === currentYear;
        })
        .reduce((sum, loan) => sum + loan.amount, 0) || 0;

      const monthlyCollections = allPayments
        .filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return payment.status === 'completed' && 
                 paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + payment.amount, 0) || 0;

      return {
        totalLoans,
        activeLoans,
        totalPortfolioValue,
        averageLoanAmount,
        repaymentRate,
        defaultRate,
        monthlyDisbursements,
        monthlyCollections
      };
    } catch (error) {
      console.error('Error fetching portfolio metrics:', error);
      throw new Error('Failed to fetch portfolio metrics');
    }
  },

  // Loan Application Management
  async getAllLoanApplications(): Promise<LoanApplicationWithDetails[]> {
    try {
      // Fetch all loan applications with farmer data and payments in a single query
      const { data: loanApplications, error } = await supabase
        .from('loan_applications')
        .select(`
          *,
          farmer:farmer_id(*),
          payments:payments!loan_application_id(id, amount, status, payment_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data and calculate risk scores
      const applicationsWithPayments = (loanApplications || []).map((application) => {
        // Also fetch payments by loan_id if loan_application_id doesn't have payments
        const loanPayments = application.payments || [];
        
        return {
          ...application,
          payments: loanPayments,
          riskScore: this.calculateRiskScore(application, loanPayments),
          recommendation: this.getRecommendation(application, loanPayments),
          decisionNotes: application.notes || ''
        };
      });

      return applicationsWithPayments;
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      throw new Error('Failed to fetch loan applications');
    }
  },

  async getLoanApplicationById(applicationId: string): Promise<LoanApplicationWithDetails | null> {
    try {
      // Fetch loan application with farmer data and payments in a single query
      const { data: application, error } = await supabase
        .from('loan_applications')
        .select(`
          *,
          farmer:farmer_id(*),
          payments:payments!loan_application_id(id, amount, status, payment_date)
        `)
        .eq('id', applicationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      const loanPayments = application.payments || [];
      const riskScore = this.calculateRiskScore(application, loanPayments);
      const recommendation = this.getRecommendation(application, loanPayments);

      return {
        ...application,
        payments: loanPayments,
        riskScore,
        recommendation,
        decisionNotes: application.notes || ''
      };
    } catch (error) {
      console.error('Error fetching loan application:', error);
      throw new Error('Failed to fetch loan application');
    }
  },

  async updateLoanApplicationStatus(
    applicationId: string, 
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<LoanApplication> {
    try {
      const updateData: LoanApplicationUpdate = {
        status,
        notes: notes || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select('*, farmer:farmer_id(*)')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating loan application status:', error);
      throw new Error('Failed to update loan application status');
    }
  },

  // Risk Assessment
  async assessRisk(applicationId: string): Promise<RiskAssessment> {
    try {
      const application = await this.getLoanApplicationById(applicationId);
      if (!application) {
        throw new Error('Loan application not found');
      }

      const riskScore = this.calculateRiskScore(application, application.payments || []);
      const riskFactors = this.identifyRiskFactors(application, application.payments || []);
      const riskLevel = this.determineRiskLevel(riskScore);
      const recommendation = this.getRecommendation(application, application.payments || []);
      const maxLoanAmount = this.calculateMaxLoanAmount(riskScore, application.farmer);
      const suggestedTerms = this.suggestLoanTerms(riskScore, application.amount, application.farmer);

      return {
        creditScore: riskScore,
        riskFactors,
        riskLevel,
        recommendation,
        maxLoanAmount,
        suggestedTerms
      };
    } catch (error) {
      console.error('Error assessing risk:', error);
      throw new Error('Failed to assess risk');
    }
  },

  // Dashboard Data
  async getDashboardData(): Promise<{
    portfolioMetrics: PortfolioMetrics;
    recentApplications: LoanApplicationWithDetails[];
    pendingDecisions: LoanApplicationWithDetails[];
    alerts: Array<{
      id: string;
      type: 'overdue' | 'high_risk' | 'large_loan';
      message: string;
      urgent: boolean;
    }>;
  }> {
    try {
      // Get all applications with payments in a single optimized query
      const allApplications = await this.getAllLoanApplications();
      
      // Calculate portfolio metrics from the same data
      const portfolioMetrics = this.calculatePortfolioMetricsFromApplications(allApplications);

      const recentApplications = allApplications.slice(0, 5);
      const pendingDecisions = allApplications.filter(app => app.status === 'pending');

      // Generate alerts
      const alerts = [];
      
      // Overdue payments alert
      const overdueLoans = allApplications.filter(app => {
        if (app.status !== 'approved') return false;
        const lastPayment = app.payments?.sort((a, b) => 
          new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
        )[0];
        
        if (!lastPayment) return true; // No payments made
        
        const daysSincePayment = Math.floor(
          (Date.now() - new Date(lastPayment.payment_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return daysSincePayment > 30;
      });

      if (overdueLoans.length > 0) {
        alerts.push({
          id: 'overdue_payments',
          type: 'overdue' as const,
          message: `${overdueLoans.length} loans have overdue payments`,
          urgent: true
        });
      }

      // High risk applications alert
      const highRiskApplications = pendingDecisions.filter(app => 
        (app.riskScore || 0) > 700
      );

      if (highRiskApplications.length > 0) {
        alerts.push({
          id: 'high_risk_applications',
          type: 'high_risk' as const,
          message: `${highRiskApplications.length} high-risk applications pending review`,
          urgent: true
        });
      }

      // Large loan applications alert
      const largeLoans = pendingDecisions.filter(app => app.amount > 50000);

      if (largeLoans.length > 0) {
        alerts.push({
          id: 'large_loans',
          type: 'large_loan' as const,
          message: `${largeLoans.length} large loan applications (>50,000 ETB) pending`,
          urgent: false
        });
      }

      return {
        portfolioMetrics,
        recentApplications,
        pendingDecisions,
        alerts
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  },

  // Helper method to calculate portfolio metrics from applications data
  calculatePortfolioMetricsFromApplications(applications: LoanApplicationWithDetails[]): PortfolioMetrics {
    const totalLoans = applications.length;
    const activeLoans = applications.filter(loan => loan.status === 'approved').length;
    const totalPortfolioValue = applications
      .filter(loan => loan.status === 'approved')
      .reduce((sum, loan) => sum + loan.amount, 0);
    
    const averageLoanAmount = totalLoans > 0 ? totalPortfolioValue / totalLoans : 0;

    // Calculate repayment rate from all payments
    const allPayments = applications.flatMap(app => app.payments || []);
    const completedPayments = allPayments.filter(p => p.status === 'completed').length;
    const totalPayments = allPayments.length;
    const repaymentRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

    // Calculate default rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const defaultedLoans = applications.filter(loan => {
      if (loan.status !== 'approved') return false;
      const loanPayments = loan.payments || [];
      const hasRecentPayment = loanPayments.some(p => 
        new Date(p.payment_date) > thirtyDaysAgo
      );
      return !hasRecentPayment;
    }).length;

    const defaultRate = activeLoans > 0 ? (defaultedLoans / activeLoans) * 100 : 0;

    // Calculate monthly metrics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyDisbursements = applications
      .filter(loan => {
        const loanDate = new Date(loan.created_at);
        return loan.status === 'approved' && 
               loanDate.getMonth() === currentMonth && 
               loanDate.getFullYear() === currentYear;
      })
      .reduce((sum, loan) => sum + loan.amount, 0);

    const monthlyCollections = allPayments
      .filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return payment.status === 'completed' && 
               paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalLoans,
      activeLoans,
      totalPortfolioValue,
      averageLoanAmount,
      repaymentRate,
      defaultRate,
      monthlyDisbursements,
      monthlyCollections
    };
  },

  // Helper methods for risk assessment
  calculateRiskScore(application: LoanApplication, payments: Array<{ status: string }>): number {
    let score = 300; // Base score

    // Factor 1: Loan amount (higher amount = higher risk)
    if (application.amount > 100000) score += 200;
    else if (application.amount > 50000) score += 100;
    else if (application.amount > 10000) score += 50;

    // Factor 2: Payment history
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const totalPayments = payments.length;
    const paymentRate = totalPayments > 0 ? completedPayments / totalPayments : 0;
    
    if (paymentRate >= 0.9) score -= 100;
    else if (paymentRate >= 0.7) score -= 50;
    else if (paymentRate < 0.5) score += 150;

    // Factor 3: Farmer verification status
    if (application.farmer?.verification_status === 'verified') score -= 50;
    else if (application.farmer?.verification_status === 'rejected') score += 200;

    // Factor 4: Credit score
    const farmerCreditScore = application.farmer?.credit_score || 300;
    if (farmerCreditScore >= 700) score -= 100;
    else if (farmerCreditScore >= 500) score -= 50;
    else if (farmerCreditScore < 300) score += 150;

    // Factor 5: Application purpose
    const highRiskPurposes = ['business_expansion', 'debt_consolidation'];
    if (highRiskPurposes.includes(application.purpose)) score += 50;

    return Math.max(100, Math.min(900, score));
  },

  identifyRiskFactors(application: LoanApplication, payments: Array<{ status: string }>): string[] {
    const factors = [];

    if (application.amount > 100000) {
      factors.push('High loan amount');
    }

    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const totalPayments = payments.length;
    const paymentRate = totalPayments > 0 ? completedPayments / totalPayments : 0;
    
    if (paymentRate < 0.5) {
      factors.push('Poor payment history');
    }

    if (application.farmer?.verification_status === 'rejected') {
      factors.push('Farmer verification rejected');
    }

    if ((application.farmer?.credit_score || 300) < 300) {
      factors.push('Low credit score');
    }

    const highRiskPurposes = ['business_expansion', 'debt_consolidation'];
    if (highRiskPurposes.includes(application.purpose)) {
      factors.push('High-risk loan purpose');
    }

    return factors;
  },

  determineRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore < 400) return 'low';
    if (riskScore < 600) return 'medium';
    return 'high';
  },

  getRecommendation(application: LoanApplication, payments: Array<{ status: string }>): 'approve' | 'reject' | 'review' {
    const riskScore = this.calculateRiskScore(application, payments);
    
    if (riskScore < 400) return 'approve';
    if (riskScore > 700) return 'reject';
    return 'review';
  },

  calculateMaxLoanAmount(riskScore: number, farmer?: Farmer): number {
    const baseAmount = 10000;
    const creditMultiplier = (farmer?.credit_score || 300) / 100;
    const riskMultiplier = 1 - (riskScore / 1000);
    
    return Math.round(baseAmount * creditMultiplier * riskMultiplier);
  },

  suggestLoanTerms(riskScore: number, requestedAmount: number, farmer?: Farmer): {
    amount: number;
    term_months: number;
    interest_rate: number;
  } {
    const maxAmount = this.calculateMaxLoanAmount(riskScore, farmer);
    const suggestedAmount = Math.min(requestedAmount, maxAmount);
    
    let interestRate = 12; // Base rate
    if (riskScore > 600) interestRate += 5;
    if (riskScore > 700) interestRate += 5;
    
    let termMonths = 12; // Base term
    if (suggestedAmount > 50000) termMonths = 24;
    if (suggestedAmount > 100000) termMonths = 36;
    
    return {
      amount: suggestedAmount,
      term_months: termMonths,
      interest_rate: interestRate
    };
  }
};
