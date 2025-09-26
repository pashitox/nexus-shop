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
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, image: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    req.user = user as any;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded as any;
    } catch (error) {
      // Token inválido, pero continuamos sin usuario
    }
  }
  
  next();
}
