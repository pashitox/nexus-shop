export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
}

export interface AIResponse {
  success: boolean;
  message?: string;
  recommendedProducts?: Product[];
  data?: {
    success: boolean;
    message: string;
    recommendedProducts: Product[];
    context: any;
    nextQuestions: string[];
  };
  context?: any;
  nextQuestions?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  slug: string;
}