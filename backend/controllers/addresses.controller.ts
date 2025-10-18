import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/api.types';

const prisma = new PrismaClient();

export class AddressesController {
  // Obtener direcciones del usuario
  static async getAddresses(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Direcciones obtenidas exitosamente',
        data: addresses
      };

      res.json(response);
    } catch (error) {
      console.error('Error obteniendo direcciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva dirección
  static async createAddress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const addressData = { ...req.body, userId };

      // Si es la primera dirección, establecer como predeterminada
      const existingAddresses = await prisma.address.count({
        where: { userId }
      });

      if (existingAddresses === 0) {
        addressData.isDefault = true;
      }

      const address = await prisma.address.create({
        data: addressData
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dirección creada exitosamente',
        data: address
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar dirección
  static async updateAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const addressData = req.body;

      // Verificar que la dirección pertenece al usuario
      const existingAddress = await prisma.address.findFirst({
        where: { id, userId }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      const address = await prisma.address.update({
        where: { id },
        data: addressData
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dirección actualizada exitosamente',
        data: address
      };

      res.json(response);
    } catch (error) {
      console.error('Error actualizando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar dirección
  static async deleteAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verificar que la dirección pertenece al usuario
      const existingAddress = await prisma.address.findFirst({
        where: { id, userId }
      });

      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      await prisma.address.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dirección eliminada exitosamente'
      };

      res.json(response);
    } catch (error) {
      console.error('Error eliminando dirección:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Establecer dirección como predeterminada
  static async setDefaultAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verificar que la dirección pertenece al usuario
      const address = await prisma.address.findFirst({
        where: { id, userId }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      // Quitar predeterminado de todas las direcciones
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });

      // Establecer esta dirección como predeterminada
      const updatedAddress = await prisma.address.update({
        where: { id },
        data: { isDefault: true }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dirección establecida como predeterminada',
        data: updatedAddress
      };

      res.json(response);
    } catch (error) {
      console.error('Error estableciendo dirección predeterminada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
