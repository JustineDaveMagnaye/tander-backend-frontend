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

export interface IdVerificationError {
  message: string;
  idVerified: boolean;
  idVerificationStatus: string;
  username: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<string> => {
    try {
      console.log('🔵 [authApi.register] Starting registration...');
      console.log('🔵 [authApi.register] Data:', JSON.stringify(data, null, 2));
      console.log('🔵 [authApi.register] Endpoint: POST /user/register');

      const response = await apiClient.post('/user/register', data);

      console.log('✅ [authApi.register] Success! Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [authApi.register] Error occurred:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      console.error('   Full error:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Network error:', error.message);

      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
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
      // Handle 403 errors (profile incomplete OR id verification incomplete)
      if (error.response?.status === 403 && error.response?.data) {
        const errorData = error.response.data;

        // Check for profile incomplete error
        if (errorData.profileCompleted === false) {
          const profileError: any = new Error(errorData.message);
          profileError.profileIncomplete = true;
          profileError.username = errorData.username;
          throw profileError;
        }

        // Check for ID verification incomplete error
        if (errorData.idVerified === false) {
          const idError: any = new Error(errorData.message);
          idError.idVerificationIncomplete = true;
          idError.username = errorData.username;
          idError.idVerificationStatus = errorData.idVerificationStatus;
          throw idError;
        }
      }

      // Handle authentication failure (401 - invalid credentials)
      if (error.response?.status === 401) {
        const authError: any = new Error('Incorrect username or password');
        authError.code = 'INVALID_CREDENTIALS';
        throw authError;
      }

      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  completeProfile: async (username: string, data: CompleteProfileRequest, markAsComplete: boolean = true): Promise<string> => {
    try {
      console.log(`🟡 [authApi.completeProfile] Calling with markAsComplete=${markAsComplete}`);
      const response = await apiClient.post(`/user/complete-profile?username=${username}&markAsComplete=${markAsComplete}`, data);
      console.log('✅ [authApi.completeProfile] Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔴 [authApi.completeProfile] Error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Profile completion failed');
    }
  },

  verifyId: async (username: string, idPhotoFrontUri: string, recaptchaToken?: string): Promise<string> => {
    try {
      console.log(`🟡 [authApi.verifyId] Verifying ID for username: ${username}`);
      console.log(`🟡 [authApi.verifyId] Front photo URI: ${idPhotoFrontUri}`);
      console.log(`🟡 [authApi.verifyId] reCAPTCHA token: ${recaptchaToken ? 'present' : 'missing'}`);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('username', username);

      // Add front photo only (back is no longer required)
      formData.append('idPhotoFront', {
        uri: idPhotoFrontUri,
        type: 'image/jpeg',
        name: 'id-front.jpg',
      } as any);

      // Add reCAPTCHA token if provided
      if (recaptchaToken) {
        formData.append('recaptchaToken', recaptchaToken);
        console.log('🟡 [authApi.verifyId] Including reCAPTCHA token in request');
      } else {
        console.warn('⚠️ [authApi.verifyId] No reCAPTCHA token provided');
      }

      console.log('🟡 [authApi.verifyId] Sending multipart form data...');

      const response = await apiClient.post('/user/verify-id', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ [authApi.verifyId] Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔴 [authApi.verifyId] Error:', error.response?.data);
      // Backend returns error message as plain string in response.data, not as {message: "..."}
      const errorMessage = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || error.message || 'ID verification failed';
      throw new Error(errorMessage);
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
