import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useRoleState } from '@/core/hooks/useRoleState';
import { useImpersonationStore } from '@/core/store/impersonationStore';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserCheck, 
  Building2, 
  Shield,
  ChevronDown,
  Check
} from 'lucide-react';

interface Role {
  id: 'farmer' | 'data-collector' | 'financial-institution' | 'admin';
  label: string;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  baseUrl: string;
}

const roles: Role[] = [
  {
    id: 'farmer',
    label: 'Farmer',
    labelKey: 'common.roles.farmer',
    icon: <Users className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800',
    baseUrl: '/farmer'
  },
  {
    id: 'data-collector',
    label: 'Data Collector',
    labelKey: 'common.roles.dataCollector',
    icon: <UserCheck className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800',
    baseUrl: '/data-collector'
  },
  {
    id: 'financial-institution',
    label: 'Financial Institution',
    labelKey: 'common.roles.financialInstitution',
    icon: <Building2 className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-800',
    baseUrl: '/financial-institution'
  },
  {
    id: 'admin',
    label: 'Administrator',
    labelKey: 'common.roles.admin',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800',
    baseUrl: '/admin'
  }
];

interface RoleSwitcherProps {
  title?: string;
  userRole?: 'farmer' | 'data-collector' | 'financial-institution' | 'admin';
}

const roleColors = {
  'farmer': 'bg-green-600',
  'data-collector': 'bg-blue-600', 
  'financial-institution': 'bg-purple-600',
  'admin': 'bg-red-600'
};

const roleLetters = {
  'farmer': 'F',
  'data-collector': 'DC',
  'financial-institution': 'FI',
  'admin': 'A'
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  title,
  userRole 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRole, updateRole } = useRoleState();
  const { switchRoleAndSelectFirst } = useImpersonationStore();

  const selectedRole = roles.find(r => r.id === currentRole) || roles[0];
  
  // Use props if provided, otherwise derive from current role
  const displayRole = userRole || currentRole;
  const displayTitle = title || t(selectedRole.labelKey);
  const logoColorClass = roleColors[displayRole];
  const logoText = roleLetters[displayRole];

  const handleRoleChange = async (role: Role) => {
    // Switch role and automatically select the first user if available
    if (role.id === 'farmer' || role.id === 'data-collector') {
      await switchRoleAndSelectFirst(role.id);
    }
    
    updateRole(role.id);
    
    // Navigate to the role's base URL
    navigate({ to: role.baseUrl as any });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors group">
          <div className={`w-8 h-8 ${logoColorClass} rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{logoText}</span>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">
              {displayTitle}
            </h1>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
          {t('common.switchRole')}
        </div>
        
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => handleRoleChange(role)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 ${role.color} rounded-full flex items-center justify-center`}>
                {role.icon}
              </div>
              <span className="text-sm">{t(role.labelKey)}</span>
            </div>
            
            {selectedRole.id === role.id && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
