import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/core/store/authStore';
import { dataCollectorAPI, type FarmerRegistration } from '../data-collector.api';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  AlertCircle,
  FileText,
  Banknote,
  Heart
} from 'lucide-react';

const FarmerDetails: React.FC = () => {
  const { farmerId } = useParams({ from: '/data-collector/farmers/$farmerId' });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [farmer, setFarmer] = useState<FarmerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    action: 'verified' | 'rejected' | null;
    title: string;
    message: string;
  }>({
    show: false,
    action: null,
    title: '',
    message: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<FarmerRegistration>>({});

  useEffect(() => {
    fetchFarmerDetails();
  }, [farmerId]);

  const fetchFarmerDetails = async () => {
    if (!farmerId) return;
    
    try {
      setLoading(true);
      const farmerData = await dataCollectorAPI.getFarmerDetails(farmerId);
      setFarmer(farmerData);
      if (farmerData) {
        setVerificationNotes(farmerData.verification_notes || '');
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch farmer details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationClick = (action: 'verified' | 'rejected') => {
    const title = action === 'verified' 
      ? t('dataCollector.farmerDetails.confirmVerify')
      : t('dataCollector.farmerDetails.confirmReject');
    
    const message = action === 'verified'
      ? t('dataCollector.farmerDetails.confirmVerifyMessage')
      : t('dataCollector.farmerDetails.confirmRejectMessage');

    setShowConfirmDialog({
      show: true,
      action,
      title,
      message
    });
  };

  const handleConfirmVerification = async () => {
    if (!farmer || !user?.id || !showConfirmDialog.action) return;

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await dataCollectorAPI.updateFarmerVerification(
        farmer.id,
        showConfirmDialog.action,
        verificationNotes,
        user.id
      );
      
      // Close dialog
      setShowConfirmDialog({
        show: false,
        action: null,
        title: '',
        message: ''
      });

      // Show success message
      const successMessage = showConfirmDialog.action === 'verified'
        ? t('dataCollector.farmerDetails.verificationSuccess')
        : t('dataCollector.farmerDetails.rejectionSuccess');
      
      setSuccess(successMessage);
      
      // Refresh farmer data
      await fetchFarmerDetails();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating verification status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update verification status');
      setShowConfirmDialog({
        show: false,
        action: null,
        title: '',
        message: ''
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog({
      show: false,
      action: null,
      title: '',
      message: ''
    });
  };

  const handleEditClick = () => {
    if (farmer) {
      setEditFormData({
        full_name: farmer.full_name,
        phone_number: farmer.phone_number,
        id_number: farmer.id_number,
        date_of_birth: farmer.date_of_birth,
        gender: farmer.gender,
        marital_status: farmer.marital_status,
        family_size: farmer.family_size,
        education_level: farmer.education_level,
        primary_occupation: farmer.primary_occupation,
        region: farmer.region,
        zone: farmer.zone,
        woreda: farmer.woreda,
        kebele: farmer.kebele,
        village: farmer.village,
        monthly_income: farmer.monthly_income,
        has_bank_account: farmer.has_bank_account,
        bank_name: farmer.bank_name,
        account_number: farmer.account_number,
        farm_size_hectares: farmer.farm_size_hectares,
        primary_crop: farmer.primary_crop,
        secondary_crops: farmer.secondary_crops,
        livestock_count: farmer.livestock_count,
        emergency_contact_name: farmer.emergency_contact_name,
        emergency_contact_phone: farmer.emergency_contact_phone,
        emergency_contact_relationship: farmer.emergency_contact_relationship,
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({});
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!farmer || !user?.id) return;

    try {
      setUpdating(true);
      setError(null);
      
      await dataCollectorAPI.updateFarmerDetails(farmer.id, editFormData);
      
      setSuccess(t('dataCollector.farmerDetails.editSuccess'));
      setIsEditing(false);
      setEditFormData({});
      
      // Refresh farmer data
      await fetchFarmerDetails();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating farmer details:', error);
      setError(error instanceof Error ? error.message : 'Failed to update farmer details');
    } finally {
      setUpdating(false);
    }
  };

  const updateEditFormData = (field: keyof FarmerRegistration, value: string | number | boolean | string[]) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate({ to: '/data-collector/farmers' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate({ to: '/data-collector/farmers' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('dataCollector.farmerDetails.notFound')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate({ to: '/data-collector/farmers' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farmer.full_name}</h1>
            <p className="text-gray-600">{t('dataCollector.farmerDetails.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(farmer.verification_status)}
          {isEditing ? (
            <>
              <Button
                onClick={handleSaveEdit}
                disabled={updating}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {updating ? t('common.loading') : t('common.save')}
              </Button>
              <Button
                onClick={handleCancelEdit}
                disabled={updating}
                variant="outline"
                size="sm"
              >
                {t('common.cancel')}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditClick}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
      {/* Verification Actions */}
      {(!farmer.verification_status || farmer.verification_status === 'pending') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">{t('dataCollector.farmerDetails.verificationActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verification-notes">{t('dataCollector.farmerDetails.verificationNotes')}</Label>
              <textarea
                id="verification-notes"
                value={verificationNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationNotes(e.target.value)}
                placeholder={t('dataCollector.farmerDetails.verificationNotesPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleVerificationClick('verified')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updating ? t('common.loading') : t('dataCollector.farmerDetails.verify')}
              </Button>
              <Button
                onClick={() => handleVerificationClick('rejected')}
                disabled={updating}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {updating ? t('common.loading') : t('dataCollector.farmerDetails.reject')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>{t('dataCollector.farmerDetails.personalInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.fullName')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.full_name || ''}
                    onChange={(e) => updateEditFormData('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.full_name}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.phoneNumber')}</Label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editFormData.phone_number || ''}
                    onChange={(e) => updateEditFormData('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {farmer.phone_number}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.idNumber')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.id_number || ''}
                    onChange={(e) => updateEditFormData('id_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.id_number}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.dateOfBirth')}</Label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editFormData.date_of_birth || ''}
                    onChange={(e) => updateEditFormData('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(farmer.date_of_birth)}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.gender')}</Label>
                {isEditing ? (
                  <select
                    value={editFormData.gender || ''}
                    onChange={(e) => updateEditFormData('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('dataCollector.registerFarmer.selectGender')}</option>
                    <option value="male">{t('dataCollector.registerFarmer.male')}</option>
                    <option value="female">{t('dataCollector.registerFarmer.female')}</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium capitalize">{farmer.gender}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.maritalStatus')}</Label>
                {isEditing ? (
                  <select
                    value={editFormData.marital_status || ''}
                    onChange={(e) => updateEditFormData('marital_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('dataCollector.registerFarmer.selectMaritalStatus')}</option>
                    <option value="single">{t('dataCollector.registerFarmer.single')}</option>
                    <option value="married">{t('dataCollector.registerFarmer.married')}</option>
                    <option value="divorced">{t('dataCollector.registerFarmer.divorced')}</option>
                    <option value="widowed">{t('dataCollector.registerFarmer.widowed')}</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium capitalize">{farmer.marital_status}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.familySize')}</Label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    value={editFormData.family_size || ''}
                    onChange={(e) => updateEditFormData('family_size', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {farmer.family_size} {t('dataCollector.farmerDetails.members')}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.educationLevel')}</Label>
                {isEditing ? (
                  <select
                    value={editFormData.education_level || ''}
                    onChange={(e) => updateEditFormData('education_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('dataCollector.registerFarmer.selectEducation')}</option>
                    <option value="none">{t('dataCollector.registerFarmer.none')}</option>
                    <option value="primary">{t('dataCollector.registerFarmer.primary')}</option>
                    <option value="secondary">{t('dataCollector.registerFarmer.secondary')}</option>
                    <option value="high_school">{t('dataCollector.registerFarmer.highSchool')}</option>
                    <option value="university">{t('dataCollector.registerFarmer.university')}</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {farmer.education_level}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.primaryOccupation')}</Label>
                {isEditing ? (
                  <select
                    value={editFormData.primary_occupation || ''}
                    onChange={(e) => updateEditFormData('primary_occupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('dataCollector.registerFarmer.selectOccupation')}</option>
                    <option value="farmer">{t('dataCollector.registerFarmer.farmer')}</option>
                    <option value="agricultural_worker">{t('dataCollector.registerFarmer.agriculturalWorker')}</option>
                    <option value="livestock_keeper">{t('dataCollector.registerFarmer.livestockKeeper')}</option>
                    <option value="other">{t('dataCollector.registerFarmer.other')}</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium capitalize">{farmer.primary_occupation}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>{t('dataCollector.farmerDetails.locationInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.region')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.region || ''}
                    onChange={(e) => updateEditFormData('region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.region}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.zone')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.zone || ''}
                    onChange={(e) => updateEditFormData('zone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.zone}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.woreda')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.woreda || ''}
                    onChange={(e) => updateEditFormData('woreda', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.woreda}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.kebele')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.kebele || ''}
                    onChange={(e) => updateEditFormData('kebele', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.kebele}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.village')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.village || ''}
                    onChange={(e) => updateEditFormData('village', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.village}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            <span>{t('dataCollector.farmerDetails.financialInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.monthlyIncome')}</Label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editFormData.monthly_income || ''}
                    onChange={(e) => updateEditFormData('monthly_income', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{formatCurrency(farmer.monthly_income)}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.hasBankAccount')}</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.has_bank_account || false}
                        onChange={(e) => updateEditFormData('has_bank_account', e.target.checked)}
                        className="mr-2"
                      />
                      {t('common.yes')}
                    </label>
                  </div>
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    {farmer.has_bank_account ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {t('common.yes')}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        {t('common.no')}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
            {(farmer.has_bank_account || editFormData.has_bank_account) && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.bankName')}</Label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.bank_name || ''}
                      onChange={(e) => updateEditFormData('bank_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg font-medium flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-gray-400" />
                      {farmer.bank_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.accountNumber')}</Label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.account_number || ''}
                      onChange={(e) => updateEditFormData('account_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg font-medium">{farmer.account_number}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Farm Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>{t('dataCollector.farmerDetails.farmInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.farmSize')}</Label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editFormData.farm_size_hectares || ''}
                    onChange={(e) => updateEditFormData('farm_size_hectares', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.farm_size_hectares} hectares</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.primaryCrop')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.primary_crop || ''}
                    onChange={(e) => updateEditFormData('primary_crop', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.primary_crop}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.livestockCount')}</Label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editFormData.livestock_count || ''}
                    onChange={(e) => updateEditFormData('livestock_count', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.livestock_count} {t('dataCollector.farmerDetails.animals')}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.secondaryCrops')}</Label>
                {isEditing ? (
                  <textarea
                    value={Array.isArray(editFormData.secondary_crops) ? editFormData.secondary_crops.join(', ') : ''}
                    onChange={(e) => {
                      const crops = e.target.value.split(',').map(crop => crop.trim()).filter(crop => crop.length > 0);
                      updateEditFormData('secondary_crops', crops);
                    }}
                    placeholder="Enter crops separated by commas"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {farmer.secondary_crops?.map((crop, index) => (
                      <Badge key={index} variant="secondary">{crop}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span>{t('dataCollector.farmerDetails.emergencyContact')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.emergencyContactName')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.emergency_contact_name || ''}
                    onChange={(e) => updateEditFormData('emergency_contact_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.emergency_contact_name}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.emergencyContactPhone')}</Label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editFormData.emergency_contact_phone || ''}
                    onChange={(e) => updateEditFormData('emergency_contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {farmer.emergency_contact_phone}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.registerFarmer.emergencyContactRelationship')}</Label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.emergency_contact_relationship || ''}
                    onChange={(e) => updateEditFormData('emergency_contact_relationship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-medium">{farmer.emergency_contact_relationship}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>{t('dataCollector.farmerDetails.registrationInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.farmerDetails.registrationDate')}</Label>
                <p className="text-lg font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(farmer.created_at)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.farmerDetails.lastUpdated')}</Label>
                <p className="text-lg font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(farmer.updated_at)}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('dataCollector.farmerDetails.verificationStatus')}</Label>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(farmer.verification_status)}
                  {farmer.verified_at && (
                    <span className="text-sm text-gray-500">
                      {t('dataCollector.farmerDetails.verifiedOn')} {formatDate(farmer.verified_at)}
                    </span>
                  )}
                </div>
              </div>
              {farmer.verification_notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">{t('dataCollector.farmerDetails.verificationNotes')}</Label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{farmer.verification_notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>{showConfirmDialog.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{showConfirmDialog.message}</p>
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelConfirmation}
                  disabled={updating}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleConfirmVerification}
                  disabled={updating}
                  className={showConfirmDialog.action === 'verified' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={showConfirmDialog.action === 'rejected' ? 'destructive' : 'default'}
                >
                  {updating ? t('common.loading') : t('common.confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FarmerDetails;
