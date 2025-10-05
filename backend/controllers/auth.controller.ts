import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../types/api.types';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  // 🌐 Google OAuth - CORREGIDO
  static async googleAuth(req: Request, res: Response) {
    try {
      const { token: googleToken } = req.body;

      console.log('🔑 Google auth iniciado');

      if (!googleToken) {
        return res.status(400).json({
          success: false,
          message: 'Token de Google es requerido'
        });
      }

      // Verificar token de Google
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: 'Token de Google inválido'
        });
      }

      const { email, name, picture, sub: googleId } = payload;

      console.log('👤 Payload de Google:', { email, name, googleId });

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email no proporcionado por Google'
        });
      }

      // Buscar usuario por email o googleId
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { providerId: googleId }
          ]
        }
      });

      console.log('🔍 Usuario encontrado:', user ? 'Sí' : 'No');

      // Crear usuario si no existe
      if (!user) {
        console.log('👤 Creando nuevo usuario...');
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            image: picture,
            provider: 'google',
            providerId: googleId,
            password: '' // Campo requerido pero no usado
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            provider: true,
            providerId: true,
            createdAt: true
          }
        });
        console.log('✅ Usuario creado:', user.id);
      }

      // Generar JWT token - CORREGIDO
      const jwtToken = generateToken(user as any);

      console.log('🎫 JWT generado:', {
        tokenLength: jwtToken.length,
        userId: user.id
      });

      const response = {
        success: true,
        message: 'Login con Google exitoso',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: user.provider
          },
          token: jwtToken
        }
      };

      console.log('✅ Google auth completado exitosamente');
      res.status(200).json(response);

    } catch (error) {
      console.error('❌ Error en Google auth:', error);
      res.status(500).json({
        success: false,
        message: 'Error al autenticar con Google'
      });
    }
  }

  // 🧪 Endpoint de debug
  static async debugToken(req: Request, res: Response) {
    try {
      console.log('🔐 Debug token endpoint llamado');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
          debug: {
            hasUser: false,
            headers: req.headers
          }
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        debug: {
          hasUser: true,
          user: req.user,
          headers: req.headers
        }
      });
    } catch (error) {
      console.error('Error en debug token:', error);
      res.status(500).json({
        success: false,
        message: 'Error en debug'
      });
    }
  }
}