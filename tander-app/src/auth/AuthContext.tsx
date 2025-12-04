import React, { createContext, useContext } from 'react';
import { LoginRequest, RegisterRequest, CompleteProfileRequest } from '../api/authApi';

export interface Phase1RegistrationData {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  phase1Data: Phase1RegistrationData | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  completeProfile: (username: string, data: CompleteProfileRequest, markAsComplete?: boolean) => Promise<void>;
  verifyId: (username: string, idPhotoFrontUri: string, recaptchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setPhase1Data: (data: Phase1RegistrationData | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
