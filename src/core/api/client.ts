// Axios client setup
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth headers and logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log outgoing requests
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log error responses
    if (error.response) {
      console.error(`❌ [API Error] ${error.response.status} ${error.response.config.url}`, error.response.data);
      
      // Handle 401 unauthorized - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        // You might want to redirect to login page here
        window.location.href = '/login';
      }
    } else {
      console.error('❌ [Network Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
