export const farmer = {
  en: {
    // Layout and Navigation
    layout: {
      title: 'Farmer Portal',
      quickNavigation: 'Quick Navigation',
      dashboard: 'Dashboard',
      dashboardDescription: 'View your loan overview and stats',
      myLoans: 'My Loans',
      myLoansDescription: 'View all your loan applications',
      ussdSimulator: 'USSD Simulator',
      ussdSimulatorDescription: 'Test the USSD interface',
      backToDashboard: 'Back to Dashboard',
      logout: 'Logout'
    },

    // Dashboard
    dashboard: {
      title: 'Farmer Dashboard',
      welcome: 'Welcome to your farmer dashboard. Here you can view your loan status, make payments, and access important information about your farming activities.',
      loading: 'Loading dashboard...',
      unableToLoad: 'Unable to load dashboard data',
      
      // Quick Actions
      quickActions: 'Quick Actions',
      ussdService: 'USSD Service',
      makePayment: 'Make Payment',
      loanHistory: 'Loan History',
      
      // Credit Score
      creditScore: 'Credit Score',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      creditRating: 'Credit Rating',
      higherScoresNote: 'Higher scores increase your loan eligibility and reduce interest rates',
      
      // Farming Tips
      farmingTips: 'Farming Tips',
      seasonalAdvisory: 'Seasonal Advisory',
      seasonalAdvisoryText: 'Consider planting drought-resistant crops this season due to expected low rainfall.',
      marketPrice: 'Market Price',
      marketPriceText: 'Current maize price: ETB 2,500 per quintal. Good time to plan harvest.',
      financialTip: 'Financial Tip',
      financialTipText: 'Save 10% of your harvest income for next season\'s inputs.',
      
      // Recent Activity
      recentPayments: 'Recent Payments',
      notifications: 'Notifications',
      quickAccess: 'Quick Access',
      applyForLoan: 'Apply for Loan',
      paymentSchedule: 'Payment Schedule',
      checkEligibility: 'Check Eligibility',
      helpSupport: 'Help & Support',
      
      // Statistics
      totalLoans: 'Total Loans',
      pending: 'Pending',
      approved: 'Approved',
      totalAmount: 'Total Amount'
    },

    // Loan List
    loans: {
      title: 'My Loans',
      searchPlaceholder: 'Search loans by purpose or application ID...',
      noLoansFound: 'No loans found',
      noLoansMatch: 'No loans match your current filters.',
      noLoansYet: 'You haven\'t applied for any loans yet.',
      applyForLoan: 'Apply for Loan',
      viewDetails: 'View Details',
      cancel: 'Cancel',
      loadingLoans: 'Loading loans...',
      
      // Filters
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      
      // Quick Actions
      applyForNewLoan: 'Apply for New Loan',
      checkEligibility: 'Check Eligibility',
      makePayment: 'Make Payment'
    },

    // Loan Details
    loanDetails: {
      makePayment: 'Make Payment',
      downloadDocuments: 'Download Documents',
      shareDetails: 'Share Details',
      documents: 'Documents',
      overview: 'Overview',
      payments: 'Payments',
      timeline: 'Timeline'
    },

    // Apply Loan
    applyLoan: {
      title: 'Apply for Loan',
      loadingProfile: 'Loading Your Profile',
      loadingProfileText: 'We\'re loading your farming information to pre-fill the application...',
      step1: 'Loan Purpose',
      step2: 'Loan Amount',
      step3: 'Additional Information',
      step4: 'Review & Submit',
      
      // Steps
      purpose: {
        title: 'What do you need the loan for?',
        description: 'Select the primary purpose for your loan application',
        seeds: 'Seeds',
        fertilizer: 'Fertilizer',
        equipment: 'Equipment',
        irrigation: 'Irrigation',
        other: 'Other'
      },
      
      amount: {
        title: 'How much do you need?',
        description: 'Enter the loan amount you\'re requesting',
        minAmount: 'Minimum: ETB 1,000',
        maxAmount: 'Maximum: ETB 300,000',
        amountLabel: 'Loan Amount (ETB)',
        amountPlaceholder: 'Enter amount'
      },
      
      additional: {
        title: 'Additional Information',
        description: 'Help us understand your farming operation better',
        descriptionLabel: 'Describe your specific needs',
        descriptionPlaceholder: 'Tell us more about what you plan to do with this loan...',
        fromProfile: 'From Profile',
        basedOnIncome: 'Based on your annual income: ETB {amount}'
      },
      
      review: {
        title: 'Review Your Application',
        description: 'Please review your information before submitting',
        submit: 'Submit Application',
        submitting: 'Submitting...',
        success: 'Application Submitted Successfully!',
        successMessage: 'Your loan application has been submitted. We\'ll review it and get back to you within 3-5 business days.',
        applicationId: 'Application ID: {id}',
        viewMyLoans: 'View My Loans'
      }
    },

    // Check Eligibility
    eligibility: {
      title: 'Check Loan Eligibility',
      description: 'Find out if you qualify for a loan and get your estimated credit score',
      loadingProfile: 'Loading Your Profile',
      loadingProfileText: 'We\'re loading your farming information to pre-fill the eligibility check...',
      checking: 'Checking Your Eligibility',
      checkingText: 'We\'re analyzing your information to determine your loan eligibility...',
      
      // Progress Steps
      incomeCompleted: 'Income verification completed',
      farmSizeCompleted: 'Farm size assessment completed',
      experienceCompleted: 'Experience evaluation completed',
      collateralCompleted: 'Collateral assessment completed',
      calculating: 'Calculating final credit score and loan terms...',
      processingNote: 'This process takes a few seconds to ensure accurate assessment of your eligibility.',
      
      // Form Sections
      personalInfo: 'Personal Information',
      farmInfo: 'Farm Information',
      loanInfo: 'Loan Information',
      
      // Form Fields
      monthlyIncome: 'Monthly Income (ETB)',
      yearsOfFarming: 'Years of Farming Experience',
      yearsPlaceholder: 'How long have you been farming?',
      existingLoans: 'Monthly Existing Loan Payments (ETB)',
      existingLoansPlaceholder: 'Total monthly payments for existing loans',
      farmSize: 'Farm Size (hectares)',
      primaryCrop: 'Primary Crop',
      region: 'Region',
      requestedAmount: 'Requested Loan Amount (ETB)',
      requestedAmountPlaceholder: 'How much do you need?',
      hasCollateral: 'Do you have collateral?',
      yes: 'Yes',
      no: 'No',
      
      // Privacy Notice
      privacyNotice: 'Privacy Notice',
      privacyText: 'Your information is used only for eligibility assessment and is kept completely confidential. We do not store or share your data without your consent.',
      
      // Submit
      checkEligibility: 'Check My Eligibility',
      
      // Results
      eligible: 'You\'re Eligible!',
      eligibleMessage: 'Congratulations! You qualify for a loan.',
      notEligible: 'Not Eligible Yet',
      notEligibleMessage: 'Don\'t worry, you can improve your eligibility.',
      maxLoanAmount: 'Maximum Loan Amount',
      recommendedAmount: 'Recommended Amount',
      annualInterestRate: 'Annual Interest Rate',
      assessmentFactors: 'Assessment Factors',
      recommendations: 'Recommendations for Improvement',
      nextSteps: 'Next Steps',
      applyForLoanNow: 'Apply for Loan Now',
      checkAgain: 'Check Again',
      viewMyLoans: 'View My Loans'
    },

    // USSD Simulator
    ussd: {
      title: 'USSD Simulator',
      description: 'Experience the USSD interface that farmers use to access loan services. This simulator replicates the *789# USSD service for basic mobile phones.',
      phoneNumber: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      send: 'Send',
      back: 'Back',
      clear: 'Clear',
      reset: 'Reset Session'
    }
  },

  am: {
    // Layout and Navigation
    layout: {
      title: 'የአርሶ አደር መግቢያ',
      quickNavigation: 'ፈጣን አዛውራት',
      dashboard: 'ዳሽቦርድ',
      dashboardDescription: 'የብድር አጠቃላይ እይታ እና ስታትስቲክስ ይመልከቱ',
      myLoans: 'የእኔ ብድሮች',
      myLoansDescription: 'ሁሉንም የብድር መጠየቂያዎችዎን ይመልከቱ',
      ussdSimulator: 'የ USSD አስመስሎተር',
      ussdSimulatorDescription: 'የ USSD መገናኛ ይሞክሩ',
      backToDashboard: 'ወደ ዳሽቦርድ ይመለሱ',
      logout: 'ይውጡ'
    },

    // Dashboard
    dashboard: {
      title: 'የአርሶ አደር ዳሽቦርድ',
      welcome: 'የአርሶ አደር ዳሽቦርድዎን እንኳን በደህና መጡ። እዚህ የብድር ሁኔታዎን ማየት፣ ክፍያ ማድረግ እና ስለ የእርሻ እንቅስቃሴዎችዎ አስፈላጊ መረጃ ማግኘት ይችላሉ።',
      loading: 'ዳሽቦርድ እያጫወተ ነው...',
      unableToLoad: 'የዳሽቦርድ መረጃ ማጫን አልተቻለም',
      
      // Quick Actions
      quickActions: 'ፈጣን ድርጊቶች',
      ussdService: 'የ USSD አገልግሎት',
      makePayment: 'ክፍያ ያድርጉ',
      loanHistory: 'የብድር ታሪክ',
      
      // Credit Score
      creditScore: 'የክሬዲት ነጥብ',
      excellent: 'በጣም ጥሩ',
      good: 'ጥሩ',
      fair: 'መጠን ተሟልቶ',
      creditRating: 'የክሬዲት ደረጃ',
      higherScoresNote: 'ከፍተኛ ነጥቦች የብድር ብቃትዎን ያሳድጋሉ እና የወለድ መጠን ያሳድጋሉ',
      
      // Farming Tips
      farmingTips: 'የእርሻ ምክሮች',
      seasonalAdvisory: 'የወቅት ምክር',
      seasonalAdvisoryText: 'የሚጠበቀውን ዝቅተኛ ዝናብ ምክንያት በዚህ ወቅት የድርቅ መቋቋም ያለው እምባ ያቅቱ።',
      marketPrice: 'የገበያ ዋጋ',
      marketPriceText: 'የአሁኑ የበቆሎ ዋጋ: ብር 2,500 በኩንታል። የመሰብሰብ ማቀድ ጥሩ ጊዜ ነው።',
      financialTip: 'የገንዘብ ምክር',
      financialTipText: 'የመሰብሰብ ገቢዎ 10% ለየሚቀጥለው ወቅት እንደግብ ያስቀምጡ።',
      
      // Recent Activity
      recentPayments: 'የቅርብ ጊዜ ክፍያዎች',
      notifications: 'ማስታወቂያዎች',
      quickAccess: 'ፈጣን መድረስ',
      applyForLoan: 'ብድር ያመልክቱ',
      paymentSchedule: 'የክፍያ መርሃ ግብር',
      checkEligibility: 'ብቃት ያረጋግጡ',
      helpSupport: 'እርዳታ እና ድጋፍ',
      
      // Statistics
      totalLoans: 'ጠቅላላ ብድሮች',
      pending: 'በመጠበቅ ላይ',
      approved: 'የተጸደቀ',
      totalAmount: 'ጠቅላላ መጠን'
    },

    // Loan List
    loans: {
      title: 'የእኔ ብድሮች',
      searchPlaceholder: 'ብድሮችን በዓላማ ወይም በመጠየቂያ መለያ ያግኙ...',
      noLoansFound: 'ምንም ብድር አልተገኘም',
      noLoansMatch: 'ምንም ብድር ከአሁኑ ፊልተሮችዎ ጋር አይጣጣምም።',
      noLoansYet: 'ገና ምንም ብድር አልጠየቁም።',
      applyForLoan: 'ብድር ያመልክቱ',
      viewDetails: 'ዝርዝር ይመልከቱ',
      cancel: 'ያስተላልፉ',
      loadingLoans: 'ብድሮች እያጫወቱ ናቸው...',
      
      // Filters
      all: 'ሁሉም',
      pending: 'በመጠበቅ ላይ',
      approved: 'የተጸደቀ',
      rejected: 'የተቀተ',
      
      // Quick Actions
      applyForNewLoan: 'አዲስ ብድር ያመልክቱ',
      checkEligibility: 'ብቃት ያረጋግጡ',
      makePayment: 'ክፍያ ያድርጉ'
    },

    // Loan Details
    loanDetails: {
      makePayment: 'ክፍያ ያድርጉ',
      downloadDocuments: 'ሰነዶች ያውርዱ',
      shareDetails: 'ዝርዝር ያጋሩ',
      documents: 'ሰነዶች',
      overview: 'አጠቃላይ እይታ',
      payments: 'ክፍያዎች',
      timeline: 'የጊዜ መስመር'
    },

    // Apply Loan
    applyLoan: {
      title: 'ብድር ያመልክቱ',
      loadingProfile: 'መገለጫዎ እያጫወተ ነው',
      loadingProfileText: 'የብድር መጠየቂያዎን ለመሙላት የእርሻ መረጃዎን እያጫወትን ነው...',
      step1: 'የብድር ዓላማ',
      step2: 'የብድር መጠን',
      step3: 'ተጨማሪ መረጃ',
      step4: 'ያረጋግጡ እና ያስገቡ',
      
      // Steps
      purpose: {
        title: 'ብድሩን ለምን ያስፈልግዎታል?',
        description: 'የብድር መጠየቂያዎ ዋና ዓላማ ይምረጡ',
        seeds: 'ዘሮች',
        fertilizer: 'ማዳበሪያ',
        equipment: 'መሣሪያ',
        irrigation: 'የውሃ ማጠጣት',
        other: 'ሌላ'
      },
      
      amount: {
        title: 'ምን ያህል ያስፈልግዎታል?',
        description: 'የሚጠይቁትን የብድር መጠን ያስገቡ',
        minAmount: 'ዝቅተኛ: ብር 1,000',
        maxAmount: 'ከፍተኛ: ብር 300,000',
        amountLabel: 'የብድር መጠን (ብር)',
        amountPlaceholder: 'መጠን ያስገቡ'
      },
      
      additional: {
        title: 'ተጨማሪ መረጃ',
        description: 'የእርሻ ክወናዎን ለመረዳት ያግዙን',
        descriptionLabel: 'የተለየ ፍላጎትዎን ይግለጹ',
        descriptionPlaceholder: 'ብድሩን ለምን እንደሚያውቁ ተጨማሪ ይንገሩን...',
        fromProfile: 'ከመገለጫ',
        basedOnIncome: 'ከዓመታዊ ገቢዎ ላይ የተመሰረተ: ብር {amount}'
      },
      
      review: {
        title: 'መጠየቂያዎን ያረጋግጡ',
        description: 'እባክዎ መረጃዎን ከመላክ በፊት ያረጋግጡ',
        submit: 'መጠየቂያ ያስገቡ',
        submitting: 'ያስገባል...',
        success: 'መጠየቂያ በተሳካቸ ሁኔታ ተልኳል!',
        successMessage: 'የብድር መጠየቂያዎ ተልኳል። እንደገና እንገመገማለን እና በ 3-5 የስራ ቀናት ውስጥ እንመልሳለን።',
        applicationId: 'የመጠየቂያ መለያ: {id}',
        viewMyLoans: 'የእኔ ብድሮች ይመልከቱ'
      }
    },

    // Check Eligibility
    eligibility: {
      title: 'የብድር ብቃት ያረጋግጡ',
      description: 'ለብድር ብቁ መሆንዎን ያውቁ እና የተገመተውን የክሬዲት ነጥብዎን ያግኙ',
      loadingProfile: 'መገለጫዎ እያጫወተ ነው',
      loadingProfileText: 'የብቃት ማረጋገጫውን ለመሙላት የእርሻ መረጃዎን እያጫወትን ነው...',
      checking: 'ብቃትዎን ያረጋግጣል',
      checkingText: 'የብድር ብቃትዎን ለመወሰን መረጃዎን እያወጣን ነው...',
      
      // Progress Steps
      incomeCompleted: 'የገቢ ማረጋገጫ ተጠናቅቋል',
      farmSizeCompleted: 'የእርሻ መጠን ግምገማ ተጠናቅቋል',
      experienceCompleted: 'የስራ ስራ ግምገማ ተጠናቅቋል',
      collateralCompleted: 'የዋስትና ግምገማ ተጠናቅቋል',
      calculating: 'የመጨረሻ የክሬዲት ነጥብ እና የብድር ውሎች ያሰላል...',
      processingNote: 'ይህ ሂደት ትክክለኛ የብቃት ግምገማ ለማረጋገጥ ጥቂት ሰከንዶች ይወስዳል።',
      
      // Form Sections
      personalInfo: 'የግል መረጃ',
      farmInfo: 'የእርሻ መረጃ',
      loanInfo: 'የብድር መረጃ',
      
      // Form Fields
      monthlyIncome: 'የወር ገቢ (ብር)',
      yearsOfFarming: 'የእርሻ ስራ የሚደረግበት የዓመት ቁጥር',
      yearsPlaceholder: 'ለምን ያህል ጊዜ እርሻ ስራ ያደረጉ ነበር?',
      existingLoans: 'የወር የአሁን የብድር ክፍያዎች (ብር)',
      existingLoansPlaceholder: 'የአሁን ብድሮች ጠቅላላ የወር ክፍያዎች',
      farmSize: 'የእርሻ መጠን (ሄክታር)',
      primaryCrop: 'ዋና እምባ',
      region: 'ክልል',
      requestedAmount: 'የሚጠየቀው የብድር መጠን (ብር)',
      requestedAmountPlaceholder: 'ምን ያህል ያስፈልግዎታል?',
      hasCollateral: 'ዋስትና አለዎት?',
      yes: 'አዎ',
      no: 'አይ',
      
      // Privacy Notice
      privacyNotice: 'የግል መረጃ ማስታወቂያ',
      privacyText: 'መረጃዎ ለብቃት ግምገማ ብቻ ያገለግላል እና ሙሉ በሙሉ ሚስጥራዊ ይዟል። እርስዎ ፈቃድ ሳይሰጡ መረጃዎን አንወስድም እንደማንጋራም።',
      
      // Submit
      checkEligibility: 'ብቃቴን ያረጋግጡ',
      
      // Results
      eligible: 'ብቁ ነዎት!',
      eligibleMessage: 'እንኳን ደስ አለዎት! ለብድር ብቁ ነዎት።',
      notEligible: 'ገና ብቁ አይደለም',
      notEligibleMessage: 'አይጨነቁ፣ ብቃትዎን ማሳደግ ይችላሉ።',
      maxLoanAmount: 'ከፍተኛ የብድር መጠን',
      recommendedAmount: 'የሚመከር መጠን',
      annualInterestRate: 'የዓመት የወለድ መጠን',
      assessmentFactors: 'የግምገማ ምክንያቶች',
      recommendations: 'ለማሳደግ ምክሮች',
      nextSteps: 'የሚቀጥለው ደረጃ',
      applyForLoanNow: 'አሁን ብድር ያመልክቱ',
      checkAgain: 'እንደገና ያረጋግጡ',
      viewMyLoans: 'የእኔ ብድሮች ይመልከቱ'
    },

    // USSD Simulator
    ussd: {
      title: 'የ USSD አስመስሎተር',
      description: 'አርሶ አደሮች የብድር አገልግሎቶችን ለማግኘት የሚያገለግሉትን የ USSD መገናኛ ያሳልሙ። ይህ አስመስሎተር የ *789# USSD አገልግሎትን ለመሰረታዊ ስልኮች ያንጸባርቃል።',
      phoneNumber: 'የስልክ ቁጥር',
      phonePlaceholder: 'የስልክ ቁጥር ያስገቡ',
      send: 'ያስተላልፉ',
      back: 'ይመለሱ',
      clear: 'ያጽዱ',
      reset: 'የመገናኛ ክፍል ዳግም ያስጀምሩ'
    }
  }
};
