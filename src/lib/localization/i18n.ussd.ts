// USSD translations
export const ussdTranslations = {
  en: {
    ussd: {
      welcome: 'Welcome to Farmers Loan Service\n\n1. Check Eligibility\n2. Apply for Loan\n3. Check Status\n4. Make Payment\n5. Loan History\n6. View Loan Details\n7. Help',
      menu: {
        checkEligibility: 'Check Loan Eligibility',
        applyLoan: 'Apply for Loan',
        checkStatus: 'Check Application Status',
        makePayment: 'Make Payment',
        loanHistory: 'View Loan History',
        viewLoanDetails: 'View Loan Details',
        help: 'Help & Support'
      },
      eligibility: {
        eligible: 'Congratulations! You are eligible for a loan.',
        notEligible: 'Sorry, you are not eligible for a loan at this time.'
      },
      loan: {
        enterAmount: 'Enter loan amount (1,000 - 100,000 ETB):',
        amountLabel: 'Loan Amount',
        amountPlaceholder: 'Enter amount',
        selectPurpose: 'Select loan purpose:\n\n1. Seeds\n2. Fertilizer\n3. Equipment\n4. Other',
        purposes: {
          seeds: 'Seeds',
          fertilizer: 'Fertilizer',
          equipment: 'Equipment',
          other: 'Other'
        },
        applicationSubmitted: 'Your loan application has been submitted successfully.',
        applicationResult: 'Application submitted successfully!'
      },
      status: {
        enterApplicationId: 'Enter your 6-digit application ID:',
        applicationIdLabel: 'Application ID',
        applicationIdPlaceholder: 'Enter 6-digit ID',
        statusRetrieved: 'Status retrieved successfully.',
        statusResult: 'Application Status:',
        applicationNotFound: 'Application not found. Please check your 6-digit ID and try again.'
      },
      payment: {
        enterAmount: 'Enter payment amount:',
        amountLabel: 'Payment Amount',
        amountPlaceholder: 'Enter amount',
        paymentSuccessful: 'Payment processed successfully.',
        paymentResult: 'Payment completed!',
        noActiveLoan: 'No active loan found for payment. Please apply for a loan first.'
      },
      history: {
        loanHistory: 'Your loan history:',
        historyRetrieved: 'History retrieved successfully.'
      },
      help: {
        helpInfo: 'For assistance, contact:',
        contactInfo: 'Contact Information'
      },
      loanDetails: {
        loanDetails: 'Loan Details:',
        loanDetailsRetrieved: 'Loan details retrieved successfully.',
        noActiveLoan: 'No active loan found. Please apply for a loan first.'
      }
    },
    farmer: {
      title: 'Farmer Portal',
      accessMethods: 'Access Methods',
      ussd: {
        title: 'USSD Service',
        description: 'Access via basic mobile phone'
      },
      mobile: {
        title: 'Mobile App',
        description: 'Access via smartphone'
      },
      quickStats: 'Quick Stats',
      stats: {
        activeLoans: 'Active Loans',
        totalBorrowed: 'Total Borrowed',
        creditScore: 'Credit Score'
      }
    }
  },
  am: {
    ussd: {
      welcome: 'የአርሶ አደሮች የብድር አገልግሎት እንኳን በደህና መጡ\n\n1. ብቃት ያረጋግጡ\n2. ብድር ያመልክቱ\n3. ሁኔታ ያረጋግጡ\n4. ክፍያ ያድርጉ\n5. የብድር ታሪክ\n6. የብድር ዝርዝር ይመልከቱ\n7. እርዳታ',
      menu: {
        checkEligibility: 'የብድር ብቃት ያረጋግጡ',
        applyLoan: 'ብድር ያመልክቱ',
        checkStatus: 'የመጠየቂያ ሁኔታ ያረጋግጡ',
        makePayment: 'ክፍያ ያድርጉ',
        loanHistory: 'የብድር ታሪክ ይመልከቱ',
        viewLoanDetails: 'የብድር ዝርዝር ይመልከቱ',
        help: 'እርዳታ እና ድጋፍ'
      },
      eligibility: {
        eligible: 'እንኳን ደስ አለዎት! ለብድር ብቁ ነዎት።',
        notEligible: 'ይቅርታ፣ በዚህ ጊዜ ለብድር ብቁ አይደለም።'
      },
      loan: {
        enterAmount: 'የብድር መጠን ያስገቡ (1,000 - 100,000 ብር):',
        amountLabel: 'የብድር መጠን',
        amountPlaceholder: 'መጠን ያስገቡ',
        selectPurpose: 'የብድር ዓላማ ይምረጡ:\n\n1. ዘሮች\n2. ማዳበሪያ\n3. መሣሪያ\n4. ሌላ',
        purposes: {
          seeds: 'ዘሮች',
          fertilizer: 'ማዳበሪያ',
          equipment: 'መሣሪያ',
          other: 'ሌላ'
        },
        applicationSubmitted: 'የብድር መጠየቂያዎ በተሳካቸ ሁኔታ ተልኳል።',
        applicationResult: 'መጠየቂያ በተሳካቸ ሁኔታ ተልኳል!'
      },
      status: {
        enterApplicationId: 'የ6-ዲጂት መጠየቂያ መለያዎን ያስገቡ:',
        applicationIdLabel: 'የመጠየቂያ መለያ',
        applicationIdPlaceholder: '6-ዲጂት መለያ ያስገቡ',
        statusRetrieved: 'ሁኔታ በተሳካቸ ሁኔታ ተገኝቷል።',
        statusResult: 'የመጠየቂያ ሁኔታ:',
        applicationNotFound: 'መጠየቂያ አልተገኘም። እባክዎ 6-ዲጂት መለያዎን ያረጋግጡ እና እንደገና ይሞክሩ።'
      },
      payment: {
        enterAmount: 'የክፍያ መጠን ያስገቡ:',
        amountLabel: 'የክፍያ መጠን',
        amountPlaceholder: 'መጠን ያስገቡ',
        paymentSuccessful: 'ክፍያ ተካሂዷል።',
        paymentResult: 'ክፍያ ተጠናቅቋል!',
        noActiveLoan: 'ለክፍያ ንቁ ብድር አልተገኘም። እባክዎ መጀመሪያ ብድር ያመልክቱ።'
      },
      history: {
        loanHistory: 'የብድር ታሪክዎ:',
        historyRetrieved: 'ታሪክ በተሳካቸ ሁኔታ ተገኝቷል።'
      },
      help: {
        helpInfo: 'ለእርዳታ፣ ያግኙ:',
        contactInfo: 'የመገናኛ መረጃ'
      },
      loanDetails: {
        loanDetails: 'የብድር ዝርዝር:',
        loanDetailsRetrieved: 'የብድር ዝርዝር በተሳካቸ ሁኔታ ተገኝቷል።',
        noActiveLoan: 'ንቁ ብድር አልተገኘም። እባክዎ መጀመሪያ ብድር ያመልክቱ።'
      }
    },
    farmer: {
      title: 'የአርሶ አደር መግቢያ',
      accessMethods: 'የመድረስ ዘዴዎች',
      ussd: {
        title: 'የ USSD አገልግሎት',
        description: 'በመሰረታዊ ስልክ ያግኙ'
      },
      mobile: {
        title: 'የስልክ መተግበሪያ',
        description: 'በስማርትፎን ያግኙ'
      },
      quickStats: 'ፈጣን ስታትስቲክስ',
      stats: {
        activeLoans: 'ንቁ ብድሮች',
        totalBorrowed: 'ጠቅላላ የተበደረ',
        creditScore: 'የክሬዲት ነጥብ'
      }
    }
  }
};
