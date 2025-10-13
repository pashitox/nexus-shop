// /home/pashitox/Documentos/nexus-shop/backend/utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, from }: any) {
  try {
    // ✅ EN PRODUCCIÓN: Usar Resend con tu API key real
    console.log('📧 ENVIANDO EMAIL REAL CON RESEND...');
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ Error Resend:', error);
      return { success: false, error };
    }

    console.log('✅ Email enviado exitosamente via Resend. ID:', data?.id);
    return { success: true, id: data?.id };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error };
  }
}

// Plantilla optimizada para Resend
export async function sendOrderConfirmation(
  email: string, 
  orderId: string, 
  total: number, 
  customerName?: string,
  items?: Array<{ name: string; quantity: number; price: number }>
) {
  const orderNumber = orderId.slice(-8).toUpperCase();
  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(total);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido - NexusShop</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu compra! 🎉</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu pedido ha sido confirmado</p>
    </div>
    
    <!-- Content -->
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
      <h2 style="color: #2d3748; margin-top: 0;">Hola ${customerName || 'Cliente'},</h2>
      <p style="color: #4a5568;">Estamos procesando tu pedido y te notificaremos cuando sea enviado.</p>
      
      <!-- Order Details -->
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="color: #2d3748; margin-top: 0;">Detalles del Pedido</h3>
        <p><strong>Número de orden:</strong> #${orderNumber}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
        <p><strong>Total:</strong> <span style="font-size: 18px; font-weight: bold; color: #2d3748;">${formattedTotal}</span></p>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders" 
           style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Ver Mis Pedidos
        </a>
      </div>
      
      <p style="color: #718096; text-align: center; font-size: 14px;">
        Si tienes alguna pregunta, contáctanos en soporte@nexusshop.com
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
      <p>© 2024 NexusShop. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `Confirmación de Pedido #${orderNumber} - NexusShop`,
    html,
  });
}

// ✅ AGREGAR LA FUNCIÓN QUE FALTABA
export async function sendOrderStatusUpdate(
  email: string,
  orderId: string,
  status: string,
  trackingNumber?: string
) {
  const orderNumber = orderId.slice(-8).toUpperCase();
  const statusMessages: { [key: string]: string } = {
    'PAID': '¡Tu pago ha sido confirmado!',
    'PROCESSING': 'Tu pedido está siendo preparado',
    'SHIPPED': '¡Tu pedido ha sido enviado!',
    'DELIVERED': '¡Tu pedido ha sido entregado!',
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Pedido - NexusShop</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px;">
      <h1 style="margin: 0; font-size: 24px;">${statusMessages[status] || 'Actualización de tu pedido'}</h1>
    </div>
    
    <!-- Content -->
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <p>El estado de tu pedido <strong>#${orderNumber}</strong> ha sido actualizado a: <strong>${status}</strong></p>
      
      ${trackingNumber ? `
      <p><strong>Número de seguimiento:</strong> ${trackingNumber}</p>
      ` : ''}
      
      <p>Puedes ver los detalles completos de tu pedido en tu cuenta.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders" 
           style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Ver Mis Pedidos
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `Actualización de Pedido #${orderNumber} - ${status}`,
    html,
  });
}

// Función de prueba para Resend
export async function testResend() {
  try {
    console.log('🧪 Probando Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'pashitox@gmail.com',
      subject: 'Prueba NexusShop - Resend Funcionando',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h1 style="color: #667eea;">¡NexusShop funciona! 🎉</h1>
          <p>Tu sistema de emails con <strong>Resend</strong> está configurado correctamente.</p>
          <p><strong>Hora:</strong> ${new Date().toLocaleString('es-MX')}</p>
        </div>
      `
    });

    if (error) {
      console.log('❌ Error en prueba Resend:', error);
      return false;
    }

    console.log('✅ Prueba Resend exitosa. Email ID:', data?.id);
    return true;
  } catch (error) {
    console.log('❌ Error en prueba Resend:', error);
    return false;
  }
}