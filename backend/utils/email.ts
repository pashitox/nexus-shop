// /home/pashitox/Documentos/nexus-shop/backend/utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, from }: any) {
  try {
    console.log('📧 ENVIANDO EMAIL REAL CON RESEND...');
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'NexusShop <onboarding@resend.dev>',
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

// ✅ EMAIL MEJORADO CON DIRECCIÓN COMPLETA Y MÁS DETALLES
export async function sendOrderConfirmation(
  email: string, 
  orderId: string, 
  total: number, 
  customerName?: string,
  items?: Array<{ name: string; quantity: number; price: number }>,
  shippingAddress?: any // ✅ AGREGAR DIRECCIÓN DE ENVÍO
) {
  const orderNumber = orderId.slice(-8).toUpperCase();
  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(total);

  // ✅ CALCULAR SUBTOTAL E IMPUESTOS
  const subtotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || total * 0.84;
  const tax = total - subtotal;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido - NexusShop</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  </style>
</head>
<body style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f7fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0;">
      <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 36px; color: #667eea;">🎉</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">¡Gracias por tu compra!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 400;">Tu pedido #${orderNumber} ha sido confirmado</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      
      <!-- Saludo Personalizado -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2d3748; margin: 0 0 10px 0; font-weight: 600;">Hola ${customerName || 'Cliente'},</h2>
        <p style="color: #718096; margin: 0; font-size: 16px;">Estamos procesando tu pedido y te notificaremos cuando sea enviado.</p>
      </div>

      <!-- Grid de Información -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        
        <!-- Información del Pedido -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
          <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600; font-size: 16px;">📦 Información del Pedido</h3>
          <div style="color: #4a5568;">
            <p style="margin: 8px 0;"><strong>Número:</strong> #${orderNumber}</p>
            <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="color: #48bb78; font-weight: 600;">Confirmado</span></p>
          </div>
        </div>

        <!-- Información de Envío -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #48bb78;">
          <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600; font-size: 16px;">🚚 Dirección de Envío</h3>
          <div style="color: #4a5568;">
            ${shippingAddress ? `
              <p style="margin: 8px 0; font-weight: 500;">${shippingAddress.fullName}</p>
              <p style="margin: 8px 0; font-size: 14px;">${shippingAddress.street}</p>
              <p style="margin: 8px 0; font-size: 14px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
              <p style="margin: 8px 0; font-size: 14px;">${shippingAddress.country}</p>
              ${shippingAddress.phone ? `<p style="margin: 8px 0; font-size: 14px;">📞 ${shippingAddress.phone}</p>` : ''}
            ` : `
              <p style="margin: 8px 0; font-size: 14px; color: #a0aec0;">Dirección no especificada</p>
            `}
          </div>
        </div>
      </div>

      <!-- Productos -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2d3748; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">🛍️ Productos en tu pedido</h3>
        ${items && items.length > 0 ? items.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #edf2f7;">
            <div>
              <p style="margin: 0; font-weight: 500; color: #2d3748;">${item.name}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #718096;">Cantidad: ${item.quantity}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: 600; color: #2d3748;">${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.price * item.quantity)}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #718096;">${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.price)} c/u</p>
            </div>
          </div>
        `).join('') : `
          <p style="color: #718096; text-align: center; padding: 20px;">No hay productos en el pedido</p>
        `}
      </div>

      <!-- Resumen de Pago -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <h3 style="color: #2d3748; margin: 0 0 20px 0; font-weight: 600; text-align: center;">💰 Resumen de Pago</h3>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; max-width: 300px; margin: 0 auto;">
          <span style="color: #4a5568;">Subtotal:</span>
          <span style="text-align: right; color: #4a5568;">${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subtotal)}</span>
          
          <span style="color: #4a5568;">Impuestos (16%):</span>
          <span style="text-align: right; color: #4a5568;">${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(tax)}</span>
          
          <span style="color: #2d3748; font-weight: 600; font-size: 18px; border-top: 2px solid #e2e8f0; padding-top: 10px;">Total:</span>
          <span style="text-align: right; color: #2d3748; font-weight: 600; font-size: 18px; border-top: 2px solid #e2e8f0; padding-top: 10px;">${formattedTotal}</span>
        </div>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders" 
           style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">
          Ver Detalles de Mi Pedido
        </a>
      </div>

      <!-- Información Adicional -->
      <div style="background: #fffaf0; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin-top: 25px;">
        <h4 style="color: #dd6b20; margin: 0 0 10px 0; font-weight: 600;">💡 Información Importante</h4>
        <ul style="color: #718096; margin: 0; padding-left: 20px;">
          <li>Recibirás una notificación cuando tu pedido sea enviado</li>
          <li>Tiempo estimado de entrega: 3-5 días hábiles</li>
          <li>Para consultas, responde a este email o contacta a soporte</li>
        </ul>
      </div>

    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
      <p style="margin: 0 0 10px 0;">© 2024 NexusShop. Todos los derechos reservados.</p>
      <p style="margin: 0; font-size: 12px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">Visita nuestra tienda</a> • 
        <a href="mailto:soporte@nexusshop.com" style="color: #667eea; text-decoration: none;">Soporte</a> • 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #667eea; text-decoration: none;">Contáctanos</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `🎉 Confirmación de Pedido #${orderNumber} - ${formattedTotal} - NexusShop`,
    html,
  });
}

// ✅ EMAIL DE ACTUALIZACIÓN DE ESTADO MEJORADO
export async function sendOrderStatusUpdate(
  email: string,
  orderId: string,
  status: string,
  customerName?: string,
  trackingNumber?: string,
  shippingAddress?: any
) {
  const orderNumber = orderId.slice(-8).toUpperCase();
  
  const statusConfig: { [key: string]: { title: string; message: string; color: string; icon: string } } = {
    'PAID': {
      title: '¡Pago Confirmado! 💳',
      message: 'Tu pago ha sido procesado exitosamente y estamos preparando tu pedido.',
      color: '#48bb78',
      icon: '✅'
    },
    'PROCESSING': {
      title: 'Pedido en Proceso 🏭',
      message: 'Tu pedido está siendo preparado y empaquetado con cuidado.',
      color: '#ed8936',
      icon: '📦'
    },
    'SHIPPED': {
      title: '¡Pedido Enviado! 🚚',
      message: 'Tu pedido ha sido enviado y está en camino a tu dirección.',
      color: '#4299e1',
      icon: '🚀'
    },
    'DELIVERED': {
      title: '¡Pedido Entregado! 🎊',
      message: 'Tu pedido ha sido entregado exitosamente. ¡Esperamos que lo disfrutes!',
      color: '#9f7aea',
      icon: '🏠'
    }
  };

  const config = statusConfig[status] || {
    title: 'Actualización de Pedido',
    message: 'El estado de tu pedido ha sido actualizado.',
    color: '#667eea',
    icon: '📋'
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Pedido - NexusShop</title>
</head>
<body style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f7fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header Dinámico -->
    <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}99 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0;">
      <div style="font-size: 48px; margin-bottom: 20px;">${config.icon}</div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${config.title}</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Pedido #${orderNumber}</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      
      <h2 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">Hola ${customerName || 'Cliente'},</h2>
      <p style="color: #718096; margin: 0 0 25px 0; font-size: 16px;">${config.message}</p>

      ${trackingNumber ? `
      <div style="background: #ebf8ff; border: 2px dashed #4299e1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <h3 style="color: #2b6cb0; margin: 0 0 10px 0; font-weight: 600;">📮 Número de Seguimiento</h3>
        <p style="margin: 0; font-size: 18px; font-weight: 700; color: #2d3748; background: white; padding: 10px; border-radius: 5px; display: inline-block;">
          ${trackingNumber}
        </p>
        <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 14px;">
          Usa este número para rastrear tu paquete en la página del servicio de mensajería.
        </p>
      </div>
      ` : ''}

      ${shippingAddress ? `
      <div style="background: #f0fff4; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #48bb78;">
        <h3 style="color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">📍 Dirección de Entrega</h3>
        <div style="color: #4a5568;">
          <p style="margin: 8px 0; font-weight: 500;">${shippingAddress.fullName}</p>
          <p style="margin: 8px 0;">${shippingAddress.street}</p>
          <p style="margin: 8px 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
          <p style="margin: 8px 0;">${shippingAddress.country}</p>
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders/${orderId}" 
           style="display: inline-block; padding: 12px 30px; background: ${config.color}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Ver Detalles del Pedido
        </a>
      </div>

    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
      <p style="margin: 0;">© 2024 NexusShop. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `${config.icon} ${statusConfig[status]?.title || 'Actualización'} - Pedido #${orderNumber} - NexusShop`,
    html,
  });
}

// Función de prueba para Resend
export async function testResend() {
  try {
    console.log('🧪 Probando Resend...');
    
    const { data, error } = await resend.emails.send({
      from: 'NexusShop <onboarding@resend.dev>',
      to: 'pashitox@gmail.com',
      subject: 'Prueba NexusShop - Email Mejorado 🎉',
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
          <h1 style="margin: 0 0 20px 0;">¡NexusShop funciona perfectamente! 🚀</h1>
          <p style="margin: 0; font-size: 18px;">Tu sistema de emails con <strong>Resend</strong> está configurado correctamente.</p>
          <p style="margin: 15px 0 0 0; opacity: 0.9;">Hora: ${new Date().toLocaleString('es-MX')}</p>
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