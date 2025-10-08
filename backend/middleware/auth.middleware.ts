import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

/**
 * Middleware que requiere autenticación
 */
export async function authenticateToken(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    console.log('🛡️  Middleware auth iniciado para ruta:', req.path);
    
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    console.log('🔐 Token recibido:', token.substring(0, 20) + '...');

    // ✅ Verificar token primero
    let decoded: any;
    try {
      decoded = verifyToken(token);
      console.log('✅ Token válido, userId:', decoded.userId);
    } catch (error: any) {
      console.log('❌ Token inválido:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // ✅ Buscar usuario en la base de datos
    console.log('🔍 Buscando usuario en BD...');
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
      console.log('❌ Usuario no encontrado en BD para id:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario autenticado:', user.email);

    // ✅ Asignar usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined
    };
    
    next();
    
  } catch (error: any) {
    console.error('❌ Error crítico en middleware auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno de autenticación'
    });
  }
}

/**
 * Middleware que intenta autenticar al usuario si hay token,
 * pero no bloquea la ruta si no hay o es inválido.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  
  if (token) {
    try {
      const decoded: any = verifyToken(token);

      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
      }).then(user => {
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name || undefined
          };
          console.log('👤 Usuario opcional autenticado:', user.email);
        }
        next();
      }).catch(err => {
        console.log('⚠️  Error buscando usuario opcional:', err.message);
        next();
      });

    } catch (error) {
      console.log('⚠️  Token inválido en auth opcional, continuando...');
      next();
    }
  } else {
    next();
  }
}
