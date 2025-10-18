import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../types/api.types';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {
  // 🔐 Registro
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      console.log('👤 Intentando registrar usuario:', email);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
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

      const token = generateToken(user);
      console.log('✅ Usuario registrado exitosamente:', user.email);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: { user, token },
      });
    } catch (error) {
      console.error('❌ Error en registro:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // 🔓 Login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log('🔐 Intentando login:', email);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      console.log('✅ Login exitoso:', user.email);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: { user: userWithoutPassword, token },
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // 👤 Perfil
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: { user: req.user },
      });
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // 🚪 Logout
  static async logout(req: Request, res: Response) {
    try {
      res.json({ success: true, message: 'Logout exitoso' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // 🔄 Refresh token
  static async refreshToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      const token = generateToken(req.user);
      res.json({
        success: true,
        message: 'Token refrescado',
        data: { token },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // 🌐 Google OAuth con ID Token
  static async googleAuth(req: Request, res: Response) {
    try {
      const { token: googleToken } = req.body;
      console.log('🔑 Google OAuth iniciado con token');

      if (!googleToken) {
        return res.status(400).json({ success: false, message: 'Token de Google es requerido' });
      }

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture, sub: googleId } = payload!;
      console.log('👤 Usuario de Google autenticado:', { email, name });

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email no proporcionado por Google' });
      }

      let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { providerId: googleId }] },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            image: picture,
            provider: 'google',
            providerId: googleId,
            password: '',
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        });
      }

      const jwtToken = generateToken(user);
      res.status(200).json({
        success: true,
        message: 'Login con Google exitoso',
        data: { user, token: jwtToken },
      });
    } catch (error) {
      console.error('❌ Error en Google OAuth:', error);
      res.status(500).json({ success: false, message: 'Error al autenticar con Google' });
    }
  }

  // 🌐 Google OAuth REAL - con código y puerto 3001
  static async googleAuthCode(req: Request, res: Response) {
    try {
      const { code } = req.body;
      console.log('🔑 Google OAuth REAL - Código recibido');

      if (!code) {
        return res.status(400).json({ success: false, message: 'Código de autorización es requerido' });
      }

      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/callback'
      );

      console.log('🔄 Intercambiando código por token de acceso...');
      const { tokens } = await client.getToken(code);
      console.log('✅ Tokens recibidos de Google');

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture, sub: googleId } = payload!;
      console.log('👤 Usuario de Google autenticado:', { email, name });

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email no proporcionado por Google' });
      }

      let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { providerId: googleId }] },
      });

      if (!user) {
        console.log('👤 Creando nuevo usuario Google REAL...');
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            image: picture,
            provider: 'google',
            providerId: googleId,
            password: '',
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        });
        console.log('✅ Nuevo usuario Google REAL creado:', user.email);
      }

      const jwtToken = generateToken(user);
      console.log('🎫 JWT generado para usuario Google REAL');

      res.status(200).json({
        success: true,
        message: 'Autenticación con Google exitosa',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: user.provider,
          },
          token: jwtToken,
        },
      });
    } catch (error) {
      console.error('❌ Error en Google OAuth REAL:', error);
      res.status(500).json({ success: false, message: 'Error al autenticar con Google: ' + error.message });
    }
  }



  // 🧪 Debug
  static async debugToken(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
          debug: { hasUser: false, headers: req.headers }
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        debug: { hasUser: true, user: req.user, headers: req.headers }
      });
    } catch (error) {
      console.error('❌ Error en debug token:', error);
      res.status(500).json({
        success: false,
        message: 'Error en debug'
      });
    }
  }






  // 🩺 Health
  static async health(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
        routes: [
          'POST /register',
          'POST /login',
          'POST /google',
          'POST /google/code',
          'GET /profile',
          'GET /debug-token',
          'POST /logout',
          'POST /refresh'
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Auth service health check failed'
      });
    }
  }
}
