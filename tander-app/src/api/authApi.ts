import apiClient from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from './config';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CompleteProfileRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  nickName: string;
  address?: string;
  phone?: string;
  email: string;
  birthDate: string;
  age: number;
  country: string;
  city: string;
  civilStatus: string;
  hobby?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ProfileIncompleteError {
  message: string;
  profileCompleted: boolean;
  username: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<string> => {
    try {
      const response = await apiClient.post('/user/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/user/login', data);
      const token = response.headers['jwt-token'];

      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }

      return {
        message: response.data,
        token: token || '',
      };
    } catch (error: any) {
      // Handle profile incomplete error (403 with profileCompleted: false)
      if (error.response?.status === 403 && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.profileCompleted === false) {
          // Create custom error with profile incomplete info
          const profileError: any = new Error(errorData.message);
          profileError.profileIncomplete = true;
          profileError.username = errorData.username;
          throw profileError;
        }
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  completeProfile: async (username: string, data: CompleteProfileRequest): Promise<string> => {
    try {
      const response = await apiClient.post(`/user/complete-profile?username=${username}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile completion failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await authApi.getToken();
    return !!token;
  },
};

export default authApi;
