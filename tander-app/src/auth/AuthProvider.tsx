import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import authApi, { LoginRequest, RegisterRequest, CompleteProfileRequest } from '../api/authApi';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await authApi.getToken();
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      setToken(response.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authApi.register(data);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const completeProfile = async (username: string, data: CompleteProfileRequest) => {
    try {
      await authApi.completeProfile(username, data);
    } catch (error) {
      console.error('Complete profile error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        login,
        register,
        completeProfile,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
