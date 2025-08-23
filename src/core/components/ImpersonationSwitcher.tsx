import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImpersonationStore, type ImpersonationUser } from '@/core/store/impersonationStore';
import { useRoleState } from '@/core/hooks/useRoleState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  Loader2,
  User,
  UserCog,
} from 'lucide-react';

interface ImpersonationSwitcherProps {
  className?: string;
}

export const ImpersonationSwitcher: React.FC<ImpersonationSwitcherProps> = ({
  className = ""
}) => {
  const { t } = useTranslation();
  const { currentRole } = useRoleState();
  
  const {
    isImpersonating,
    impersonatedUser,
    availableUsers,
    loading,
    error,
    startImpersonation,
    stopImpersonation,
    loadUsersForRole,
    clearError
  } = useImpersonationStore();

  const [isOpen, setIsOpen] = useState(false);

  // Determine which role users to show based on current role
  const getTargetRole = (): 'farmer' | 'data-collector' | null => {
    if (currentRole === 'farmer') return 'farmer';
    if (currentRole === 'data-collector') return 'data-collector';
    return null; // Don't show impersonation for other roles
  };

  const targetRole = getTargetRole();
  const roleUsers = targetRole ? availableUsers[targetRole] || [] : [];

  // Load users when dropdown opens and target role is available
  useEffect(() => {
    if (isOpen && targetRole && roleUsers.length === 0 && !loading) {
      loadUsersForRole(targetRole);
    }
  }, [isOpen, targetRole, roleUsers.length, loading, loadUsersForRole]);

  // Handle user selection
  const handleUserSelect = (user: ImpersonationUser) => {
    startImpersonation(user);
    setIsOpen(false);
    clearError();
    
    // Refresh the page to load new user's data
    window.location.reload();
  };

  // Handle stop impersonation
  const handleStopImpersonation = () => {
    stopImpersonation();
    setIsOpen(false);
    
    // Refresh the page to load original user's data
    window.location.reload();
  };

  // Don't render if no target role (e.g., admin, financial-institution)
  if (!targetRole) {
    return null;
  }

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return <User className="w-4 h-4" />;
      case 'data-collector':
        return <UserCog className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-dashed"
          >
            {isImpersonating && impersonatedUser ? (
              <>
                <UserCheck className="w-4 h-4 mr-2 text-orange-600" />
                <span className="hidden sm:inline-block max-w-24 truncate">
                  {impersonatedUser.full_name}
                </span>
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-1" />
                  <span className="hidden sm:inline">Impersonating</span>
                  <span className="sm:hidden">•</span>
                </Badge>
              </>
            ) : (
              <>
                {getRoleIcon(targetRole)}
                <span className="hidden sm:inline-block ml-2">
                  {t(`common.roles.${targetRole}`)}s
                </span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center">
            {getRoleIcon(targetRole)}
            <span className="ml-2">
              {isImpersonating ? 'Current Impersonation' : `Select ${t(`common.roles.${targetRole}`)}`}
            </span>
          </DropdownMenuLabel>
          
          {isImpersonating && impersonatedUser && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-3 bg-orange-50 border border-orange-200 rounded-sm mx-2 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-800 truncate">
                      {impersonatedUser.full_name}
                    </p>
                    <p className="text-xs text-orange-600">
                      {impersonatedUser.region && `${impersonatedUser.region} • `}
                      {impersonatedUser.phone_number}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStopImpersonation}
                    className="text-orange-700 hover:text-orange-800 hover:bg-orange-100 ml-2"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          {error && (
            <div className="px-2 py-2 text-xs text-red-600 bg-red-50 mx-2 mb-2 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading users...</span>
            </div>
          ) : roleUsers.length === 0 ? (
            <div className="px-2 py-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                No {t(`common.roles.${targetRole}`)}s found
              </p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {roleUsers.map((user) => (
                <DropdownMenuItem
                  key={user.entity_id}
                  onClick={() => handleUserSelect(user)}
                  disabled={isImpersonating && impersonatedUser?.entity_id === user.entity_id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.region && `${user.region} • `}
                      {user.phone_number}
                    </p>
                  </div>
                  {isImpersonating && impersonatedUser?.entity_id === user.entity_id && (
                    <UserCheck className="w-4 h-4 text-orange-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {!isImpersonating && roleUsers.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs text-gray-500">
                Select a {t(`common.roles.${targetRole}`)} to test their perspective
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
