import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../types/api.types';

const prisma = new PrismaClient();

export class AuthController {
  // 🔐 Registro de usuario
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya existe',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          provider: 'credentials',
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });

      const token = generateToken(user as any);

      const response: ApiResponse = {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user, token },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🔓 Login de usuario
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return res.status(400).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      const response: ApiResponse = {
        success: true,
        message: 'Login exitoso',
        data: { user: userWithoutPassword, token },
      };

      res.json(response);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 👤 Obtener perfil de usuario
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: { user: req.user },
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🚪 Logout (simulado)
  static async logout(req: Request, res: Response) {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Logout exitoso',
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🔄 Refresh token
  static async refreshToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      const token = generateToken(req.user as any);

      const response: ApiResponse = {
        success: true,
        message: 'Token refrescado',
        data: { token },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🌐 Google OAuth (placeholder)
  static async googleAuth(req: Request, res: Response) {
    try {
      const response: ApiResponse = {
        success: false,
        message: 'Google OAuth no implementado aún',
      };
      res.status(501).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}
