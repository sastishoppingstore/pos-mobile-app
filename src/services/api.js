import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// IMPORTANT: Replace with your actual cPanel domain
export const API_URL = 'https://fileen.store/company/api_mobile.php';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Check network connectivity
export const isOnline = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// API calls with offline fallback
export const apiCall = async (action, method = 'GET', data = null) => {
  try {
    const online = await isOnline();
    
    if (!online) {
      throw new Error('offline');
    }

    const config = {
      method,
      url: `?action=${action}`,
    };

    if (data && method !== 'GET') {
      config.data = data;
    }

    const response = await api(config);
    return response.data;
  } catch (error) {
    if (error.message === 'offline') {
      throw error;
    }
    throw new Error(error.response?.data?.error || 'Network error');
  }
};

export default api;
