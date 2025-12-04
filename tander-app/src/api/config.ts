import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Platform-specific API URL configuration
// - iOS Simulator: http://localhost:8080
// - Android Emulator: http://10.0.2.2:8080
// - Physical Device: Replace with your computer's IP address (e.g., http://192.168.1.100:8080)
// IMPORTANT: No trailing slash! (axios adds it automatically)
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Update this with your current tunnel URL (NO trailing slash)
      return 'https://creatures-newton-ferry-receiver.trycloudflare.com'; // ✅ NO trailing slash
    }
    return 'https://creatures-newton-ferry-receiver.trycloudflare.com'; // ✅ NO trailing slash
  }
  // Production URL - update this for production deployment (NO trailing slash)
  return 'https://creatures-newton-ferry-receiver.trycloudflare.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const TOKEN_KEY = '@tander_jwt_token';

// Log API configuration on startup
console.log('⚙️  [API Config] Platform:', Platform.OS);
console.log('⚙️  [API Config] Base URL:', API_BASE_URL);
console.log('⚙️  [API Config] Dev mode:', __DEV__);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Required for ngrok/cloudflare tunnels to work properly
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    'User-Agent': 'TanderMobileApp/1.0', // Identify as mobile app
  },
  timeout: 30000, // Increased timeout for tunnel latency (30 seconds)
  maxRedirects: 5, // Follow redirects from tunnels
  // ✅ Let axios handle errors naturally (401, 403 = errors, not success)
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log(`🌐 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('🌐 [API Request] Headers:', config.headers);
    if (config.data) {
      console.log('🌐 [API Request] Body:', JSON.stringify(config.data, null, 2));
    }

    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Jwt-Token'] = token;
      console.log('🔑 [API Request] Token added to headers');
    }
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    console.log('✅ [API Response] Data:', JSON.stringify(response.data, null, 2));

    const token = response.headers['jwt-token'];
    if (token) {
      AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('🔑 [API Response] JWT token saved');
    }
    return response;
  },
  async (error) => {
    console.error(`❌ [API Response Error] ${error.config?.url}`);
    console.error(`❌ [API Response Error] Status: ${error.response?.status}`);
    console.error(`❌ [API Response Error] Data:`, JSON.stringify(error.response?.data, null, 2));
    console.error(`❌ [API Response Error] Message:`, error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('🔑 [API Response] Token removed due to 401');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
