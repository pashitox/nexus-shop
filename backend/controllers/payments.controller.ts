import { Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types';
import { OrderStatus } from '../types/prisma.types';

const prisma = new PrismaClient();

export class PaymentsController {
  // 🚀 CREAR CHECKOUT - VERSIÓN 100% CORREGIDA
  static async createCheckout(req: Request, res: Response) {
    try {
      const { sessionId, shippingAddress, guestEmail, guestName } = req.body;
      const user = (req as any).user;

      console.log('🛒 Iniciando checkout para sessionId:', sessionId);

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'SessionId es requerido para el checkout'
        });
      }

      // ✅ CORRECCIÓN DEFINITIVA: Usar findFirst con OR
      const cart = await prisma.cart.findFirst({
        where: { 
          OR: [
            { sessionId: sessionId },
            { userId: user?.id }
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

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Carrito no encontrado'
        });
      }

      if (!cart.items || cart.items.length === 0) {
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
            message: `Stock insuficiente para: ${item.product.name}. Disponible: ${item.product.stock}, Solicitado: ${item.quantity}`
          });
        }
      }

      // Calcular total (en centavos para Stripe)
      const amount = Math.round(
        cart.items.reduce((total, item) => {
          return total + (Number(item.product.price) * item.quantity * 100);
        }, 0)
      );

      console.log(`💰 Total calculado: $${amount / 100}`);

      // Crear la orden en la base de datos
      const order = await prisma.order.create({
        data: {
          userId: user?.id || cart.userId || null,
          guestEmail: guestEmail || null,
          guestName: guestName || null,
          shippingAddress: shippingAddress || {},
          total: amount / 100,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map((item) => ({
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

      console.log(`📝 Orden creada: #${order.id}`);

      // Reservar stock
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Crear Payment Intent en Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: { 
          orderId: order.id,
          sessionId: sessionId,
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
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      console.log(`✅ Checkout completado para orden #${order.id}`);

      const response: ApiResponse = {
        success: true,
        message: 'Checkout creado exitosamente',
        data: { 
          clientSecret: paymentIntent.client_secret, 
          orderId: order.id,
          amount: amount / 100,
          requiresAction: paymentIntent.status === 'requires_action'
        }
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Error en createCheckout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar el checkout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // 📡 WEBHOOK DE STRIPE
  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({
        success: false,
        message: 'Configuración de webhook incorrecta'
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      console.error('❌ Firma de webhook inválida:', error);
      return res.status(400).json({
        success: false,
        message: 'Firma inválida'
      });
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
          console.log(`🔔 Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook'
      });
    }
  }

  // 🔍 OBTENER ESTADO DE ORDEN
  static async getOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      console.log(`🔍 Solicitando estado de orden: ${orderId}`);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      let paymentIntent = null;
      if (order.stripePaymentIntentId) {
        try {
          paymentIntent = await stripe.paymentIntents.retrieve(
            order.stripePaymentIntentId
          );
        } catch (error) {
          console.error('Error recuperando payment intent:', error);
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          order: {
            id: order.id,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
            items: order.items
          },
          paymentIntent: paymentIntent ? {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          } : null
        }
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error obteniendo estado de orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estado de la orden'
      });
    }
  }

  // 📋 OBTENER ÚLTIMA ORDEN DEL USUARIO
  static async getLatestOrder(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const order = await prisma.order.findFirst({
        where: { 
          userId: user.id,
          status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] }
        },
        orderBy: { createdAt: 'desc' },
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
          message: 'No se encontraron órdenes recientes'
        });
      }

      const response: ApiResponse = {
        success: true,
        data: { order }
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error obteniendo última orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo la última orden'
      });
    }
  }

  // 🧪 RUTA DE PRUEBA
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
      res.status(500).json({
        success: false,
        message: 'Error testing payment system'
      });
    }
  }

  // ✅ MANEJAR PAGO EXITOSO (privado)
  private static async handlePaymentSuccess(paymentIntent: any) {
    try {
      const order = await prisma.order.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { 
          status: OrderStatus.PAID,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Pago exitoso - Orden #${order.id} marcada como PAID`);
    } catch (error) {
      console.error('❌ Error actualizando orden después de pago:', error);
      throw error;
    }
  }

  // ❌ MANEJAR PAGO FALLIDO (privado)
  private static async handlePaymentFailure(paymentIntent: any) {
    try {
      const order = await prisma.order.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { 
          status: OrderStatus.CANCELLED,
          updatedAt: new Date()
        }
      });

      // Revertir stock reservado
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id }
      });

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      console.log(`❌ Pago fallido - Stock revertido para orden #${order.id}`);
    } catch (error) {
      console.error('❌ Error manejando pago fallido:', error);
      throw error;
    }
  }
}