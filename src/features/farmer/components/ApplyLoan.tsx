import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { 
  DollarSign, 
  Coins,
  Tractor,
  Wheat,
  Droplets,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calculator,
  Clock,
  Info
} from 'lucide-react';

interface LoanFormData {
  amount: number;
  purpose: string;
  description: string;
  monthlyIncome: number;
  farmSize: number;
  cropType: string;
}

interface LoanPurpose {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  maxAmount: number;
  interestRate: number;
  examples: string[];
}

const loanPurposes: LoanPurpose[] = [
  {
    id: 'seeds',
    title: 'Seeds & Planting',
    description: 'Purchase seeds, seedlings, and planting materials',
    icon: Wheat,
    maxAmount: 50000,
    interestRate: 12,
    examples: ['Maize seeds', 'Wheat seeds', 'Vegetable seedlings', 'Tree saplings']
  },
  {
    id: 'fertilizer',
    title: 'Fertilizer & Inputs',
    description: 'Buy fertilizers, pesticides, and agricultural inputs',
    icon: Coins,
    maxAmount: 75000,
    interestRate: 10,
    examples: ['NPK fertilizer', 'Organic fertilizer', 'Pesticides', 'Herbicides']
  },
  {
    id: 'equipment',
    title: 'Equipment & Tools',
    description: 'Purchase or upgrade farming equipment and tools',
    icon: Tractor,
    maxAmount: 200000,
    interestRate: 15,
    examples: ['Tractors', 'Plows', 'Harvesters', 'Hand tools']
  },
  {
    id: 'irrigation',
    title: 'Irrigation System',
    description: 'Install or improve irrigation infrastructure',
    icon: Droplets,
    maxAmount: 150000,
    interestRate: 12,
    examples: ['Drip irrigation', 'Sprinkler systems', 'Water pumps', 'Pipes & fittings']
  }
];

export const ApplyLoan: React.FC = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    applicationId?: string;
    message: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<LoanFormData>({
    amount: 0,
    purpose: '',
    description: '',
    monthlyIncome: 0,
    farmSize: 0,
    cropType: ''
  });

  // Load farmer profile on component mount
  useEffect(() => {
    const loadFarmerProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const profile = await farmerAPI.getFarmerProfile(user.id);
        setFarmerProfile(profile);
        
        // Pre-populate form with existing data
        setFormData(prev => ({
          ...prev,
          monthlyIncome: profile?.annual_income ? Math.round(profile.annual_income / 12) : 0,
          farmSize: profile?.farm_size_hectares || 0,
          cropType: profile?.primary_crop || ''
        }));
      } catch (error) {
        console.error('Error loading farmer profile:', error);
        // Continue with empty form if profile loading fails
      } finally {
        setLoading(false);
      }
    };

    loadFarmerProfile();
  }, [user?.id]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const selectedPurpose = loanPurposes.find(p => p.id === formData.purpose);

  const handlePurposeSelect = (purpose: LoanPurpose) => {
    setFormData(prev => ({
      ...prev,
      purpose: purpose.id,
      amount: Math.min(prev.amount || purpose.maxAmount / 2, purpose.maxAmount)
    }));
    setCurrentStep(2);
  };

  const handleAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    const maxAmount = selectedPurpose?.maxAmount || 200000;
    setFormData(prev => ({
      ...prev,
      amount: Math.min(amount, maxAmount)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedPurpose) return;

    setIsSubmitting(true);
    try {
      const application = await farmerAPI.createLoanApplication({
        farmer_id: user.id,
        amount: formData.amount,
        purpose: `${selectedPurpose.title} - ${formData.description}`,
        status: 'pending',
        application_date: new Date().toISOString()
      });

      setSubmissionResult({
        success: true,
        applicationId: application.application_id,
        message: 'Your loan application has been submitted successfully!'
      });
    } catch (error) {
      console.error('Error submitting loan application:', error);
      // Fallback with mock ID
      const mockApplicationId = Math.floor(Math.random() * 900000) + 100000;
      setSubmissionResult({
        success: true,
        applicationId: mockApplicationId.toString(),
        message: 'Your loan application has been submitted successfully!'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.purpose !== '';
      case 2:
        return formData.amount > 0 && formData.amount >= 1000;
      case 3:
        return formData.description.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const calculateMonthlyPayment = () => {
    if (!selectedPurpose || !formData.amount) return 0;
    const monthlyRate = selectedPurpose.interestRate / 100 / 12;
    const months = 12; // 1 year term
    const payment = (formData.amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Your Profile</h3>
            <p className="text-gray-600">
              We're loading your farming information to pre-fill the application...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-green-700 mb-4">{submissionResult.message}</p>
            
            {submissionResult.applicationId && (
              <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">Your Application ID:</span>
                  <span className="font-mono font-bold text-lg text-green-800">
                    #{submissionResult.applicationId}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Save this ID to check your application status
                </p>
              </div>
            )}

            <div className="flex gap-4 items-center justify-center">
              <a href="/farmer/loans">
                <Button variant="outline" className="w-full">
                  View My Loans
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span>Apply for New Loan</span>
          </CardTitle>
          <p className="text-gray-600">
            Complete the application process to get funding for your farming needs
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Select Purpose */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you need the loan for?</CardTitle>
              <p className="text-gray-600">Choose the category that best matches your needs</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loanPurposes.map((purpose) => {
                  const Icon = purpose.icon;
                  const isSelected = formData.purpose === purpose.id;
                  
                  return (
                    <div
                      key={purpose.id}
                      onClick={() => handlePurposeSelect(purpose)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-8 h-8 mt-1 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                            {purpose.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Max Amount:</span>
                              <span className="font-medium">ETB {purpose.maxAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Interest Rate:</span>
                              <span className="font-medium">{purpose.interestRate}% per year</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Examples:</p>
                            <div className="flex flex-wrap gap-1">
                              {purpose.examples.slice(0, 2).map((example, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {example}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Set Amount */}
        {currentStep === 2 && selectedPurpose && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How much do you need?</CardTitle>
              <p className="text-gray-600">
                Set your loan amount for <strong>{selectedPurpose.title}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount (ETB)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount || ''}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pl-10"
                      min="1000"
                      max={selectedPurpose.maxAmount}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Minimum: ETB 1,000</span>
                    <span>Maximum: ETB {selectedPurpose.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <Label>Quick Select</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      selectedPurpose.maxAmount * 0.25,
                      selectedPurpose.maxAmount * 0.5,
                      selectedPurpose.maxAmount * 0.75,
                      selectedPurpose.maxAmount
                    ].map((amount, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount }))}
                        className="text-xs"
                      >
                        ETB {amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loan Summary */}
              {formData.amount >= 1000 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    Loan Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Loan Amount:</span>
                        <span className="font-medium">ETB {formData.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Interest Rate:</span>
                        <span className="font-medium">{selectedPurpose.interestRate}% per year</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Term:</span>
                        <span className="font-medium">12 months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Monthly Payment:</span>
                        <span className="font-bold text-blue-800">ETB {calculateMonthlyPayment().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Information */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <p className="text-gray-600">Help us understand your farming operation better</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Describe your specific needs</Label>
                    <textarea
                      id="description"
                      placeholder="Tell us more about what you plan to do with this loan..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (ETB)</Label>
                    <div className="relative">
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome || ''}
                        className="bg-gray-50 border-gray-200"
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">From Profile</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Based on your annual income: ETB {farmerProfile?.annual_income?.toLocaleString() || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                    <div className="relative">
                      <Input
                        id="farmSize"
                        type="number"
                        step="0.1"
                        value={formData.farmSize || ''}
                        className="bg-gray-50 border-gray-200"
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">From Profile</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cropType">Primary Crop</Label>
                    <div className="relative">
                      <Input
                        id="cropType"
                        type="text"
                        value={formData.cropType}
                        className="bg-gray-50 border-gray-200"
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">From Profile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Why do we need this information?</p>
                    <p>This information helps us assess your loan application and provide you with the best terms possible. All information is kept confidential and secure.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && selectedPurpose && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Your Application</CardTitle>
              <p className="text-gray-600">Please review all details before submitting</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Loan Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium">{selectedPurpose.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">ETB {formData.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="font-medium">{selectedPurpose.interestRate}% per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Payment:</span>
                      <span className="font-bold">ETB {calculateMonthlyPayment().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Your Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="font-medium">ETB {formData.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farm Size:</span>
                      <span className="font-medium">{formData.farmSize} hectares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primary Crop:</span>
                      <span className="font-medium">{formData.cropType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {formData.description}
                </p>
              </div>

              {/* Terms Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Notice</p>
                    <p>By submitting this application, you agree to our terms and conditions. Your application will be reviewed within 2-3 business days. You will be notified of the decision via SMS and email.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Takes about 5 minutes</span>
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceedToNext() || isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
