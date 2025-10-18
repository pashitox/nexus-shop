import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Error de validación de Zod
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.errors
    });
  }

  // Error de Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con estos datos'
    });
  }

  // Error JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error por defecto
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`
  });
}
