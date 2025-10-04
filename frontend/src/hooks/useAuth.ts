import { useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { apiClient } from '../types/api';
import { useToast } from './useToast';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const { error: toastError } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken && !isAuthenticated) {
        try {
          // ✅ CORREGIDO: getProfile ya no recibe parámetros
          const profile = await apiClient.getProfile();
          setAuth(profile.data?.user, savedToken);
        } catch (err) {
          localStorage.removeItem('token');
          toastError('Sesión expirada', 'Por favor, inicia sesión nuevamente');
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, setAuth, toastError]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setAuth(response.data?.user, response.data?.token);
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al iniciar sesión');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.register(email, password, name);
      setAuth(response.data?.user, response.data?.token);
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al registrar la cuenta');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
  };

  return { 
    user, 
    token, 
    isAuthenticated, 
    login, 
    register, 
    logout: handleLogout 
  };
};