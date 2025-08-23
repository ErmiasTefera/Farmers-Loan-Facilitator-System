import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/core/store/authStore';
import { dataCollectorAPI, type FarmerRegistration } from '../data-collector.api';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Users,
  RefreshCw,
  FileText,
  TrendingUp
} from 'lucide-react';

interface VerificationStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  verificationRate: number;
}

const Verifications: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState<FarmerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    verificationRate: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    dateFrom: '',
    dateTo: ''
  });
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
      fetchVerifications();
    }
  }, [dataCollectorId, currentPage, filters]);

  const fetchVerifications = async () => {
    if (!dataCollectorId) return;
    
    try {
      setLoading(true);
      
      // Get all farmers for this data collector
      const result = await dataCollectorAPI.getAssignedFarmers(
        dataCollectorId,
        { ...filters, search_term: searchTerm },
        currentPage,
        itemsPerPage
      );
      
      setFarmers(result.farmers);
      
      // Calculate stats
      const total = result.total;
      const pending = result.farmers.filter(f => f.verification_status === 'pending').length;
      const verified = result.farmers.filter(f => f.verification_status === 'verified').length;
      const rejected = result.farmers.filter(f => f.verification_status === 'rejected').length;
      const verificationRate = total > 0 ? ((verified + rejected) / total) * 100 : 0;
      
      setStats({
        total,
        pending,
        verified,
        rejected,
        verificationRate
      });
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchVerifications();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      region: '',
      dateFrom: '',
      dateTo: ''
    });
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

  const getPriorityColor = (farmer: FarmerRegistration) => {
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(farmer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (farmer.verification_status === 'pending') {
      if (daysSinceRegistration > 7) return 'border-red-200 bg-red-50';
      if (daysSinceRegistration > 3) return 'border-yellow-200 bg-yellow-50';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const totalPages = Math.ceil(stats.total / itemsPerPage);

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
            {t('dataCollector.verifications.title')}
          </h1>
          <p className="text-gray-600">
            {t('dataCollector.verifications.subtitle')}
          </p>
        </div>
        <Button onClick={fetchVerifications} className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>{t('dataCollector.verifications.refresh')}</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">{t('dataCollector.verifications.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">{t('dataCollector.verifications.pending')}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">{t('dataCollector.verifications.verified')}</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">{t('dataCollector.verifications.rejected')}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">{t('dataCollector.verifications.verificationRate')}</p>
                <p className="text-2xl font-bold">{stats.verificationRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={t('dataCollector.verifications.searchPlaceholder')}
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
                <span>{t('dataCollector.verifications.filters.title')}</span>
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>{t('dataCollector.verifications.filters.status')}</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
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
                  <Label>{t('dataCollector.verifications.filters.region')}</Label>
                  <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
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
                  <Label>{t('dataCollector.verifications.filters.dateFrom')}</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('dataCollector.verifications.filters.dateTo')}</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={clearFilters}>
                    {t('dataCollector.verifications.filters.clear')}
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    {t('dataCollector.verifications.filters.apply')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{t('dataCollector.verifications.verificationList')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {farmers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('dataCollector.verifications.noVerifications')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmers.map((farmer) => (
                <div 
                  key={farmer.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${getPriorityColor(farmer)}`}
                >
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
                {t('dataCollector.verifications.showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, stats.total)} {t('dataCollector.verifications.of')} {stats.total}
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

export default Verifications;
