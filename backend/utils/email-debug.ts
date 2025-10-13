// backend/src/utils/email-debug.ts - DEBUGGING COMPLETO
import { Resend } from 'resend';

export async function debugEmailSystem() {
  console.log('🔍 INICIANDO DEBUGGING COMPLETO DEL SISTEMA DE EMAIL...');
  
  // 1. Verificar variable de entorno
  console.log('1. Verificando RESEND_API_KEY...');
  const apiKey = process.env.RESEND_API_KEY;
  console.log('   RESEND_API_KEY:', apiKey ? '✅ Presente' : '❌ Faltante');
  console.log('   Longitud:', apiKey?.length);
  console.log('   Empieza con:', apiKey?.substring(0, 3));
  
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY no encontrada' };
  }
  
  // 2. Verificar que Resend se inicializa
  console.log('2. Inicializando Resend...');
  try {
    const resend = new Resend(apiKey);
    console.log('   ✅ Resend inicializado correctamente');
    
    // 3. Intentar enviar email simple
    console.log('3. Enviando email de prueba...');
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'pashitox@gmail.com',
      subject: 'Debug Test - ' + new Date().toISOString(),
      html: '<p>Este es un email de debugging</p>',
    });
    
    if (error) {
      console.log('   ❌ Error Resend:', error);
      return { success: false, error };
    }
    
    console.log('   ✅ Email enviado. ID:', data?.id);
    return { success: true, id: data?.id };
    
  } catch (error: any) {
    console.log('   ❌ Error inicializando Resend:', error.message);
    return { success: false, error: error.message };
  }
}

// Endpoint específico para debugging
export async function debugEmailRoute(req: any, res: any) {
  try {
    const result = await debugEmailSystem();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}