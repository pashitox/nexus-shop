// src/controllers/orders.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createPaymentIntent } from '../utils/stripe';
import { sendOrderConfirmation } from '../utils/email';
import { ApiResponse } from '../types/api.types';
import { OrderStatus } from '../types/prisma.types'; // Usar nuestro enum

const prisma = new PrismaClient();

// Extender el tipo Request para incluir user
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
  };
}

export class OrdersController {
  // Crear orden (checkout)
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { shippingAddress, guestEmail, guestName, paymentIntentId, sessionId } = req.body;

      const where = userId ? { userId } : { sessionId };
      const cart = await prisma.cart.findFirst({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Carrito vacío'
        });
      }

      const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      const order = await prisma.order.create({
        data: {
          userId: userId || null,
          guestEmail,
          guestName,
          shippingAddress,
          total,
          stripePaymentIntentId: paymentIntentId,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      const email = userId ? req.user?.email : guestEmail;
      if (email) {
        await sendOrderConfirmation(email, order.id, total);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Orden creada exitosamente',
        data: order
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creando orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener órdenes del usuario
  static async getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Órdenes obtenidas exitosamente',
        data: orders
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener orden por ID
  static async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const email = req.user?.email;

      const order = await prisma.order.findFirst({
        where: {
          id,
          OR: [
            { userId: userId || '' },
            { guestEmail: email || '' }
          ]
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Orden obtenida exitosamente',
        data: order
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear payment intent de Stripe
  static async createPaymentIntent(req: Request, res: Response) {
    try {
      const { amount, metadata } = req.body;

      const paymentIntent = await createPaymentIntent(amount, metadata);

      const response: ApiResponse = {
        success: true,
        message: 'Payment intent creado exitosamente',
        data: paymentIntent
      };

      res.json(response);
    } catch (error) {
      console.error('Error creando payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando pago'
      });
    }
  }

  // Obtener órdenes de guest por email
  static async getGuestOrders(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const orders = await prisma.order.findMany({
        where: {
          guestEmail: email,
          userId: null // Solo órdenes de guest
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Órdenes de guest obtenidas exitosamente',
        data: orders
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo órdenes de guest:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
