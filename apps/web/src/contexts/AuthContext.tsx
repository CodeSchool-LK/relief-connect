import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types/user';
import apiClient from '../services/api-client';

interface User {
  id: number;
  username: string;
  role: UserRole;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  isVolunteerClub: () => boolean;
  isSystemAdministrator: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          // Try to get current user from API
          try {
            const response = await apiClient.get<{ success: boolean; data?: User }>('/api/users/me');
            if (response.success && response.data) {
              setUser(response.data);
            }
          } catch (error) {
            console.error('Error loading user:', error);
            // Token might be invalid, clear it
            apiClient.clearTokens();
          }
        }
      } catch (error) {
        console.error('Error in loadUser:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    apiClient.setTokens(accessToken, refreshToken);
    setUser(userData);
    // Also update localStorage for backward compatibility
    const donorUser = {
      name: userData.username,
      identifier: userData.username,
      loggedIn: true,
    };
    localStorage.setItem('donor_user', JSON.stringify(donorUser));
  };

  const logout = () => {
    apiClient.clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data?: User }>('/api/users/me');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMINISTRATOR';
  };

  const isVolunteerClub = (): boolean => {
    return user?.role === 'VOLUNTEER_CLUB';
  };

  const isSystemAdministrator = (): boolean => {
    return user?.role === 'SYSTEM_ADMINISTRATOR';
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    isAdmin,
    isVolunteerClub,
    isSystemAdministrator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

