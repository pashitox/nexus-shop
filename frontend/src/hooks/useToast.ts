import { useCallback } from 'react';
import { useToast as useToastContext, ToastType } from '../components/ui/Toast';

export const useToast = () => {
  const { addToast } = useToastContext();

  const toast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    addToast({ type, title, message, duration });
  }, [addToast]);

  const success = useCallback((title: string, message?: string) => {
    toast('success', title, message);
  }, [toast]);

  const error = useCallback((title: string, message?: string) => {
    toast('error', title, message);
  }, [toast]);

  const warning = useCallback((title: string, message?: string) => {
    toast('warning', title, message);
  }, [toast]);

  const info = useCallback((title: string, message?: string) => {
    toast('info', title, message);
  }, [toast]);

  return { toast, success, error, warning, info };
};