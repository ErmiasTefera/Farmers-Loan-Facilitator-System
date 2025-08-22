// Loan-related components
export { 
  LoanStatusIcon, 
  LoanStatusBadge, 
  getLoanStatus,
  type LoanStatus 
} from './loan/LoanStatus';

export { 
  LoanCard,
  type LoanCardData 
} from './loan/LoanCard';

export { 
  LoanSummary,
  EmptyLoanSummary,
  type LoanSummaryData 
} from './loan/LoanSummary';

// Display components
export { 
  PaymentHistory,
  PaymentRow,
  type PaymentData 
} from './display/PaymentHistory';

export {
  EligibilityDisplay,
  type EligibilityResult
} from './display/EligibilityDisplay';
