// Simulador de servicio de email (para desarrollo)
export async function sendEmail(to: string, subject: string, html: string) {
  console.log('📧 Email simulado:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);
  console.log('---');
  
  // En producción, integrar con Resend, SendGrid, etc.
  return Promise.resolve({ success: true });
}

export async function sendOrderConfirmation(email: string, orderId: string, total: number) {
  const subject = `Confirmación de Pedido #${orderId}`;
  const html = `
    <h1>¡Gracias por tu compra!</h1>
    <p>Tu pedido <strong>#${orderId}</strong> ha sido confirmado.</p>
    <p>Total: <strong>$${total}</strong></p>
    <p>Te notificaremos cuando tu pedido sea enviado.</p>
  `;
  
  return sendEmail(email, subject, html);
}
