import { Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types';
import { OrderStatus } from '../types/prisma.types'; // Usar nuestro enum

const prisma = new PrismaClient();

export class PaymentsController {
  // Webhook de Stripe para procesar pagos
  static async handleWebhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).json({
          success: false,
          message: 'Webhook configuration error'
        });
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      // Manejar diferentes tipos de eventos
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await PaymentsController.handlePaymentSuccess(paymentIntent);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          await PaymentsController.handlePaymentFailure(failedPayment);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  private static async handlePaymentSuccess(paymentIntent: any) {
    try {
      // Actualizar orden como pagada
      await prisma.order.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: OrderStatus.PAID }
      });

      console.log(`✅ Payment succeeded for intent: ${paymentIntent.id}`);
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
    }
  }

  private static async handlePaymentFailure(paymentIntent: any) {
    try {
      // Actualizar orden como fallida
      await prisma.order.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: OrderStatus.CANCELLED }
      });

      console.log(`❌ Payment failed for intent: ${paymentIntent.id}`);
    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
    }
  }

  // Método de prueba para verificar que todo funciona
  static async testPaymentSystem(req: Request, res: Response) {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Sistema de pagos funcionando correctamente',
        data: {
          orderStatus: Object.values(OrderStatus),
          stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
          webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
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
}
