// /home/pashitox/Documentos/nexus-shop/backend/utils/emailTemplates.ts
export interface OrderDetails {
  id: string;
  total: number;
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  shippingAddress: any;
  createdAt: string;
}

export function generateOrderConfirmationTemplate(order: OrderDetails, customerName?: string) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('es-MX');
  const orderTotal = order.total.toFixed(2);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f7f7f7; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .order-info { background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 20px 0; }
    .product-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
    .footer { background: #2d3748; color: white; padding: 30px; text-align: center; font-size: 14px; }
    .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Gracias por tu compra! 🎉</h1>
      <p>Tu pedido en NexusShop ha sido confirmado</p>
    </div>
    
    <div class="content">
      <h2>Hola ${customerName || 'Cliente'},</h2>
      <p>Estamos procesando tu pedido y te notificaremos cuando sea enviado.</p>
      
      <div class="order-info">
        <h3>📦 Detalles del Pedido</h3>
        <p><strong>Número de orden:</strong> #${order.id.slice(-8).toUpperCase()}</p>
        <p><strong>Fecha:</strong> ${orderDate}</p>
        <p><strong>Total:</strong> $${orderTotal}</p>
      </div>

      <h3>🛍️ Productos</h3>
      ${order.items.map(item => `
        <div class="product-item">
          <span>${item.product.name} × ${item.quantity}</span>
          <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/account/orders/${order.id}" class="button">
          Ver mi pedido
        </a>
      </div>

      <p>¿Tienes preguntas? Responde a este email o contacta a nuestro soporte.</p>
    </div>
    
    <div class="footer">
      <p>NexusShop - Tu tienda de confianza</p>
      <p>© 2024 NexusShop. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateOrderShippedTemplate(order: OrderDetails, trackingNumber?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f7f7f7; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Tu pedido está en camino! 🚚</h1>
      <p>Orden #${order.id.slice(-8).toUpperCase()} ha sido enviada</p>
    </div>
    
    <div class="content">
      <h2>¡Buenas noticias!</h2>
      <p>Tu pedido ha sido enviado y está en camino a tu dirección.</p>
      
      ${trackingNumber ? `
      <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📮 Número de Seguimiento</h3>
        <p><strong>${trackingNumber}</strong></p>
        <p>Usa este número para rastrear tu paquete en la página del servicio de mensajería.</p>
      </div>
      ` : ''}

      <p>Esperamos que disfrutes tus productos. ¡Gracias por comprar en NexusShop!</p>
    </div>
  </div>
</body>
</html>
  `;
}