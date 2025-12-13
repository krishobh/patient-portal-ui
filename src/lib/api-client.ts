import axios, { AxiosError } from 'axios';

// Define error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3500',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to format error message
const formatErrorMessage = (error: AxiosError): ApiError => {

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const responseData = error.response.data as any;
    return {
      message: responseData.message || 'An error occurred',
      status: error.response.status,
      code: responseData.code,
      details: responseData.details,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response received from server',
      status: 0,
      code: 'NO_RESPONSE',
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'REQUEST_ERROR',
    };
  }
};

// Add request interceptor for loading state
apiClient.interceptors.request.use(
  (config) => {
    // Trigger loading state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-loading-start'));
    }
    return config;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-loading-end'));
    }
    return Promise.reject(formatErrorMessage(error));
  }
);

// Add response interceptor for loading state and error handling
apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-loading-end'));
    }
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-loading-end'));
    }
    return Promise.reject(formatErrorMessage(error));
  }
);

export default apiClient;


