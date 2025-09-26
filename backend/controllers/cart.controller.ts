import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types';

const prisma = new PrismaClient();

export class CartController {
  // 🛒 Obtener carrito del usuario
  static async getCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.query;

      if (!userId && !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
        });
      }

      const where = userId ? { userId } : { sessionId: sessionId as string };

      let cart = await prisma.cart.findFirst({
        where,
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: userId || null,
            sessionId: sessionId as string || null,
            items: { create: [] },
          },
          include: {
            items: {
              include: { product: true },
            },
          },
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Carrito obtenido exitosamente',
        data: cart,
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ➕ Agregar item al carrito
  static async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { productId, quantity = 1, sessionId } = req.body;

      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente',
        });
      }

      const where = userId ? { userId } : { sessionId };
      let cart = await prisma.cart.findFirst({ where });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: userId || null,
            sessionId: sessionId || null,
          },
        });
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      let cartItem;
      if (existingItem) {
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { product: true },
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
          include: { product: true },
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Producto agregado al carrito',
        data: cartItem,
      };

      res.json(response);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🔄 Actualizar cantidad de item
  static async updateCartItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser al menos 1',
        });
      }

      const cartItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: { product: true },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Carrito actualizado exitosamente',
        data: cartItem,
      };

      res.json(response);
    } catch (error) {
      console.error('Error actualizando carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // ❌ Eliminar item del carrito
  static async removeFromCart(req: Request, res: Response) {
    try {
      const { itemId } = req.params;

      await prisma.cartItem.delete({ where: { id: itemId } });

      const response: ApiResponse = {
        success: true,
        message: 'Producto eliminado del carrito',
      };

      res.json(response);
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  // 🔗 Fusionar carrito guest con usuario
  static async mergeCarts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.body;

      if (!userId || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere userId y sessionId',
        });
      }

      const guestCart = await prisma.cart.findFirst({
        where: { sessionId },
        include: { items: true },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Carrito guest vacío o no encontrado',
        });
      }

      let userCart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
          item => item.productId === guestItem.productId
        );

        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + guestItem.quantity },
          });
        } else {
          await prisma.cartItem.update({
            where: { id: guestItem.id },
            data: { cartId: userCart.id },
          });
        }
      }

      await prisma.cart.delete({ where: { id: guestCart.id } });

      const response: ApiResponse = {
        success: true,
        message: 'Carritos fusionados exitosamente',
      };

      res.json(response);
    } catch (error) {
      console.error('Error fusionando carritos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}
