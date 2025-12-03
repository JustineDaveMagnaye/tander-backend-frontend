import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, Phase1RegistrationData } from './AuthContext';
import authApi, { LoginRequest, RegisterRequest, CompleteProfileRequest } from '../api/authApi';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [phase1Data, setPhase1Data] = useState<Phase1RegistrationData | null>(null);

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
    } catch (error: any) {
      // If profile is incomplete, store credentials for Phase 2 completion
      if (error.profileIncomplete && error.username) {
        setPhase1Data({
          username: error.username,
          email: credentials.username, // Store the entered username (could be email)
          password: credentials.password,
        });
      }
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      console.log('🟢 [AuthProvider.register] Called with data:', data);
      const result = await authApi.register(data);
      console.log('🟢 [AuthProvider.register] Success! Result:', result);
      return result;
    } catch (error) {
      console.error('🔴 [AuthProvider.register] Error:', error);
      throw error;
    }
  };

  const completeProfile = async (username: string, data: CompleteProfileRequest, markAsComplete: boolean = true) => {
    try {
      console.log(`🟡 [AuthProvider.completeProfile] markAsComplete=${markAsComplete}`);
      await authApi.completeProfile(username, data, markAsComplete);
      console.log('✅ [AuthProvider.completeProfile] Success');
    } catch (error) {
      console.error('🔴 [AuthProvider.completeProfile] Error:', error);
      throw error;
    }
  };

  const updateProfile = async (username: string, data: CompleteProfileRequest, markAsComplete: boolean = false) => {
    try {
      console.log(`🟡 [AuthProvider.updateProfile] PATCH request with markAsComplete=${markAsComplete}`);
      await authApi.updateProfile(username, data, markAsComplete);
      console.log('✅ [AuthProvider.updateProfile] Success');
    } catch (error) {
      console.error('🔴 [AuthProvider.updateProfile] Error:', error);
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
        phase1Data,
        login,
        register,
        completeProfile,
        updateProfile,
        logout,
        checkAuth,
        setPhase1Data,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
