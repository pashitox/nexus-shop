// Agregar esto temporalmente en tu backend/src/routes/test.routes.ts
import { Router } from 'express';
import { testResend, sendOrderConfirmation } from '../utils/email';

const router = Router();

// Endpoint de prueba directa
router.post('/test-email', async (req, res) => {
  try {
    console.log('🧪 INICIANDO PRUEBA DE EMAIL...');
    
    const { email = 'pashitox@gmail.com' } = req.body;
    
    // Prueba 1: Test básico de Resend
    console.log('1. Probando conexión con Resend...');
    const testResult = await testResend();
    
    if (!testResult) {
      return res.status(500).json({
        success: false,
        message: 'Error en conexión con Resend'
      });
    }
    
    // Prueba 2: Email de confirmación de orden
    console.log('2. Probando email de confirmación...');
    const orderResult = await sendOrderConfirmation(
      email,
      'test-order-123',
      65998,
      'Juan González',
      [
        { name: 'iPhone 15 Pro', quantity: 1, price: 65998 },
        { name: 'Funda Protectora', quantity: 1, price: 499 }
      ]
    );
    
    res.json({
      success: true,
      message: 'Pruebas completadas',
      tests: {
        resendConnection: testResult,
        orderEmail: orderResult.success
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error en prueba de email:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

export default router;