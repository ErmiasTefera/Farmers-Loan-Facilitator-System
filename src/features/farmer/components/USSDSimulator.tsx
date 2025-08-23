import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { 
  Phone, 
  ArrowLeft, 
  Send
} from 'lucide-react';
import { useImpersonation } from '@/core/hooks/useImpersonation';

// USSD Menu Types
interface USSDMenuItem {
  id: string;
  text: string;
  action: 'menu' | 'input' | 'result';
  options?: USSDMenuItem[];
  inputType?: 'text' | 'number' | 'phone';
  inputLabel?: string;
  inputPlaceholder?: string;
  validation?: (value: string) => boolean;
  onSelect?: (value?: string) => void;
  result?: any;
}

interface USSDState {
  currentMenu: USSDMenuItem;
  history: USSDMenuItem[];
  inputValue: string;
  isLoading: boolean;
  result?: any;
}

export const USSDSimulator: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [ussdState, setUssdState] = useState<USSDState>({
    currentMenu: getMainMenu(),
    history: [],
    inputValue: '',
    isLoading: false
  });
  const [sessionId] = useState(() => `ussd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const { getEffectiveUser } = useImpersonation();

  // Function to save USSD request to Supabase
  const saveUSSDRequest = async (
    menuLevel: string,
    userInput: string | undefined,
    responseText: string,
    actionType: 'menu_navigation' | 'input_submission' | 'result_display'
  ) => {
    if (!user?.id) return;

    try {
      await farmerAPI.createUSSDRequest({
        farmer_id: user.id,
        session_id: sessionId,
        menu_level: menuLevel,
        user_input: userInput,
        response_text: responseText,
        action_type: actionType
      });
    } catch (error) {
      console.error('Failed to save USSD request:', error);
      // Don't throw error to avoid breaking the USSD flow
    }
  };

  // Main USSD Menu
  function getMainMenu(): USSDMenuItem {
    return {
      id: 'main',
      text: t('ussd.welcome'),
      action: 'menu',
      options: [
        {
          id: 'check-eligibility',
          text: t('ussd.menu.checkEligibility'),
          action: 'menu',
          onSelect: () => handleCheckEligibility()
        },
        {
          id: 'apply-loan',
          text: t('ussd.menu.applyLoan'),
          action: 'menu',
          onSelect: () => handleApplyLoan()
        },
        {
          id: 'check-status',
          text: t('ussd.menu.checkStatus'),
          action: 'menu',
          onSelect: () => handleCheckStatus()
        },
        {
          id: 'make-payment',
          text: t('ussd.menu.makePayment'),
          action: 'menu',
          onSelect: () => handleMakePayment()
        },
        {
          id: 'loan-history',
          text: t('ussd.menu.loanHistory'),
          action: 'menu',
          onSelect: () => handleLoanHistory()
        },
        {
          id: 'view-loan-details',
          text: t('ussd.menu.viewLoanDetails'),
          action: 'menu',
          onSelect: () => handleViewLoanDetails()
        },
        {
          id: 'help',
          text: t('ussd.menu.help'),
          action: 'menu',
          onSelect: () => handleHelp()
        }
      ]
    };
  }

  // Menu Handlers
  const handleCheckEligibility = async () => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('main', '1', t('ussd.menu.checkEligibility'), 'menu_navigation');

    try {
      // Get real eligibility data from Supabase
      const eligibilityResult = await farmerAPI.checkEligibility(user!.id);
      
      const resultText = eligibilityResult.eligible 
        ? t('ussd.eligibility.eligible')
        : t('ussd.eligibility.notEligible');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'eligibility-result',
          text: resultText,
          action: 'result',
          result: eligibilityResult
        },
        isLoading: false
      }));

      // Save result
      await saveUSSDRequest('eligibility-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error checking eligibility:', error);
      
      // Fallback to mock data
      const eligibilityResult = {
        eligible: Math.random() > 0.3,
        creditScore: Math.floor(Math.random() * 100) + 300,
        maxLoanAmount: Math.floor(Math.random() * 50000) + 10000,
        reasons: ['Good payment history', 'Sufficient farm income']
      };

      const resultText = eligibilityResult.eligible 
        ? t('ussd.eligibility.eligible')
        : t('ussd.eligibility.notEligible');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'eligibility-result',
          text: resultText,
          action: 'result',
          result: eligibilityResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('eligibility-result', undefined, resultText, 'result_display');
    }
  };

  const handleApplyLoan = async () => {
    // Save USSD request
    await saveUSSDRequest('main', '2', t('ussd.menu.applyLoan'), 'menu_navigation');

    setUssdState(prev => ({
      ...prev,
      currentMenu: {
        id: 'loan-amount',
        text: t('ussd.loan.enterAmount'),
        action: 'input',
        inputType: 'number',
        inputLabel: t('ussd.loan.amountLabel'),
        inputPlaceholder: t('ussd.loan.amountPlaceholder'),
        validation: (value) => {
          const amount = parseInt(value);
          return amount >= 1000 && amount <= 100000;
        },
        onSelect: (value) => handleLoanAmountSubmit(value!)
      }
    }));
  };

  const handleLoanAmountSubmit = async (amount: string) => {
    // Save USSD request
    await saveUSSDRequest('loan-amount', amount, t('ussd.loan.enterAmount'), 'input_submission');

    setUssdState(prev => ({
      ...prev,
      currentMenu: {
        id: 'loan-purpose',
        text: t('ussd.loan.selectPurpose'),
        action: 'menu',
        options: [
          { 
            id: 'seeds', 
            text: t('ussd.loan.purposes.seeds'), 
            action: 'menu',
            onSelect: () => handleLoanPurposeSubmit(amount, 'seeds')
          },
          { 
            id: 'fertilizer', 
            text: t('ussd.loan.purposes.fertilizer'), 
            action: 'menu',
            onSelect: () => handleLoanPurposeSubmit(amount, 'fertilizer')
          },
          { 
            id: 'equipment', 
            text: t('ussd.loan.purposes.equipment'), 
            action: 'menu',
            onSelect: () => handleLoanPurposeSubmit(amount, 'equipment')
          },
          { 
            id: 'other', 
            text: t('ussd.loan.purposes.other'), 
            action: 'menu',
            onSelect: () => handleLoanPurposeSubmit(amount, 'other')
          }
        ]
      }
    }));
  };

  const handleLoanPurposeSubmit = async (amount: string, purpose: string) => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('loan-purpose', purpose, t('ussd.loan.selectPurpose'), 'menu_navigation');

    try {
      // Create real loan application in Supabase (application_id will be auto-generated by trigger)
      const loanApplication = await farmerAPI.createLoanApplication({
        farmer_id: user!.id,
        amount: parseInt(amount),
        purpose,
        status: 'pending',
        application_date: new Date().toISOString()
      });

      const applicationResult = {
        applicationId: loanApplication.application_id,
        status: loanApplication.status,
        amount: loanApplication.amount,
        purpose: loanApplication.purpose,
        message: t('ussd.loan.applicationSubmitted')
      };

      const resultText = t('ussd.loan.applicationResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'application-result',
          text: resultText,
          action: 'result',
          result: applicationResult
        },
        isLoading: false
      }));

      // Save result
      await saveUSSDRequest('application-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error creating loan application:', error);
      
      // Fallback to mock data
      const mockApplicationId = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
      const applicationResult = {
        applicationId: mockApplicationId.toString(),
        status: 'pending',
        amount: parseInt(amount),
        purpose,
        message: t('ussd.loan.applicationSubmitted')
      };

      const resultText = t('ussd.loan.applicationResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'application-result',
          text: resultText,
          action: 'result',
          result: applicationResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('application-result', undefined, resultText, 'result_display');
    }
  };

  const handleCheckStatus = async () => {
    // Save USSD request
    await saveUSSDRequest('main', '3', t('ussd.menu.checkStatus'), 'menu_navigation');

    setUssdState(prev => ({
      ...prev,
      currentMenu: {
        id: 'enter-application-id',
        text: t('ussd.status.enterApplicationId'),
        action: 'input',
        inputType: 'text',
        inputLabel: t('ussd.status.applicationIdLabel'),
        inputPlaceholder: t('ussd.status.applicationIdPlaceholder'),
        validation: (value) => /^\d{6}$/.test(value),
        onSelect: (value) => handleStatusCheck(value!)
      }
    }));
  };

  const handleStatusCheck = async (applicationId: string) => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('enter-application-id', applicationId, t('ussd.status.enterApplicationId'), 'input_submission');

    try {
      // Get real application status from Supabase using application_id
      const loanApplication = await farmerAPI.getLoanApplicationByApplicationId(applicationId);
      
      if (!loanApplication) {
        const errorText = t('ussd.status.applicationNotFound');
        setUssdState(prev => ({
          ...prev,
          currentMenu: {
            id: 'status-result',
            text: errorText,
            action: 'result',
            result: { error: 'Application not found' }
          },
          isLoading: false
        }));
        await saveUSSDRequest('status-result', undefined, errorText, 'result_display');
        return;
      }

      const statusResult = {
        applicationId: loanApplication.application_id,
        status: loanApplication.status,
        amount: loanApplication.amount,
        appliedDate: new Date(loanApplication.application_date).toLocaleDateString(),
        message: t('ussd.status.statusRetrieved')
      };

      const resultText = t('ussd.status.statusResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'status-result',
          text: resultText,
          action: 'result',
          result: statusResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('status-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error checking application status:', error);
      
      // Fallback to mock data
      const statusResult = {
        applicationId,
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
        amount: 25000,
        appliedDate: new Date().toLocaleDateString(),
        message: t('ussd.status.statusRetrieved')
      };

      const resultText = t('ussd.status.statusResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'status-result',
          text: resultText,
          action: 'result',
          result: statusResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('status-result', undefined, resultText, 'result_display');
    }
  };

  const handleMakePayment = async () => {
    // Save USSD request
    await saveUSSDRequest('main', '4', t('ussd.menu.makePayment'), 'menu_navigation');

    setUssdState(prev => ({
      ...prev,
      currentMenu: {
        id: 'payment-amount',
        text: t('ussd.payment.enterAmount'),
        action: 'input',
        inputType: 'number',
        inputLabel: t('ussd.payment.amountLabel'),
        inputPlaceholder: t('ussd.payment.amountPlaceholder'),
        validation: (value) => parseInt(value) > 0,
        onSelect: (value) => handlePaymentSubmit(value!)
      }
    }));
  };

  const handlePaymentSubmit = async (amount: string) => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('payment-amount', amount, t('ussd.payment.enterAmount'), 'input_submission');

    try {
      // Get the farmer's active loan first
      const loanApplications = await farmerAPI.getLoanApplicationsByFarmer(user!.id);
      const activeLoan = loanApplications.find(app => app.status === 'approved');
      
      if (!activeLoan) {
        const errorText = t('ussd.payment.noActiveLoan');
        setUssdState(prev => ({
          ...prev,
          currentMenu: {
            id: 'payment-error',
            text: errorText,
            action: 'result',
            result: { error: 'No active loan' }
          },
          isLoading: false
        }));
        await saveUSSDRequest('payment-error', undefined, errorText, 'result_display');
        return;
      }

      // Create real payment in Supabase
      const payment = await farmerAPI.createPayment({
        loan_id: activeLoan.loan_id || activeLoan.id, // Use loan_id if available, otherwise use application id
        loan_application_id: activeLoan.id, // Link to the loan application
        farmer_id: user!.farmer_id || user!.id, // Use farmer_id or fallback to user ID
        amount: parseInt(amount),
        payment_date: new Date().toISOString(),
        payment_method: 'ussd',
        reference_number: 'TXN' + Date.now().toString().slice(-8),
        status: 'completed'
      });

      const paymentResult = {
        transactionId: payment.reference_number,
        amount: payment.amount,
        status: payment.status,
        message: t('ussd.payment.paymentSuccessful')
      };

      const resultText = t('ussd.payment.paymentResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'payment-result',
          text: resultText,
          action: 'result',
          result: paymentResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('payment-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error creating payment:', error);
      
      // Fallback to mock data
      const paymentResult = {
        transactionId: 'TXN' + Date.now().toString().slice(-8),
        amount: parseInt(amount),
        status: 'success',
        message: t('ussd.payment.paymentSuccessful')
      };

      const resultText = t('ussd.payment.paymentResult');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'payment-result',
          text: resultText,
          action: 'result',
          result: paymentResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('payment-result', undefined, resultText, 'result_display');
    }
  };

  const handleLoanHistory = async () => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('main', '5', t('ussd.menu.loanHistory'), 'menu_navigation');

    try {
      // Get real loan history from Supabase
      const effectiveUser = getEffectiveUser();
      if (!effectiveUser?.id) return;
      const entityId = effectiveUser.entity_id || effectiveUser.id;
      const loanApplications = await farmerAPI.getLoanApplicationsByFarmer(entityId);
      
      const historyResult = {
        loans: loanApplications.map(app => ({
          id: app.application_id,
          amount: app.amount,
          status: app.status,
          date: new Date(app.application_date).toLocaleDateString()
        })),
        message: t('ussd.history.historyRetrieved')
      };

      const resultText = t('ussd.history.loanHistory');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'history-result',
          text: resultText,
          action: 'result',
          result: historyResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('history-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error fetching loan history:', error);
      
      // Fallback to mock data
      const historyResult = {
        loans: [
          { id: '123456', amount: 15000, status: 'completed', date: '2024-01-15' },
          { id: '789012', amount: 25000, status: 'active', date: '2024-03-20' }
        ],
        message: t('ussd.history.historyRetrieved')
      };

      const resultText = t('ussd.history.loanHistory');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'history-result',
          text: resultText,
          action: 'result',
          result: historyResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('history-result', undefined, resultText, 'result_display');
    }
  };

  const handleViewLoanDetails = async () => {
    setUssdState(prev => ({
      ...prev,
      isLoading: true
    }));

    // Save USSD request
    await saveUSSDRequest('main', '6', t('ussd.menu.viewLoanDetails'), 'menu_navigation');

    try {
      // Get real loan details from Supabase
      const effectiveUser = getEffectiveUser();
      if (!effectiveUser?.id) return;
      const entityId = effectiveUser.entity_id || effectiveUser.id;
      const loanApplications = await farmerAPI.getLoanApplicationsByFarmer(entityId);
      const activeLoan = loanApplications.find(app => app.status === 'approved');
      
      if (!activeLoan) {
        const errorText = t('ussd.loanDetails.noActiveLoan');
        setUssdState(prev => ({
          ...prev,
          currentMenu: {
            id: 'loan-details-error',
            text: errorText,
            action: 'result',
            result: { error: 'No active loan' }
          },
          isLoading: false
        }));
        await saveUSSDRequest('loan-details-error', undefined, errorText, 'result_display');
        return;
      }

      const loanDetailsResult = {
        loanId: activeLoan.application_id,
        amount: activeLoan.amount,
        purpose: activeLoan.purpose,
        status: activeLoan.status,
        applicationDate: new Date(activeLoan.application_date).toLocaleDateString(),
        message: t('ussd.loanDetails.loanDetailsRetrieved')
      };

      const resultText = t('ussd.loanDetails.loanDetails');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'loan-details-result',
          text: resultText,
          action: 'result',
          result: loanDetailsResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('loan-details-result', undefined, resultText, 'result_display');
    } catch (error) {
      console.error('Error fetching loan details:', error);
      
      // Fallback to mock data
      const loanDetailsResult = {
        loanId: '789012',
        amount: 25000,
        purpose: 'Seeds and Fertilizer',
        status: 'approved',
        applicationDate: '2024-03-20',
        message: t('ussd.loanDetails.loanDetailsRetrieved')
      };

      const resultText = t('ussd.loanDetails.loanDetails');

      setUssdState(prev => ({
        ...prev,
        currentMenu: {
          id: 'loan-details-result',
          text: resultText,
          action: 'result',
          result: loanDetailsResult
        },
        isLoading: false
      }));

      await saveUSSDRequest('loan-details-result', undefined, resultText, 'result_display');
    }
  };

  const handleHelp = async () => {
    // Save USSD request
    await saveUSSDRequest('main', '7', t('ussd.menu.help'), 'menu_navigation');

    const helpResult = {
      contact: '+251 911 123 456',
      email: 'support@farmersloan.et',
      hours: '8:00 AM - 6:00 PM',
      message: t('ussd.help.contactInfo')
    };

    setUssdState(prev => ({
      ...prev,
      currentMenu: {
        id: 'help-info',
        text: t('ussd.help.helpInfo'),
        action: 'result',
        result: helpResult
      }
    }));

    await saveUSSDRequest('help-info', undefined, t('ussd.help.helpInfo'), 'result_display');
  };

  // Navigation
  const handleBack = () => {
    if (ussdState.history.length > 0) {
      const previousMenu = ussdState.history[ussdState.history.length - 1];
      setUssdState(prev => ({
        ...prev,
        currentMenu: previousMenu,
        history: prev.history.slice(0, -1),
        inputValue: ''
      }));
    } else {
      // Go back to main menu
      setUssdState(prev => ({
        ...prev,
        currentMenu: getMainMenu(),
        history: [],
        inputValue: ''
      }));
    }
  };

  const handleMenuSelect = (option: USSDMenuItem) => {
    if (option.onSelect) {
      option.onSelect();
    } else if (option.action === 'menu' && option.options) {
      setUssdState(prev => ({
        ...prev,
        currentMenu: option,
        history: [...prev.history, prev.currentMenu],
        inputValue: ''
      }));
    }
  };

  const handleInputSubmit = () => {
    const currentMenu = ussdState.currentMenu;
    if (currentMenu.validation && !currentMenu.validation(ussdState.inputValue)) {
      return; // Invalid input
    }
    
    if (currentMenu.onSelect) {
      currentMenu.onSelect(ussdState.inputValue);
    }
  };

  const handleMainMenu = () => {
    setUssdState(prev => ({
      ...prev,
      currentMenu: getMainMenu(),
      history: [],
      inputValue: ''
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* USSD Phone Interface */}
      <Card className="bg-gray-900 text-green-400 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>USSD Service</span>
            <span className="text-xs">*789#</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* USSD Display */}
          <div className="bg-black p-4 rounded-lg min-h-[200px] font-mono text-sm">
            {ussdState.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-green-400">{ussdState.currentMenu.text}</div>
                
                {ussdState.currentMenu.action === 'menu' && ussdState.currentMenu.options && (
                  <div className="space-y-1">
                    {ussdState.currentMenu.options.map((option, index) => (
                      <div key={option.id} className="flex items-center">
                        <span className="text-yellow-400 mr-2">{index + 1}.</span>
                        <span>{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {ussdState.currentMenu.action === 'input' && (
                  <div className="space-y-2">
                    <div className="text-yellow-400">{ussdState.currentMenu.inputLabel}</div>
                    <div className="bg-gray-800 p-2 rounded">
                      {ussdState.inputValue || '_'}
                    </div>
                  </div>
                )}
                
                {ussdState.currentMenu.action === 'result' && ussdState.currentMenu.result && (
                  <div className="space-y-2">
                    <div className="text-green-400">{ussdState.currentMenu.result.message}</div>
                    {ussdState.currentMenu.result.applicationId && (
                      <div>ID: {ussdState.currentMenu.result.applicationId}</div>
                    )}
                    {ussdState.currentMenu.result.amount && (
                      <div>Amount: ETB {ussdState.currentMenu.result.amount.toLocaleString()}</div>
                    )}
                    {ussdState.currentMenu.result.status && (
                      <div className="flex items-center">
                        Status: 
                        <Badge 
                          variant={ussdState.currentMenu.result.status === 'approved' ? 'default' : 
                                 ussdState.currentMenu.result.status === 'pending' ? 'secondary' : 'destructive'}
                          className="ml-2"
                        >
                          {ussdState.currentMenu.result.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* USSD Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {ussdState.currentMenu.action === 'input' ? (
              <>
                <Input
                  value={ussdState.inputValue}
                  onChange={(e) => setUssdState(prev => ({ ...prev, inputValue: e.target.value }))}
                  placeholder={ussdState.currentMenu.inputPlaceholder}
                  className="col-span-2"
                />
                <Button onClick={handleInputSubmit} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4" />
                </Button>
              </>
            ) : ussdState.currentMenu.action === 'menu' && ussdState.currentMenu.options ? (
              ussdState.currentMenu.options.map((option, index) => (
                <Button
                  key={option.id}
                  onClick={() => handleMenuSelect(option)}
                  className="bg-gray-700 hover:bg-gray-600 text-green-400"
                >
                  {index + 1}
                </Button>
              ))
            ) : (
              <Button onClick={handleMainMenu} className="col-span-3 bg-green-600 hover:bg-green-700">
                Main Menu
              </Button>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={ussdState.history.length === 0}
              className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMainMenu}
              className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
            >
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>How to Use USSD</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Dial <strong>*789#</strong> on your mobile phone</p>
          <p>• Follow the menu prompts by pressing the corresponding numbers</p>
          <p>• Use the back button to return to previous menus</p>
          <p>• This service works on all mobile phones, even without internet</p>
        </CardContent>
      </Card>
    </div>
  );
};
