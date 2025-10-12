import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);
}

// ✅ MEJORADO: gestión persistente y reutilizable del sessionId
export function generateSessionId(): string {
  try {
    // Intentar recuperar sessionId existente
    const existingSessionId = localStorage.getItem('guestSessionId');
    if (existingSessionId) {
      return existingSessionId;
    }

    // Crear nuevo sessionId
    const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestSessionId', newSessionId);
    return newSessionId;
  } catch {
    // En caso de que localStorage no esté disponible (SSR, etc.)
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}
