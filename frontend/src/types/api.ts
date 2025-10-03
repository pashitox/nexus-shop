// Mock API client para desarrollo
export const apiClient = {
  // Productos
  getProducts: async () => {
    // Mock data - reemplaza con tu API real
    return {
      data: [],
      status: 200
    };
  },

  getProduct: async (id: string) => {
    return {
      data: null,
      status: 200
    };
  },

  // Órdenes
  getOrders: async () => {
    return {
      data: [],
      status: 200
    };
  },

  createOrder: async (orderData: any) => {
    return {
      data: { id: '1', ...orderData },
      status: 201
    };
  },

  // Autenticación
  login: async (credentials: any) => {
    return {
      data: { user: null, token: null },
      status: 200
    };
  },

  register: async (userData: any) => {
    return {
      data: { user: null, token: null },
      status: 201
    };
  },

  getProfile: async () => {
    return {
      data: null,
      status: 200
    };
  },

  // Direcciones
  getAddresses: async () => {
    return {
      data: [],
      status: 200
    };
  },

  createAddress: async (addressData: any) => {
    return {
      data: { id: '1', ...addressData },
      status: 201
    };
  }
};