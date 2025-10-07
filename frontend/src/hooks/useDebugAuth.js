import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export const useDebugAuth = () => {
  const { user, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    console.log('🔐 DEBUG AUTH STORE:', {
      user,
      isAuthenticated,
      token: token ? `✅ Token (${token.length} chars)` : '❌ No token',
      localStorage: localStorage.getItem('token') ? '✅ Token en localStorage' : '❌ No token en localStorage'
    });
  }, [user, isAuthenticated, token]);

  return { user, isAuthenticated, token };
};
