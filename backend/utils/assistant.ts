import { PrismaClient } from '@prisma/client';
import { AIConversation, AIResponse, ShoppingContext } from '../types/ai.types';
import OpenAI from "openai";

const prisma = new PrismaClient();

const client = new OpenAI({
  baseURL: "https://api.scaleway.ai/ea3a1799-8672-4b0c-84c5-d756165c8358/v1",
  apiKey: process.env.SCALEWAY_API_KEY
});

export class ShoppingAssistant {
  private lastUserMessage: string = '';

  /**
   * 🆕 MÉTODO MEJORADO - Pasa productos reales a la IA
   */
  private async callFreeAIApi(message: string, context: ShoppingContext, availableProducts: any[]): Promise<string> {
    try {
      const prompt = await this.buildPrompt(message, context, availableProducts);

      const response = await client.chat.completions.create({
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          { 
            role: "system", 
            content: `Eres un asistente de compras experto para NexusShop. 
            DEBES recomendar SOLO productos que estén en la lista proporcionada.
            Responde en español de manera natural y amigable.
            NO inventes productos que no estén en la lista.
            Si no hay productos que coincidan exactamente, sugiere los más relevantes.`
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7,
        stream: false
      });

      const aiResponse = response.choices[0]?.message?.content || this.getFallbackResponse(message, context, availableProducts);
      
      // 🆕 LIMPIAR RESPUESTA - Remover tags <think> y contenido interno
      return this.cleanAIResponse(aiResponse);

    } catch (error) {
      console.error("⚠️ Error al llamar a la API de Scaleway:", error);
      return this.getFallbackResponse(message, context, availableProducts);
    }
  }

  /**
   * 🆕 LIMPIAR RESPUESTAS DE IA - Remover tags internos
   */
  private cleanAIResponse(response: string): string {
    // Remover contenido entre <think> tags y los tags mismos
    const cleaned = response.replace(/<think>[\s\S]*?<\/think>\s*/g, '');
    
    // Remover cualquier otro tag HTML que pueda quedar
    const finalCleaned = cleaned.replace(/<[^>]*>/g, '').trim();
    
    // Si queda vacío, usar respuesta por defecto
    return finalCleaned || '¡Hola! Soy tu asistente de NexusShop. ¿En qué puedo ayudarte hoy?';
  }

  /**
   * 🆕 PROMPT MEJORADO - Incluye productos reales y contexto mejorado
   */
  private async buildPrompt(userMessage: string, context: ShoppingContext, availableProducts: any[]): Promise<string> {
    // 🆕 GUARDAR MENSAJE PARA FILTRADO
    this.lastUserMessage = userMessage.toLowerCase();
    
    // Filtrar productos por contexto MEJORADO
    const filteredProducts = this.filterProductsByContext(availableProducts, context, userMessage);
    
    const prompt = `
USUARIO: ${userMessage}

CONTEXTO DEL USUARIO:
- Estilo: ${context.style || 'No especificado'}
- Ocasión: ${context.occasion || 'No especificada'} 
- Presupuesto: ${context.budget ? `$${context.budget.min} - $${context.budget.max}` : 'No especificado'}

PRODUCTOS DISPONIBLES EN NEXUSSHOP (SOLO PUEDES RECOMENDAR ESTOS):
${filteredProducts.slice(0, 8).map(p => `- ${p.name} ($${p.price}) - ${p.category} - ${p.description}`).join('\n')}

${filteredProducts.length === 0 ? 'NO HAY PRODUCTOS QUE COINCIDAN EXACTAMENTE. SUGIERE ALTERNATIVAS RELACIONADAS.' : ''}

INSTRUCCIONES CRÍTICAS:
1. Recomienda SOLO productos de la lista anterior
2. Si el usuario pide algo específico (ej: smartphone) y no está en la lista, di que no tienes ese producto exacto pero sugiere alternativas similares
3. Responde en español de manera natural
4. Sé conciso y útil
5. NO inventes productos
6. Si hay pocos productos que coincidan, recomienda los más relevantes

RESPUESTA (en español, natural, sin etiquetas):
    `;
    
    return prompt.trim();
  }

  /**
   * 🆕 FILTRADO INTELIGENTE MEJORADO - Con detección de categorías específicas
   */
  private filterProductsByContext(products: any[], context: ShoppingContext, userMessage: string): any[] {
    let filtered = [...products];
    const lowerMessage = userMessage.toLowerCase();

    // 🆕 FILTRADO POR CATEGORÍA ESPECÍFICA BASADA EN MENSAJE
    if (lowerMessage.includes('smartphone') || lowerMessage.includes('teléfono') || lowerMessage.includes('celular') || lowerMessage.includes('iphone') || lowerMessage.includes('samsung')) {
      filtered = filtered.filter(p => 
        p.category === 'electronics' && 
        (p.name.toLowerCase().includes('iphone') || 
         p.name.toLowerCase().includes('samsung') ||
         p.name.toLowerCase().includes('galaxy'))
      );
    }
    
    else if (lowerMessage.includes('laptop') || lowerMessage.includes('macbook') || lowerMessage.includes('portátil')) {
      filtered = filtered.filter(p => 
        p.category === 'electronics' && 
        p.name.toLowerCase().includes('macbook')
      );
    }
    
    else if (lowerMessage.includes('audífono') || lowerMessage.includes('airpod') || lowerMessage.includes('headphone')) {
      filtered = filtered.filter(p => 
        p.category === 'electronics' && 
        p.name.toLowerCase().includes('airpod')
      );
    }
    
    else if (lowerMessage.includes('ropa') || lowerMessage.includes('camisa') || lowerMessage.includes('jeans') || lowerMessage.includes('sudadera')) {
      filtered = filtered.filter(p => p.category === 'clothing');
    }
    
    else if (lowerMessage.includes('electrónic') || lowerMessage.includes('tecnolog') || lowerMessage.includes('tech')) {
      filtered = filtered.filter(p => p.category === 'electronics');
    }
    
    else if (lowerMessage.includes('hogar') || lowerMessage.includes('casa') || lowerMessage.includes('sábana') || lowerMessage.includes('lámpara') || lowerMessage.includes('cocina')) {
      filtered = filtered.filter(p => p.category === 'home');
    }

    // 🆕 FILTRADO POR PRESUPUESTO MEJORADO
    if (context.budget) {
      filtered = filtered.filter(p => 
        Number(p.price) >= context.budget!.min && 
        Number(p.price) <= context.budget!.max
      );
    }

    // 🆕 FILTRADO POR ESTILO MEJORADO
    if (context.style) {
      filtered = filtered.filter(p => 
        this.doesProductMatchStyle(p, context.style!)
      );
    }

    // 🆕 FILTRADO POR OCASIÓN MEJORADO
    if (context.occasion) {
      const categoryMap: { [key: string]: string[] } = {
        'trabajo': ['electronics', 'clothing'],
        'casual': ['clothing', 'electronics'],
        'formal': ['clothing'],
        'deporte': ['clothing'],
        'fiesta': ['clothing', 'electronics'],
        'viaje': ['electronics', 'home']
      };
      
      const targetCategories = categoryMap[context.occasion] || [];
      if (targetCategories.length > 0) {
        filtered = filtered.filter(p => targetCategories.includes(p.category));
      }
    }

    // 🆕 SI NO HAY RESULTADOS, BUSCAR EN CATEGORÍA RELACIONADA
    if (filtered.length === 0) {
      if (lowerMessage.includes('smartphone') || lowerMessage.includes('teléfono')) {
        // Si buscan smartphone y no hay, mostrar otros electrónicos
        filtered = products.filter(p => p.category === 'electronics').slice(0, 3);
      }
      else if (lowerMessage.includes('ropa')) {
        // Si buscan ropa y no hay, mostrar productos de hogar como alternativa
        filtered = products.filter(p => p.category === 'home').slice(0, 3);
      }
      else {
        // Fallback a productos populares
        filtered = products.slice(0, 5);
      }
    }

    return filtered;
  }

  /**
   * 🆕 MATCHING DE ESTILOS MEJORADO
   */
  private doesProductMatchStyle(product: any, style: string): boolean {
    const styleKeywords: { [key: string]: string[] } = {
      'elegante': ['elegante', 'formal', 'clásico', 'sofisticado', 'premium', 'lujo'],
      'minimalista': ['básico', 'sencillo', 'minimalista', 'simple', 'minimal'],
      'urbano': ['casual', 'urbano', 'moderno', 'jeans', 'street'],
      'deportivo': ['deporte', 'deportivo', 'cómodo', 'sudadera', 'athletic']
    };

    const keywords = styleKeywords[style] || [];
    const productText = `${product.name} ${product.description}`.toLowerCase();
    
    return keywords.some(keyword => productText.includes(keyword));
  }

  /**
   * 🆕 FALLBACK MEJORADO - Con productos reales y respuestas más naturales
   */
  private getFallbackResponse(userMessage: string, context: ShoppingContext, availableProducts: any[]): string {
    const lowerMessage = userMessage.toLowerCase();
    const productCount = availableProducts.length;

    if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
      return `¡Hola! 👋 Soy tu asistente personal de NexusShop. Tenemos ${productCount} productos increíbles. ¿Buscas electrónicos, ropa o algo para tu hogar?`;
    }
    
    if (lowerMessage.includes('presupuesto') || lowerMessage.includes('barato') || lowerMessage.includes('económico')) {
      const budgetProducts = availableProducts.filter(p => Number(p.price) < 2000);
      if (budgetProducts.length > 0) {
        return `¡Perfecto! Tenemos ${budgetProducts.length} productos bajo $2000. Te recomiendo: ${budgetProducts.slice(0, 3).map(p => p.name).join(', ')}. ¿Te interesa alguno?`;
      }
      return `Tenemos opciones para todos los presupuestos. ¿Qué tipo de producto buscas?`;
    }
    
    if (lowerMessage.includes('recomienda') || lowerMessage.includes('sugiere') || lowerMessage.includes('qué me recomiendas')) {
      const topProducts = availableProducts.slice(0, 3);
      return `¡Con gusto! Basado en nuestros productos más populares: ${topProducts.map(p => `${p.name} ($${p.price})`).join(', ')}. ¿Quieres más detalles de alguno?`;
    }

    if (lowerMessage.includes('smartphone') || lowerMessage.includes('teléfono')) {
      const smartphones = availableProducts.filter(p => 
        p.category === 'electronics' && 
        (p.name.toLowerCase().includes('iphone') || p.name.toLowerCase().includes('samsung'))
      );
      if (smartphones.length > 0) {
        return `¡Claro! Tenemos estos smartphones: ${smartphones.map(p => `${p.name} ($${p.price})`).join(', ')}. ¿Te interesa alguno?`;
      }
      return `Actualmente no tenemos smartphones en stock, pero tenemos otros electrónicos excelentes como AirPods Pro y MacBooks. ¿Te interesa verlos?`;
    }

    return `¡Interesante! En NexusShop tenemos ${productCount} productos cuidadosamente seleccionados. ¿Podrías contarme más específicamente qué buscas? Por ejemplo: "smartphone elegante", "ropa casual" o "productos para el hogar".`;
  }

  /**
   * 🆕 MÉTODO PRINCIPAL MEJORADO
   */
  public async processMessage(
    userMessage: string,
    sessionId: string,
    userId?: string
  ): Promise<AIResponse> {
    try {
      // 1. Obtener TODOS los productos activos
      const allProducts = await prisma.product.findMany({
        where: { active: true },
        take: 25
      });

      // 2. Obtener/actualizar contexto
      const conversation = await this.getConversation(sessionId);
      const updatedContext = this.updateContext(userMessage, conversation.context);

      // 3. 🆕 Pasar productos reales a la IA
      const aiMessage = await this.callFreeAIApi(userMessage, updatedContext, allProducts);

      // 4. Obtener productos recomendados (filtrados por contexto MEJORADO)
      const recommendedProducts = this.filterProductsByContext(allProducts, updatedContext, userMessage).slice(0, 3);

      // 5. Guardar y retornar
      await this.saveMessage(sessionId, 'user', userMessage);
      await this.saveMessage(sessionId, 'assistant', aiMessage);

      return {
        success: true,  // ✅ AHORA SÍ EXISTE EN LA INTERFAZ
        message: aiMessage,
        recommendedProducts: recommendedProducts,
        context: updatedContext,
        nextQuestions: this.generateFollowUpQuestions(userMessage, recommendedProducts)
      };

    } catch (error) {
      console.error('Error en processMessage:', error);
      return {
        success: false,  // ✅ AHORA SÍ EXISTE EN LA INTERFAZ
        message: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        recommendedProducts: [],
        context: {},
        nextQuestions: []
      };
    }
  }

  /**
   * 🆕 GENERAR PREGUNTAS MEJORADO
   */
  private generateFollowUpQuestions(userMessage: string, recommendedProducts: any[]): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    if (recommendedProducts.length === 0) {
      return [
        "¿Te interesa ver todos nuestros productos?",
        "¿Qué categoría te gusta más: electrónicos, ropa o hogar?",
        "¿Tienes un presupuesto específico?"
      ];
    }

    // 🆕 PREGUNTAS ESPECÍFICAS BASADAS EN EL CONTEXTO
    if (lowerMessage.includes('smartphone') || lowerMessage.includes('teléfono')) {
      return [
        "¿Te gustaría comparar características?",
        "¿Buscas algo más económico o premium?",
        "¿Necesitas accesorios para tu smartphone?"
      ];
    }

    if (lowerMessage.includes('ropa') || lowerMessage.includes('outfit')) {
      return [
        "¿Quieres que combine estos productos con otros?",
        "¿Prefieres algo más casual o formal?",
        "¿Qué colores te gustan?"
      ];
    }

    if (lowerMessage.includes('hogar') || lowerMessage.includes('casa')) {
      return [
        "¿Buscas algo para alguna habitación específica?",
        "¿Te interesa decoración o funcionalidad?",
        "¿Prefieres estilo moderno o clásico?"
      ];
    }

    return [
      "¿Te gustaría ver más detalles de algún producto?",
      "¿Quieres que busque opciones en otra categoría?",
      "¿El presupuesto se ajusta a lo que buscas?"
    ];
  }

  private async getConversation(sessionId: string): Promise<any> {
    return { 
      sessionId, 
      messages: [], 
      context: {},
      lastMessage: this.lastUserMessage 
    };
  }

  private updateContext(userMessage: string, currentContext: ShoppingContext): ShoppingContext {
    const lowerMessage = userMessage.toLowerCase();
    const newContext = { ...currentContext };

    // 🆕 DETECCIÓN DE PRESUPUESTO MEJORADA
    const budgetMatch = userMessage.match(/(\d+)\s*(a|\-)\s*(\d+)/);
    if (budgetMatch) {
      newContext.budget = { 
        min: parseInt(budgetMatch[1]), 
        max: parseInt(budgetMatch[3]) 
      };
    }

    // 🆕 DETECCIÓN DE NÚMEROS SIMPLES COMO PRESUPUESTO MÁXIMO
    const singleBudget = userMessage.match(/\$?\s*(\d+)\s*(pesos|dólares|usd)?/i);
    if (singleBudget && !budgetMatch) {
      const amount = parseInt(singleBudget[1]);
      newContext.budget = { min: 0, max: amount };
    }

    // 🆕 DETECCIÓN DE OCASIÓN MEJORADA
    const occasions = ['trabajo', 'oficina', 'casual', 'formal', 'deporte', 'ejercicio', 'fiesta', 'evento', 'viaje', 'vacaciones'];
    const foundOccasion = occasions.find(o => lowerMessage.includes(o));
    if (foundOccasion) newContext.occasion = foundOccasion;

    // 🆕 DETECCIÓN DE ESTILO MEJORADA
    const styles = ['minimalista', 'elegante', 'urbano', 'clásico', 'deportivo', 'moderno', 'vintage'];
    const foundStyle = styles.find(s => lowerMessage.includes(s));
    if (foundStyle) newContext.style = foundStyle;

    return newContext;
  }

  private async saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${sessionId}] [${role.toUpperCase()}] ${content.substring(0, 100)}...`);
  }
}