import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://localhost:8080';

export const TOKEN_KEY = '@tander_jwt_token';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Jwt-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const token = response.headers['jwt-token'];
    if (token) {
      AsyncStorage.setItem(TOKEN_KEY, token);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
