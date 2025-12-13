import { ApiError } from './api-client';
import { useToast } from '@/contexts/ToastContext';

export const handleApiError = (error: ApiError, toast: ReturnType<typeof useToast>['toast']) => {
  console.error('API Error:', error);
  
  // Handle specific error cases
  if (error.status === 401) {
    toast({
      title: "Authentication Failed",
      description: "Your session has expired. Please login again.",
      variant: "destructive",
    });
  } else if (error.status === 403) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to perform this action.",
      variant: "destructive",
    });
  } else if (error.status === 404) {
    toast({
      title: "Resource Not Found",
      description: "The requested resource was not found.",
      variant: "destructive",
    });
  } else if (error.status === 500) {
    toast({
      title: "Server Error",
      description: "An internal server error occurred. Please try again later.",
      variant: "destructive",
    });
  } else if (error.code === 'NO_RESPONSE') {
    toast({
      title: "Connection Error",
      description: "Unable to connect to the server. Please check your internet connection.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
  }
};


