import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types';

const prisma = new PrismaClient();

export class ProductsController {
  // Obtener todos los productos
  static async getProducts(req: Request, res: Response) {
    try {
      const { category, search, page = '1', limit = '10' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Construir filtros
      const where: any = { active: true };

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Productos obtenidos exitosamente',
        data: {
          products,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener producto por ID
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Producto obtenido exitosamente',
        data: product
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear producto (admin)
  static async createProduct(req: Request, res: Response) {
    try {
      const productData = req.body;

      const product = await prisma.product.create({
        data: productData
      });

      const response: ApiResponse = {
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar producto (admin)
  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productData = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: productData
      });

      const response: ApiResponse = {
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      };

      res.json(response);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar producto (admin)
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.product.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Producto eliminado exitosamente'
      };

      res.json(response);
    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
