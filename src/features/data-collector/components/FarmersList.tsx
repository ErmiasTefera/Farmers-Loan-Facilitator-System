import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/core/store/authStore';
import { dataCollectorAPI, type FarmerRegistration, type FarmerSearchFilters } from '../data-collector.api';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Phone,
  Calendar,
  Plus
} from 'lucide-react';

const FarmersList: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState<FarmerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FarmerSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataCollectorId, setDataCollectorId] = useState<string | null>(null);

  const itemsPerPage = 20;

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

  useEffect(() => {
    if (dataCollectorId) {
      fetchFarmers();
    }
  }, [dataCollectorId, currentPage, filters]);

  const fetchFarmers = async () => {
    if (!dataCollectorId) return;
    
    try {
      setLoading(true);
      const result = await dataCollectorAPI.getAssignedFarmers(
        dataCollectorId,
        { ...filters, search_term: searchTerm },
        currentPage,
        itemsPerPage
      );
      setFarmers(result.farmers);
      setTotalFarmers(result.total);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFarmers();
  };

  const handleFilterChange = (key: keyof FarmerSearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
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
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalFarmers / itemsPerPage);

  if (loading && farmers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dataCollector.farmers.title')}
          </h1>
          <p className="text-gray-600">
            {totalFarmers} {t('dataCollector.farmers.totalFarmers')}
          </p>
        </div>
        <Button onClick={() => window.location.href = '/data-collector/register-farmer'} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>{t('dataCollector.farmers.registerNew')}</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={t('dataCollector.farmers.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>{t('common.search')}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>{t('dataCollector.farmers.filters.title')}</span>
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>{t('dataCollector.farmers.filters.region')}</Label>
                  <Select value={filters.region || ''} onValueChange={(value) => handleFilterChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                      <SelectItem value="Amhara">Amhara</SelectItem>
                      <SelectItem value="Oromia">Oromia</SelectItem>
                      <SelectItem value="SNNPR">SNNPR</SelectItem>
                      <SelectItem value="Tigray">Tigray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('dataCollector.farmers.filters.status')}</Label>
                  <Select value={filters.verification_status || ''} onValueChange={(value) => handleFilterChange('verification_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('dataCollector.farmers.filters.dateRange')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.registration_date_from || ''}
                      onChange={(e) => handleFilterChange('registration_date_from', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.registration_date_to || ''}
                      onChange={(e) => handleFilterChange('registration_date_to', e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end space-x-2">
                  <Button variant="outline" onClick={clearFilters}>
                    {t('dataCollector.farmers.filters.clear')}
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    {t('dataCollector.farmers.filters.apply')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Farmers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t('dataCollector.farmers.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {farmers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('dataCollector.farmers.noFarmers')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmers.map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => window.location.href = `/data-collector/farmers/${farmer.id}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {farmer.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{farmer.full_name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{farmer.phone_number}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{farmer.region}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(farmer.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(farmer.verification_status)}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => window.location.href = `/data-collector/farmers/${farmer.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                {t('dataCollector.farmers.showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalFarmers)} {t('dataCollector.farmers.of')} {totalFarmers}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmersList;
