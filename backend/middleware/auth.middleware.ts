import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticateToken(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    console.log('🛡️  Middleware auth iniciado');
    
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    console.log('🔍 Verificando token en base de datos...');
    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        image: true,
        provider: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado para token');
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario autenticado:', user.email);
    req.user = user as any;
    next();
    
  } catch (error: any) {
    console.error('❌ Error en middleware auth:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado'
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded as any;
      console.log('👤 Usuario opcional autenticado');
    } catch (error) {
      console.log('⚠️  Token inválido en auth opcional');
      // Continuar sin usuario
    }
  }
  
  next();
}