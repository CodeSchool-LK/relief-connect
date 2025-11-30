import React from 'react';
import { UserRole } from '../types/user';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SYSTEM_ADMINISTRATOR':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'VOLUNTEER_CLUB':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'SYSTEM_ADMINISTRATOR':
        return 'System Admin';
      case 'VOLUNTEER_CLUB':
        return 'Volunteer Club';
      case 'USER':
        return 'User';
      default:
        return role;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)} ${className}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

