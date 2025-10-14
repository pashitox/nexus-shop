// /home/pashitox/Documentos/nexus-shop/backend/controllers/orderController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createPaymentIntent } from '../utils/stripe.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/email.js';
import { ApiResponse } from '../types/api.types.js';
import { OrderStatus } from '../types/prisma.types.js';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

// ✅ Asegurar que la clase esté exportada correctamente
export class OrdersController {
  // 🧾 Crear orden (checkout) - con logs detallados y envío de email profesional
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      // ====================== LOGS DE DEPURACIÓN INICIAL ======================
      console.log('🎯 ========== CREATE ORDER INICIADO ==========');
      console.log('🎯 URL:', req.url);
      console.log('🎯 Método:', req.method);

      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const userName = req.user?.name;

      console.log('🎯 Datos de usuario:');
      console.log('   userId:', userId);
      console.log('   userEmail:', userEmail);
      console.log('   userName:', userName);

      const { shippingAddress, guestEmail, guestName, paymentIntentId, sessionId } = req.body;
      console.log('🎯 Datos del body:');
      console.log('   guestEmail:', guestEmail);
      console.log('   guestName:', guestName);
      console.log('   sessionId:', sessionId);
      console.log('   shippingAddress:', shippingAddress ? 'PRESENTE' : 'AUSENTE');
      if (shippingAddress) {
        console.log('   Detalles dirección:');
        console.log('     fullName:', shippingAddress.fullName);
        console.log('     street:', shippingAddress.street);
        console.log('     city:', shippingAddress.city);
        console.log('     state:', shippingAddress.state);
        console.log('     postalCode:', shippingAddress.postalCode);
        console.log('     country:', shippingAddress.country);
        console.log('     phone:', shippingAddress.phone || 'No proporcionado');
      }
      console.log('================================================================');

      // ====================== LÓGICA DE CREACIÓN DE ORDEN ======================
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
        console.warn('⚠️ Carrito vacío o no encontrado para el usuario/sessionId');
        return res.status(400).json({
          success: false,
          message: 'Carrito vacío'
        });
      }

      const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      console.log('💰 Total calculado:', total);

      // ✅ CREAR LA ORDEN CON LA DIRECCIÓN COMPLETA
      const order = await prisma.order.create({
        data: {
          userId: userId || null,
          guestEmail: guestEmail || userEmail,
          guestName: guestName || userName,
          shippingAddress: shippingAddress || null, // ✅ GUARDAR LA DIRECCIÓN
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

      console.log('📦 Orden creada con éxito en la base de datos:', order.id);
      console.log('📍 Dirección guardada en la orden:', order.shippingAddress ? '✅' : '❌ NO GUARDADA');

      // 🧹 Limpiar carrito
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      console.log('🧹 Carrito limpiado correctamente.');

      // ====================== ENVÍO DE EMAIL DE CONFIRMACIÓN ======================
      const email = userId ? userEmail : guestEmail;
      const name = userId ? userName : guestName;

      console.log('📧 Preparando envío de email...');
      console.log('   Email destino:', email);
      console.log('   Nombre:', name);
      console.log('   Total:', total);
      console.log('   Orden ID:', order.id);
      console.log('   Shipping Address disponible:', !!shippingAddress);

      if (email) {
        console.log('🚀 INICIANDO ENVÍO DE EMAIL...');
        try {
          const emailResult = await sendOrderConfirmation(
            email,
            order.id,
            total,
            name,
            cart.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            shippingAddress // ✅ ¡PASANDO LA DIRECCIÓN DE ENVÍO!
          );
          console.log('✅ Email de confirmación enviado correctamente.');
          console.log('📨 Resultado del email:', emailResult);
        } catch (emailError) {
          console.error('❌ Error CRÍTICO enviando email:', emailError);
        }
      } else {
        console.log('⚠️  No hay email disponible para enviar confirmación.');
      }

      // ====================== RESPUESTA FINAL ======================
      const response: ApiResponse = {
        success: true,
        message: 'Orden creada exitosamente',
        data: order
      };

      console.log('✅ Respuesta lista para enviar al cliente.');
      res.status(201).json(response);
    } catch (error) {
      console.error('💥 Error creando orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 🔄 Actualizar estado de orden y enviar email de actualización
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, trackingNumber } = req.body;

      console.log('🔄 Actualizando estado de orden:', id);
      console.log('   Nuevo estado:', status);
      console.log('   Tracking:', trackingNumber || 'N/A');

      const order = await prisma.order.update({
        where: { id },
        data: { 
          status: status as OrderStatus,
          ...(trackingNumber && { trackingNumber })
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log('📦 Estado de orden actualizado:', order.id);
      console.log('📍 Dirección en la orden:', order.shippingAddress ? '✅ PRESENTE' : '❌ AUSENTE');

      const email = order.userId 
        ? (await prisma.user.findUnique({ where: { id: order.userId } }))?.email
        : order.guestEmail;

      if (email) {
        console.log('🚀 Enviando email de actualización de estado a:', email);
        try {
          // ✅ CORREGIR: Pasar los parámetros en el orden correcto
          const emailResult = await sendOrderStatusUpdate(
            email, 
            order.id, 
            status, 
            order.guestName || 'Cliente',
            trackingNumber,
            order.shippingAddress // ✅ PASANDO LA DIRECCIÓN
          );
          console.log('✅ Email de actualización enviado con éxito.');
          console.log('📨 Resultado del email:', emailResult);
        } catch (emailError) {
          console.error('❌ Error enviando email de actualización:', emailError);
        }
      } else {
        console.log('⚠️  No se encontró email para esta orden.');
      }

      const response: ApiResponse = {
        success: true,
        message: 'Estado de orden actualizado exitosamente',
        data: order
      };

      res.json(response);
    } catch (error) {
      console.error('💥 Error actualizando orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 📜 Obtener órdenes del usuario autenticado
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
      console.error('💥 Error obteniendo órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 🔍 Obtener orden por ID
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
      console.error('💥 Error obteniendo orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // 💳 Crear payment intent de Stripe
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
      console.error('💥 Error creando payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando pago'
      });
    }
  }

  // 👤 Obtener órdenes de invitado (guest)
  static async getGuestOrders(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const orders = await prisma.order.findMany({
        where: {
          guestEmail: email,
          userId: null
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
      console.error('💥 Error obteniendo órdenes de guest:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}