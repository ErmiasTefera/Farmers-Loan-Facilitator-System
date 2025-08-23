import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/core/store/authStore';
import { dataCollectorAPI } from '../data-collector.api';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';

interface RegisterFarmerFormData {
  // Personal Information
  full_name: string;
  phone_number: string;
  id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | '';
  
  // Location Information
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  village: string;
  
  // Personal Details
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | '';
  family_size: number;
  education_level: 'none' | 'primary' | 'secondary' | 'tertiary' | '';
  primary_occupation: 'farming' | 'mixed' | 'other' | '';
  
  // Financial Information
  monthly_income: number;
  has_bank_account: boolean;
  bank_name: string;
  account_number: string;
  
  // Farm Information
  farm_size_hectares: number;
  primary_crop: string;
  secondary_crops: string[];
  livestock_count: number;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

const initialFormData: RegisterFarmerFormData = {
  full_name: '',
  phone_number: '',
  id_number: '',
  date_of_birth: '',
  gender: '',
  region: '',
  zone: '',
  woreda: '',
  kebele: '',
  village: '',
  marital_status: '',
  family_size: 1,
  education_level: '',
  primary_occupation: '',
  monthly_income: 0,
  has_bank_account: false,
  bank_name: '',
  account_number: '',
  farm_size_hectares: 0,
  primary_crop: '',
  secondary_crops: [],
  livestock_count: 0,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
};

const RegisterFarmer: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFarmerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [dataCollectorId, setDataCollectorId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;

  useEffect(() => {
    const fetchDataCollectorId = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await dataCollectorAPI.getDataCollectorProfile(user.id);
        if (profile) {
          setDataCollectorId(profile.id);
        }
      } catch (error) {
        console.error('Error fetching data collector profile:', error);
      }
    };

    fetchDataCollectorId();
  }, [user?.id]);

  const updateFormData = (field: keyof RegisterFarmerFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Information
        return !!(formData.full_name && formData.phone_number && formData.id_number && formData.date_of_birth && formData.gender);
      case 2: // Location Information
        return !!(formData.region && formData.zone && formData.woreda && formData.kebele && formData.village);
      case 3: // Personal Details
        return !!(formData.marital_status && formData.family_size > 0 && formData.education_level && formData.primary_occupation);
      case 4: // Financial Information
        return !!(formData.monthly_income > 0);
      case 5: // Farm Information
        return !!(formData.farm_size_hectares > 0 && formData.primary_crop);
      case 6: // Emergency Contact
        return !!(formData.emergency_contact_name && formData.emergency_contact_phone && formData.emergency_contact_relationship);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!dataCollectorId) {
      setError('Data collector profile not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const farmerData = {
        ...formData,
        data_collector_id: dataCollectorId,
        verification_status: 'pending' as const,
        sync_status: 'pending' as const,
        gender: formData.gender as 'male' | 'female',
        marital_status: formData.marital_status as 'single' | 'married' | 'divorced' | 'widowed',
        education_level: formData.education_level as 'none' | 'primary' | 'secondary' | 'tertiary',
        primary_occupation: formData.primary_occupation as 'farming' | 'mixed' | 'other',
        user_id: user!.id,
      };

      await dataCollectorAPI.registerFarmer(farmerData);
      setSuccess(true);
    } catch (error) {
      console.error('Error registering farmer:', error);
      setError(error instanceof Error ? error.message : 'Failed to register farmer');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondaryCropChange = (crop: string, checked: boolean) => {
    const updatedCrops = checked
      ? [...formData.secondary_crops, crop]
      : formData.secondary_crops.filter(c => c !== crop);
    updateFormData('secondary_crops', updatedCrops);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-800">
                {t('dataCollector.registerFarmer.success')}
              </h2>
              <p className="text-green-700">
                {formData.full_name} has been successfully registered.
              </p>
              <div className="space-x-4">
                <Button onClick={() => window.location.href = '/data-collector/farmers'}>
                  {t('dataCollector.farmers.viewAll')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFormData(initialFormData);
                    setCurrentStep(1);
                    setSuccess(false);
                  }}
                >
                  {t('dataCollector.registerFarmer.registerAnother')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dataCollector.registerFarmer.title')}
        </h1>
        <p className="text-gray-600">
          {t('dataCollector.registerFarmer.subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {t('dataCollector.registerFarmer.progress')} {currentStep} / {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Steps */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.personalInfo')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('dataCollector.registerFarmer.fullName')} *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateFormData('full_name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t('dataCollector.registerFarmer.phoneNumber')} *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateFormData('phone_number', e.target.value)}
                    placeholder="+251911234567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="id_number">{t('dataCollector.registerFarmer.idNumber')} *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => updateFormData('id_number', e.target.value)}
                    placeholder="ET1234567890"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">{t('dataCollector.registerFarmer.dateOfBirth')} *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">{t('dataCollector.registerFarmer.gender')} *</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.locationInfo')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">{t('dataCollector.registerFarmer.region')} *</Label>
                  <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                      <SelectItem value="Amhara">Amhara</SelectItem>
                      <SelectItem value="Oromia">Oromia</SelectItem>
                      <SelectItem value="SNNPR">SNNPR</SelectItem>
                      <SelectItem value="Tigray">Tigray</SelectItem>
                      <SelectItem value="Afar">Afar</SelectItem>
                      <SelectItem value="Benishangul-Gumuz">Benishangul-Gumuz</SelectItem>
                      <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                      <SelectItem value="Gambella">Gambella</SelectItem>
                      <SelectItem value="Harari">Harari</SelectItem>
                      <SelectItem value="Somali">Somali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zone">{t('dataCollector.registerFarmer.zone')} *</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) => updateFormData('zone', e.target.value)}
                    placeholder="Enter zone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="woreda">{t('dataCollector.registerFarmer.woreda')} *</Label>
                  <Input
                    id="woreda"
                    value={formData.woreda}
                    onChange={(e) => updateFormData('woreda', e.target.value)}
                    placeholder="Enter woreda"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="kebele">{t('dataCollector.registerFarmer.kebele')} *</Label>
                  <Input
                    id="kebele"
                    value={formData.kebele}
                    onChange={(e) => updateFormData('kebele', e.target.value)}
                    placeholder="Enter kebele"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="village">{t('dataCollector.registerFarmer.village')} *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => updateFormData('village', e.target.value)}
                    placeholder="Enter village"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.personalDetails')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marital_status">{t('dataCollector.registerFarmer.maritalStatus')} *</Label>
                  <Select value={formData.marital_status} onValueChange={(value) => updateFormData('marital_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="family_size">{t('dataCollector.registerFarmer.familySize')} *</Label>
                  <Input
                    id="family_size"
                    type="number"
                    min="1"
                    value={formData.family_size}
                    onChange={(e) => updateFormData('family_size', parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="education_level">{t('dataCollector.registerFarmer.educationLevel')} *</Label>
                  <Select value={formData.education_level} onValueChange={(value) => updateFormData('education_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Education</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="tertiary">Tertiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary_occupation">{t('dataCollector.registerFarmer.primaryOccupation')} *</Label>
                  <Select value={formData.primary_occupation} onValueChange={(value) => updateFormData('primary_occupation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farming">Farming</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Financial Information */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.financialInfo')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_income">{t('dataCollector.registerFarmer.monthlyIncome')} (ETB) *</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    min="0"
                    value={formData.monthly_income}
                    onChange={(e) => updateFormData('monthly_income', parseInt(e.target.value) || 0)}
                    placeholder="Enter monthly income"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="has_bank_account"
                      type="checkbox"
                      checked={formData.has_bank_account}
                      onChange={(e) => updateFormData('has_bank_account', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="has_bank_account">{t('dataCollector.registerFarmer.hasBankAccount')}</Label>
                  </div>
                </div>
                
                {formData.has_bank_account && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">{t('dataCollector.registerFarmer.bankName')}</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => updateFormData('bank_name', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="account_number">{t('dataCollector.registerFarmer.accountNumber')}</Label>
                      <Input
                        id="account_number"
                        value={formData.account_number}
                        onChange={(e) => updateFormData('account_number', e.target.value)}
                        placeholder="Enter account number"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Farm Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.farmInfo')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_size_hectares">{t('dataCollector.registerFarmer.farmSize')} (hectares) *</Label>
                  <Input
                    id="farm_size_hectares"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.farm_size_hectares}
                    onChange={(e) => updateFormData('farm_size_hectares', parseFloat(e.target.value) || 0)}
                    placeholder="Enter farm size"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary_crop">{t('dataCollector.registerFarmer.primaryCrop')} *</Label>
                  <Input
                    id="primary_crop"
                    value={formData.primary_crop}
                    onChange={(e) => updateFormData('primary_crop', e.target.value)}
                    placeholder="Enter primary crop"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="livestock_count">{t('dataCollector.registerFarmer.livestockCount')}</Label>
                  <Input
                    id="livestock_count"
                    type="number"
                    min="0"
                    value={formData.livestock_count}
                    onChange={(e) => updateFormData('livestock_count', parseInt(e.target.value) || 0)}
                    placeholder="Enter livestock count"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('dataCollector.registerFarmer.secondaryCrops')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                         {['Maize', 'Wheat', 'Barley', 'Teff', 'Sorghum', 'Beans', 'Potatoes', 'Coffee'].map((crop) => (
                       <div key={crop} className="flex items-center space-x-2">
                         <input
                           id={`crop-${crop}`}
                           type="checkbox"
                           checked={formData.secondary_crops.includes(crop)}
                           onChange={(e) => handleSecondaryCropChange(crop, e.target.checked)}
                           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                         />
                         <Label htmlFor={`crop-${crop}`} className="text-sm">{crop}</Label>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Emergency Contact */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold">{t('dataCollector.registerFarmer.emergencyContact')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">{t('dataCollector.registerFarmer.emergencyContactName')} *</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">{t('dataCollector.registerFarmer.emergencyContactPhone')} *</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                    placeholder="+251911234567"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergency_contact_relationship">{t('dataCollector.registerFarmer.emergencyContactRelationship')} *</Label>
                  <Input
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => updateFormData('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('dataCollector.registerFarmer.previous')}</span>
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={!validateStep(currentStep)}
            className="flex items-center space-x-2"
          >
            <span>{t('dataCollector.registerFarmer.next')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading || !validateStep(currentStep)}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t('common.loading') : t('dataCollector.registerFarmer.submit')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default RegisterFarmer;
