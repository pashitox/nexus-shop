import { useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { apiClient } from '../types/api'; // Asegúrate que esta ruta sea correcta
import { useToast } from './useToast';

export const useAuth = () => {
  // ✅ USAR LAS FUNCIONES CORRECTAS DEL STORE
  const { 
    user, 
    token, 
    isAuthenticated, 
    setUser, 
    setToken,
    logout 
  } = useAuthStore();
  
  const { error: toastError } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken && !isAuthenticated) {
        try {
          const profile = await apiClient.getProfile();
          // ✅ USAR setUser Y setToken EN LUGAR DE setAuth
          setUser(profile.data?.user);
          setToken(savedToken);
        } catch (err) {
          localStorage.removeItem('token');
          toastError('Sesión expirada', 'Por favor, inicia sesión nuevamente');
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, setUser, setToken, toastError]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      // ✅ USAR setUser Y setToken
      setUser(response.data?.user);
      setToken(response.data?.token);
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al iniciar sesión');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.register(email, password, name);
      // ✅ USAR setUser Y setToken
      setUser(response.data?.user);
      setToken(response.data?.token);
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