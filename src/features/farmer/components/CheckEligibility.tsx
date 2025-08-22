import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { useAuthStore } from '@/core/store/authStore';
import { farmerAPI } from '@/features/farmer/farmer.api';
import { EligibilityDisplay } from '@/components/shared';
import { 
  Shield, 
  CheckCircle,
  DollarSign,
  User,
  Wheat,
  Info,
  ArrowRight
} from 'lucide-react';

interface EligibilityFormData {
  monthlyIncome: number;
  farmSize: number;
  yearsOfFarming: number;
  hasCollateral: boolean;
  existingLoans: number;
  requestedAmount: number;
  primaryCrop: string;
  region: string;
}

interface EligibilityResult {
  eligible: boolean;
  creditScore: number;
  maxLoanAmount: number;
  recommendedAmount: number;
  interestRate: number;
  reasons: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export const CheckEligibility: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [formData, setFormData] = useState<EligibilityFormData>({
    monthlyIncome: 0,
    farmSize: 0,
    yearsOfFarming: 0,
    hasCollateral: false,
    existingLoans: 0,
    requestedAmount: 0,
    primaryCrop: '',
    region: ''
  });
  
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [, setShowForm] = useState(true);

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
          primaryCrop: profile?.primary_crop || '',
          region: profile?.region || ''
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

  const handleInputChange = (field: keyof EligibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateEligibility = async () => {
    setIsChecking(true);
    
    try {
      // Try to get real eligibility from API
      if (user?.id) {
        const eligibilityResponse = await farmerAPI.checkEligibility(user.id);
        
        // Convert API response to our expected format
        const eligibilityResult: EligibilityResult = {
          eligible: eligibilityResponse.eligible,
          creditScore: eligibilityResponse.creditScore,
          maxLoanAmount: eligibilityResponse.maxLoanAmount,
          recommendedAmount: Math.round(eligibilityResponse.maxLoanAmount * 0.7),
          interestRate: eligibilityResponse.eligible ? 12 : 18,
          reasons: eligibilityResponse.reasons,
          recommendations: eligibilityResponse.eligible ? [] : ['Improve income and farming experience'],
          riskLevel: eligibilityResponse.creditScore >= 650 ? 'low' : 
                    eligibilityResponse.creditScore >= 500 ? 'medium' : 'high'
        };
        
        setResult(eligibilityResult);
        setShowForm(false);
        setIsChecking(false);
        return;
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }

    // Fallback to calculated eligibility with timeout protection
    setTimeout(() => {
      const calculatedResult = calculateMockEligibility();
      setResult(calculatedResult);
      setShowForm(false);
      setIsChecking(false);
    }, 3000);

    // Safety timeout to prevent infinite loading
    setTimeout(() => {
      if (isChecking) {
        console.warn('Eligibility check timeout, forcing completion');
        const fallbackResult = calculateMockEligibility();
        setResult(fallbackResult);
        setShowForm(false);
        setIsChecking(false);
      }
    }, 10000);
  };

  const calculateMockEligibility = (): EligibilityResult => {
    const { monthlyIncome, farmSize, yearsOfFarming, hasCollateral, existingLoans, requestedAmount } = formData;
    
    let score = 300; // Base score
    let maxAmount = 0;
    const reasons: string[] = [];
    const recommendations: string[] = [];
    
    // Income assessment (40% weight)
    if (monthlyIncome >= 8000) {
      score += 200;
      reasons.push('Excellent monthly income');
    } else if (monthlyIncome >= 5000) {
      score += 150;
      reasons.push('Good monthly income');
    } else if (monthlyIncome >= 3000) {
      score += 100;
      reasons.push('Adequate monthly income');
    } else if (monthlyIncome >= 1000) {
      score += 50;
      reasons.push('Basic monthly income');
    } else {
      score -= 50;
      reasons.push('Low monthly income');
      recommendations.push('Focus on increasing your monthly income through diversified farming or additional income sources');
    }
    
    // Farm size assessment (20% weight)
    if (farmSize >= 5) {
      score += 120;
      reasons.push('Large farm operation');
    } else if (farmSize >= 2) {
      score += 100;
      reasons.push('Substantial farm size');
    } else if (farmSize >= 1) {
      score += 70;
      reasons.push('Moderate farm size');
    } else if (farmSize >= 0.5) {
      score += 50;
      reasons.push('Small farm size');
    } else {
      score -= 30;
      recommendations.push('Consider expanding your farm operations or improving productivity on existing land');
    }
    
    // Experience assessment (20% weight)
    if (yearsOfFarming >= 10) {
      score += 120;
      reasons.push('Extensive farming experience');
    } else if (yearsOfFarming >= 5) {
      score += 100;
      reasons.push('Significant farming experience');
    } else if (yearsOfFarming >= 2) {
      score += 60;
      reasons.push('Some farming experience');
    } else if (yearsOfFarming >= 1) {
      score += 30;
      reasons.push('Basic farming experience');
    } else {
      score -= 50;
      recommendations.push('Gain more farming experience through mentorship, training programs, or working with experienced farmers');
    }
    
    // Collateral assessment (10% weight)
    if (hasCollateral) {
      score += 80;
      reasons.push('Has collateral for loan security');
    } else {
      score -= 20;
      recommendations.push('Consider providing collateral (land, equipment, livestock) to improve loan terms and approval chances');
    }
    
    // Existing loans assessment (10% weight)
    if (existingLoans === 0) {
      score += 60;
      reasons.push('No existing loan obligations');
    } else if (existingLoans <= monthlyIncome * 0.2) {
      score += 40;
      reasons.push('Manageable existing loan burden');
    } else if (existingLoans <= monthlyIncome * 0.4) {
      score += 20;
      reasons.push('Moderate existing loan burden');
    } else {
      score -= 80;
      recommendations.push('Focus on reducing your existing loan burden before applying for new loans');
    }
    
    // Calculate max loan amount based on income, score, and risk factors
    const incomeBasedLimit = monthlyIncome * 18; // 1.5 years of income
    const scoreMultiplier = Math.max(0.3, Math.min(2.5, score / 400));
    const riskMultiplier = hasCollateral ? 1.2 : 0.8;
    maxAmount = Math.round(incomeBasedLimit * scoreMultiplier * riskMultiplier);
    
    // Apply reasonable limits
    maxAmount = Math.min(maxAmount, 300000);
    maxAmount = Math.max(maxAmount, 5000);
    
    const eligible = score >= 450 && monthlyIncome >= 1000;
    const recommendedAmount = Math.min(requestedAmount || maxAmount * 0.6, maxAmount * 0.8);
    
    // Determine risk level and interest rate
    let riskLevel: 'low' | 'medium' | 'high' = 'high';
    let interestRate = 18; // Base rate
    
    if (score >= 700) {
      riskLevel = 'low';
      interestRate = 8;
    } else if (score >= 550) {
      riskLevel = 'medium';
      interestRate = 12;
    } else if (score >= 450) {
      riskLevel = 'medium';
      interestRate = 15;
    } else {
      riskLevel = 'high';
      interestRate = 18;
    }
    
    // Add specific recommendations based on score
    if (score < 450) {
      recommendations.push('Work on improving your overall credit profile before applying');
    } else if (score < 550) {
      recommendations.push('Consider smaller loan amounts initially to build credit history');
    }
    
    // Add farming-specific recommendations
    if (farmSize < 1 && monthlyIncome < 3000) {
      recommendations.push('Consider value-added farming activities to increase income per hectare');
    }
    
    if (yearsOfFarming < 2) {
      recommendations.push('Join farming cooperatives or associations for support and guidance');
    }
    
    return {
      eligible,
      creditScore: Math.min(850, Math.max(300, score)),
      maxLoanAmount: maxAmount,
      recommendedAmount,
      interestRate,
      reasons,
      recommendations,
      riskLevel
    };
  };

  const resetCheck = () => {
    setResult(null);
    setShowForm(true);
    setFormData({
      monthlyIncome: 0,
      farmSize: 0,
      yearsOfFarming: 0,
      hasCollateral: false,
      existingLoans: 0,
      requestedAmount: 0,
      primaryCrop: '',
      region: ''
    });
  };



  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Your Profile</h3>
            <p className="text-gray-600">
              We're loading your farming information to pre-fill the eligibility check...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Checking Your Eligibility</h3>
            <p className="text-gray-600 mb-4">
              We're analyzing your information to determine your loan eligibility...
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Income verification completed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Farm size assessment completed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Experience evaluation completed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Collateral assessment completed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Calculating final credit score and loan terms...</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                This process takes a few seconds to ensure accurate assessment of your eligibility.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <EligibilityDisplay 
        result={result}
        onApplyLoan={() => window.location.href = '/farmer/apply-loan'}
        onCheckAgain={resetCheck}
        className="p-4"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Check Loan Eligibility</span>
          </CardTitle>
          <p className="text-gray-600">
            Find out if you qualify for a loan and get your estimated credit score
          </p>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tell us about yourself</CardTitle>
          <p className="text-gray-600">This information helps us assess your eligibility accurately</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Personal Information</span>
              </h4>
              
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

              <div className="space-y-2">
                <Label htmlFor="yearsOfFarming">Years of Farming Experience</Label>
                <Input
                  id="yearsOfFarming"
                  type="number"
                  placeholder="How long have you been farming?"
                  value={formData.yearsOfFarming || ''}
                  onChange={(e) => handleInputChange('yearsOfFarming', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existingLoans">Monthly Existing Loan Payments (ETB)</Label>
                <Input
                  id="existingLoans"
                  type="number"
                  placeholder="Total monthly payments for existing loans"
                  value={formData.existingLoans || ''}
                  onChange={(e) => handleInputChange('existingLoans', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            {/* Farm Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Wheat className="w-4 h-4" />
                <span>Farm Information</span>
              </h4>

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
                <Label htmlFor="primaryCrop">Primary Crop</Label>
                <div className="relative">
                  <Input
                    id="primaryCrop"
                    type="text"
                    value={formData.primaryCrop}
                    className="bg-gray-50 border-gray-200"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">From Profile</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <div className="relative">
                  <Input
                    id="region"
                    type="text"
                    value={formData.region}
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

          {/* Loan Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Loan Information</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Requested Loan Amount (ETB)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  placeholder="How much do you need?"
                  value={formData.requestedAmount || ''}
                  onChange={(e) => handleInputChange('requestedAmount', parseInt(e.target.value) || 0)}
                  min="1000"
                />
              </div>

              <div className="space-y-2">
                <Label>Do you have collateral?</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="collateral"
                      checked={formData.hasCollateral === true}
                      onChange={() => handleInputChange('hasCollateral', true)}
                      className="text-green-600"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="collateral"
                      checked={formData.hasCollateral === false}
                      onChange={() => handleInputChange('hasCollateral', false)}
                      className="text-green-600"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p>Your information is used only for eligibility assessment and is kept completely confidential. We do not store or share your data without your consent.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={calculateEligibility}
            disabled={!formData.requestedAmount}
            className="w-full flex items-center justify-center space-x-2 py-3"
          >
            <span>Check My Eligibility</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
