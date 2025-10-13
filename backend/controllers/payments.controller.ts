/// controllers/payments.controller.ts - VERSIÓN COMPLETA FINAL CON EMAIL EN PAGO EXITOSO (INCLUYE CONFIRM MANUAL Y WEBHOOK)
import { Request, Response } from 'express';
import { stripe } from '../utils/stripe.js';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types.js';
import { OrderStatus } from '../types/prisma.types.js';
import { sendOrderConfirmation } from '../utils/email.js';

const prisma = new PrismaClient();

// Extender Request para incluir user
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

export class PaymentsController {
  // 🚀 CREAR CHECKOUT - VERSIÓN COMPLETA FUNCIONAL
  static async createCheckout(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId, shippingAddress, guestEmail, guestName } = req.body;
      const user = req.user;

      console.log('🛒 Iniciando checkout para:', {
        userId: user?.id,
        userEmail: user?.email,
        sessionId,
        guestEmail
      });

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'SessionId es requerido para el checkout'
        });
      }

      // Buscar carrito
      const cart = await prisma.cart.findFirst({
        where: { 
          OR: [
            { sessionId },
            { userId: user?.id }
          ]
        },
        include: { 
          items: { include: { product: true } } 
        }
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El carrito está vacío'
        });
      }

      console.log(`📦 Carrito encontrado con ${cart.items.length} items`);

      // Validar stock
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${item.product.name}`
          });
        }
      }

      // Calcular total (centavos)
      const amount = Math.round(
        cart.items.reduce((total, item) => total + (Number(item.product.price) * item.quantity * 100), 0)
      );

      console.log(`💰 Total calculado: $${amount / 100}`);

      // Crear orden
      const order = await prisma.order.create({
        data: {
          userId: user?.id || null,
          guestEmail: guestEmail || user?.email || null,
          guestName: guestName || user?.name || null,
          shippingAddress: shippingAddress || {},
          total: amount / 100,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: { items: { include: { product: true } } }
      });

      console.log(`📝 Orden creada: #${order.id}`);

      // Reservar stock
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Crear Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { 
          orderId: order.id,
          sessionId,
          userId: user?.id || 'guest'
        },
        description: `Orden NexusShop #${order.id}`,
        ...(shippingAddress && {
          shipping: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
            phone: shippingAddress.phone,
          }
        })
      });

      // Actualizar orden con ID de Stripe
      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id }
      });

      // Limpiar carrito
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      console.log(`✅ Checkout completado para orden #${order.id}`);

      res.json({
        success: true,
        message: 'Checkout creado exitosamente',
        data: { 
          clientSecret: paymentIntent.client_secret, 
          orderId: order.id,
          amount: amount / 100,
          requiresAction: paymentIntent.status === 'requires_action'
        }
      });

    } catch (error) {
      console.error('❌ Error en createCheckout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar el checkout'
      });
    }
  }

  // ✅ CONFIRMAR PAGO EXITOSO Y ENVIAR EMAIL
  static async confirmPaymentSuccess(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.body;
      const user = req.user;

      console.log('🎉 Confirmando pago exitoso para orden:', orderId);

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'OrderId es requerido'
        });
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          OR: [
            { userId: user?.id },
            { guestEmail: user?.email }
          ]
        },
        include: { items: { include: { product: true } } }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: OrderStatus.PAID,
          updatedAt: new Date()
        },
        include: { items: { include: { product: true } } }
      });

      console.log(`✅ Orden #${orderId} marcada como PAID`);

      // Envío de email
      const email = user?.email || order.guestEmail;
      const name = user?.name || order.guestName;

      if (email) {
        try {
          console.log('🚀 Enviando email de confirmación a:', email);
          const emailResult = await sendOrderConfirmation(
            email,
            orderId,
            order.total,
            name || 'Cliente',
            order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            }))
          );

          console.log('✅ EMAIL ENVIADO EXITOSAMENTE');

          res.json({
            success: true,
            message: 'Pago confirmado y email enviado exitosamente',
            data: { order: updatedOrder, emailSent: true, emailResult }
          });
        } catch (emailError: any) {
          console.error('❌ Error enviando email:', emailError);
          res.json({
            success: true,
            message: 'Pago confirmado pero error enviando email',
            data: { order: updatedOrder, emailSent: false, emailError: emailError.message }
          });
        }
      } else {
        res.json({
          success: true,
          message: 'Pago confirmado pero no hay email disponible',
          data: { order: updatedOrder, emailSent: false }
        });
      }

    } catch (error) {
      console.error('❌ Error confirmando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error confirmando el pago'
      });
    }
  }

  // 📡 WEBHOOK DE STRIPE (operativo)
  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ success: false, message: 'Configuración de webhook incorrecta' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      console.error('❌ Firma inválida:', error);
      return res.status(400).json({ success: false, message: 'Firma inválida' });
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await PaymentsController.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await PaymentsController.handlePaymentFailure(event.data.object);
          break;
        default:
          console.log(`Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(500).json({ success: false, message: 'Error procesando webhook' });
    }
  }

  // ✅ MANEJAR PAGO EXITOSO AUTOMÁTICO (desde webhook)
  private static async handlePaymentSuccess(paymentIntent: any) {
    const order = await prisma.order.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: OrderStatus.PAID, updatedAt: new Date() },
      include: { items: { include: { product: true } } }
    });

    const email = order.userId 
      ? (await prisma.user.findUnique({ where: { id: order.userId } }))?.email
      : order.guestEmail;

    const name = order.userId 
      ? (await prisma.user.findUnique({ where: { id: order.userId } }))?.name
      : order.guestName;

    if (email) {
      await sendOrderConfirmation(
        email,
        order.id,
        order.total,
        name || 'Cliente',
        order.items.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.price
        }))
      );
      console.log('✅ Email enviado por webhook');
    }
  }

  private static async handlePaymentFailure(paymentIntent: any) {
    const order = await prisma.order.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: OrderStatus.CANCELLED, updatedAt: new Date() }
    });

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }

    console.log(`❌ Pago fallido - Stock revertido para orden #${order.id}`);
  }

  // 🔍 OBTENER ESTADO DE ORDEN
  static async getOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const user = req.user;

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          OR: [
            { userId: user?.id },
            { guestEmail: user?.email }
          ]
        },
        include: { items: { include: { product: true } } }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      let paymentIntent = null;
      if (order.stripePaymentIntentId) {
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        } catch (e) {
          console.error('Error recuperando payment intent:', e);
        }
      }

      res.json({
        success: true,
        data: {
          order,
          paymentIntent: paymentIntent ? {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          } : null
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      res.status(500).json({ success: false, message: 'Error obteniendo estado de orden' });
    }
  }

  // 📋 OBTENER ÚLTIMA ORDEN DEL USUARIO
  static async getLatestOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user?.id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const order = await prisma.order.findFirst({
        where: { 
          userId: user.id,
          status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] }
        },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'No se encontraron órdenes recientes' });
      }

      res.json({ success: true, data: { order } });
    } catch (error) {
      console.error('❌ Error obteniendo última orden:', error);
      res.status(500).json({ success: false, message: 'Error obteniendo última orden' });
    }
  }

  // 🧪 TEST DE SISTEMA DE PAGOS
  static async testPaymentSystem(req: Request, res: Response) {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Sistema de pagos funcionando correctamente',
        data: {
          stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
          webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
          ordersCount: await prisma.order.count(),
        }
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error testing payment system' });
    }
  }
}
