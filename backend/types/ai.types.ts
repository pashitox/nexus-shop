export interface AIConversation {
  userId?: string;
  sessionId: string;
  messages: AIMessage[];
  context: ShoppingContext;
  lastMessage?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ShoppingContext {
  budget?: { min: number; max: number };
  occasion?: string;
  style?: string;
  preferences?: string[];
  excludedProducts?: string[];
  lastMessage?: string;
}

export interface AIResponse {
  success: boolean;  // 🆕 AGREGAR ESTA PROPIEDAD
  message: string;
  recommendedProducts?: any[];
  context: ShoppingContext;
  nextQuestions?: string[];
}