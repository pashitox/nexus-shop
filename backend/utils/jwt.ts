import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

console.log('🔐 JWT Config:', {
  hasSecret: !!JWT_SECRET,
  secretLength: JWT_SECRET.length,
  expiresIn: JWT_EXPIRES_IN
});

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };

  console.log('🎫 Generando JWT para usuario:', payload.userId);

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'ecommerce-api',
      subject: user.id.toString()
    }
  );

  console.log('✅ JWT generado - Longitud:', token.length);
  return token;
}

export function verifyToken(token: string): any {
  try {
    console.log('🔍 Verificando token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido:', decoded);
    return decoded;
  } catch (error: any) {
    console.error('❌ Error verificando token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error verificando token');
    }
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    console.log('❌ No Authorization header');
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Authorization header no tiene formato Bearer');
    return null;
  }

  const token = authHeader.substring(7);
  console.log('📨 Token extraído - Longitud:', token.length);
  
  return token;
}