import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
import { handleApiError } from '@/lib/api-error-handler';
import { useToast } from '@/contexts/ToastContext';
import { AxiosResponse } from 'axios';

type ApiMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface ApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export const useApi = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const execute = async <T>(
    method: ApiMethod,
    url: string,
    data?: any,
    options: ApiOptions<T> = {},
    headers?: Record<string, string>
  ) => {
    setIsLoading(true);
    try {
      let response;
      const config = headers ? { headers } : undefined;
      if (method === 'get' || method === 'delete') {
        response = await apiClient[method]<T>(url, config);
      } else {
        response = await apiClient[method]<T>(url, data, config);
      }
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      if (options.showSuccessToast) {
        toast({
          title: "Success",
          description: options.successMessage || "Operation completed successfully",
        });
      }
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (options.onError) {
        options.onError(apiError);
      } else {
        handleApiError(apiError, toast);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
};


