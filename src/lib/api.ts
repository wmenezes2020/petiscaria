import axios from 'axios';

// Configuração base da API
const getApiUrl = () => {
  // Se estiver no navegador, usar a URL completa
  if (typeof window !== 'undefined') {
    // Em produção, usar a URL do domínio atual sem /api/v1 (será adicionado automaticamente)
    const isProduction = !window.location.hostname.includes('localhost');
    if (isProduction) {
      return `${window.location.protocol}//api-petiscaria.edeniva.com.br/api/v1`;
    }
    return 'http://localhost:3001/api/v1';
  }
  // Durante SSR, usar a variável de ambiente
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // Verificar se existe token no localStorage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          // Verificar tanto o formato com state quanto o formato direto
          const accessToken = authData.state?.accessToken || authData.accessToken;
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (error) {
          // Silenciar erro de parsing
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          const refreshToken = authData.state?.refreshToken || authData.refreshToken;
          if (refreshToken) {
            const response = await api.post('/auth/refresh', {
              refreshToken: refreshToken,
            });

            const { accessToken } = response.data;

            // Atualizar o token no localStorage
            const updatedAuthData = {
              ...authData,
              state: {
                ...authData.state,
                accessToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData));

            // Atualizar o header da requisição original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Reexecutar a requisição original
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Se falhar ao renovar o token, limpar dados de autenticação
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Função para garantir que o token esteja configurado
const ensureAuthToken = () => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const accessToken = authData.state?.accessToken || authData.accessToken;
        if (accessToken && !api.defaults.headers.common['Authorization']) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
      } catch (error) {
        // Silenciar erro de configuração
      }
    }
  }
};

// Funções auxiliares para diferentes tipos de requisições
export const apiClient = {
  // GET
  get: <T>(url: string, config?: any) => {
    ensureAuthToken();
    return api.get<T>(url, config).then(response => response.data);
  },

  // POST
  post: <T>(url: string, data?: any, config?: any) => {
    ensureAuthToken();
    return api.post<T>(url, data, config).then(response => response.data);
  },

    // PUT
  put: <T>(url: string, data?: any, config?: any) => {
    ensureAuthToken();
    return api.put<T>(url, data, config).then(response => response.data);
  },

  // PATCH
  patch: <T>(url: string, data?: any, config?: any) => {
    ensureAuthToken();
    return api.patch<T>(url, data, config).then(response => response.data);
  },

  // DELETE
  delete: <T>(url: string, config?: any) => {
    ensureAuthToken();
    return api.delete<T>(url, config).then(response => response.data);
  },
};

// Tipos para respostas de API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors?: string[];
  statusCode: number;
}


// =============================================
// Dashboard API
// =============================================

export interface OrderStats {
  open: number;
  preparing: number;
  ready: number;
  delivered: number;
  closed: number;
  cancelled: number;
  total: number;
}

export interface TableStats {
  occupied: number;
  available: number;
  total: number;
}

export interface DashboardStats {
  orderStats: OrderStats;
  tableStats: TableStats;
  // Adicionar outros KPIs conforme o backend evoluir
  // dailyRevenue: number;
  // ticketMedio: number;
}

export interface DashboardData {
  period: {
    start: string;
    end: string;
    type: string;
  };
  kpis: {
    totalRevenue: { label: string; value: number; unit?: string; };
    totalOrders: { label: string; value: number; unit?: string; };
    averageOrderValue: { label: string; value: number; unit?: string; };
    totalCustomers: { label: string; value: number; unit?: string; };
    activeTables: { label: string; value: number; unit?: string; };
    pendingOrders: { label: string; value: number; unit?: string; };
    lowStockProducts: { label: string; value: number; unit?: string; };
    topSellingProduct: { label: string; value: number; unit?: string; };
  };
  comparison: {
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    averageOrderValueChange: number;
  };
  tables: {
    recentOrders: any[];
    topCustomers: any[];
    lowStockAlerts: any[];
  };
}

export const getDashboardStats = async (): Promise<DashboardData> => {
  try {
    const data = await apiClient.get<DashboardData>('/dashboard');
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};



// =============================================
// Tables API
// =============================================

export interface TableResponse {
  id: string;
  name: string;
  capacity: number;
  shape?: string;
  x?: number;
  y?: number;
  area?: string | null;
  areaId?: string | null;
  locationId?: string | null;
  description?: string | null;
  isActive: boolean;
  isSmoking?: boolean;
  isOutdoor?: boolean;
  minimumOrder?: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service' | string;
  isAvailable: boolean;
  currentOrderId?: string | null;
  currentCustomerCount?: number;
  openedAt?: string | null;
  metadata?: Record<string, any> | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommandOrderItemResponse {
  id: string;
  productId?: string;
  productName: string;
  productDescription?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
  notes?: string;
  specialInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommandOrderResponse {
  id: string;
  status: string;
  channel: string;
  notes?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  numberOfPeople: number;
  tableId?: string;
  customerId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  table?: {
    id: string;
    number: string;
    name?: string;
  };
  customer?: {
    id: string;
    name: string;
    phone?: string;
  };
  orderItems: CommandOrderItemResponse[];
}

export interface TableCommandPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  processedAt?: string | null;
}

export interface TableCommandResponse {
  order: CommandOrderResponse;
  table: TableResponse;
  payment?: TableCommandPayment;
}

const normalizeNumber = (value: any, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const normalizeDate = (value: any): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeTable = (table: any): TableResponse => ({
  id: table.id,
  name: table.name,
  capacity: normalizeNumber(table.capacity, 0),
  shape: table.shape ?? undefined,
  x: table.x !== undefined ? Number(table.x) : undefined,
  y: table.y !== undefined ? Number(table.y) : undefined,
  area: table.area ?? table.areaName ?? null,
  areaId: table.areaId ?? null,
  locationId: table.locationId ?? null,
  description: table.description ?? null,
  isActive: Boolean(table.isActive ?? true),
  isSmoking: table.isSmoking ?? false,
  isOutdoor: table.isOutdoor ?? false,
  minimumOrder: table.minimumOrder !== undefined ? Number(table.minimumOrder) : undefined,
  status: (table.status ?? 'available') as TableResponse['status'],
  isAvailable: (table.status ?? 'available') === 'available',
  currentOrderId: table.currentOrderId ?? null,
  currentCustomerCount: table.currentCustomerCount !== undefined ? Number(table.currentCustomerCount) : undefined,
  openedAt: normalizeDate(table.openedAt),
  metadata: table.metadata ?? null,
  companyId: table.companyId,
  createdAt: normalizeDate(table.createdAt) ?? new Date().toISOString(),
  updatedAt: normalizeDate(table.updatedAt) ?? new Date().toISOString(),
});

const normalizeCommandPayment = (payment: any): TableCommandPayment => ({
  id: payment.id,
  amount: normalizeNumber(payment.amount, 0),
  paymentMethod: payment.paymentMethod ?? payment.method ?? 'cash',
  status: payment.status ?? 'completed',
  createdAt: normalizeDate(payment.createdAt) ?? new Date().toISOString(),
  processedAt: normalizeDate(payment.processedAt),
});

const normalizeCommandOrder = (order: any): CommandOrderResponse => ({
  id: order.id,
  status: order.status,
  channel: order.channel,
  notes: order.notes ?? undefined,
  subtotal: normalizeNumber(order.subtotal, 0),
  discount: normalizeNumber(order.discount, 0),
  tax: normalizeNumber(order.tax, 0),
  total: normalizeNumber(order.total, 0),
  numberOfPeople: normalizeNumber(order.numberOfPeople, 0),
  tableId: order.tableId ?? undefined,
  customerId: order.customerId ?? undefined,
  createdBy: order.createdBy,
  createdAt: normalizeDate(order.createdAt) ?? new Date().toISOString(),
  updatedAt: normalizeDate(order.updatedAt) ?? new Date().toISOString(),
  table: order.table ? {
    id: order.table.id,
    number: order.table.number,
    name: order.table.name ?? undefined,
  } : undefined,
  customer: order.customer ? {
    id: order.customer.id,
    name: order.customer.name,
    phone: order.customer.phone ?? undefined,
  } : undefined,
  orderItems: Array.isArray(order.orderItems)
    ? order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId ?? undefined,
        productName: item.productName,
        productDescription: item.productDescription ?? undefined,
        unitPrice: normalizeNumber(item.unitPrice, 0),
        quantity: normalizeNumber(item.quantity, 0),
        totalPrice: normalizeNumber(item.totalPrice, normalizeNumber(item.unitPrice, 0) * normalizeNumber(item.quantity, 0)),
        discount: normalizeNumber(item.discount, 0),
        tax: normalizeNumber(item.tax, 0),
        notes: item.notes ?? undefined,
        specialInstructions: item.specialInstructions ?? undefined,
        createdAt: normalizeDate(item.createdAt) ?? undefined,
        updatedAt: normalizeDate(item.updatedAt) ?? undefined,
      }))
    : [],
});

export const getTables = async (): Promise<TableResponse[]> => {
  try {
    const data = await apiClient.get<any>('/tables');
    if (data && Array.isArray(data.tables)) {
      return data.tables.map(normalizeTable);
    }
    if (Array.isArray(data)) {
      return data.map(normalizeTable);
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar mesas:', error);
    throw error;
  }
};

export const createTable = async (data: { 
  name: string; 
  capacity: number; 
  areaId: string; 
  locationId: string; 
  isActive: boolean; 
  isAvailable: boolean; 
  description?: string; 
  coordinates?: {
    x: number;
    y: number;
  }; 
}): Promise<TableResponse> => {
  try {
    return await apiClient.post<TableResponse>('/tables', data);
  } catch (error) {
    console.error('Erro ao criar mesa:', error);
    throw error;
  }
};

export const updateTable = async (id: string, data: { 
  name?: string; 
  capacity?: number; 
  areaId?: string; 
  locationId?: string; 
  isActive?: boolean; 
  isAvailable?: boolean; 
  description?: string; 
  coordinates?: {
    x: number;
    y: number;
  }; 
}): Promise<TableResponse> => {
  try {
    return await apiClient.patch<TableResponse>(`/tables/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    throw error;
  }
};

export const deleteTable = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/tables/${id}`);
  } catch (error) {
    console.error('Erro ao excluir mesa:', error);
    throw error;
  }
};

export const openTableCommand = async (tableId: string, data: {
  numberOfPeople: number;
  customerId?: string;
  notes?: string;
  items?: CreateOrderPayload['orderItems'];
}): Promise<TableCommandResponse> => {
  try {
    const response = await apiClient.post<TableCommandResponse>(`/tables/${tableId}/open`, data);
    return {
      order: normalizeCommandOrder(response.order),
      table: normalizeTable(response.table),
    };
  } catch (error) {
    console.error('Erro ao abrir comanda da mesa:', error);
    throw error;
  }
};

export const addItemsToTableCommand = async (tableId: string, data: {
  items: CreateOrderPayload['orderItems'];
}): Promise<CommandOrderResponse> => {
  try {
    const response = await apiClient.post<CommandOrderResponse>(`/tables/${tableId}/items`, data);
    return normalizeCommandOrder(response);
  } catch (error) {
    console.error('Erro ao adicionar itens na comanda da mesa:', error);
    throw error;
  }
};

export const closeTableCommand = async (tableId: string, data: {
  status?: 'open' | 'preparing' | 'ready' | 'delivered' | 'closed' | 'cancelled';
  notes?: string;
  cancellationReason?: string;
  registerPayment?: boolean;
  paymentMethod?: 'cash' | 'pix' | 'credit_card';
  paymentAmount?: number;
}): Promise<TableCommandResponse> => {
  try {
    const response = await apiClient.post<TableCommandResponse>(`/tables/${tableId}/close`, data);
    return {
      order: normalizeCommandOrder(response.order),
      table: normalizeTable(response.table),
      payment: response.payment ? normalizeCommandPayment(response.payment) : undefined,
    };
  } catch (error) {
    console.error('Erro ao fechar comanda da mesa:', error);
    throw error;
  }
};

export interface LocationResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AreaResponse {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const getLocations = async (): Promise<LocationResponse[]> => {
  try {
    return await apiClient.get<LocationResponse[]>('/locations');
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    throw error;
  }
};

export const createLocation = async (data: {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
}): Promise<LocationResponse> => {
  try {
    return await apiClient.post<LocationResponse>('/locations', data);
  } catch (error) {
    console.error('Erro ao criar localização:', error);
    throw error;
  }
};

export const updateLocation = async (id: string, data: Partial<LocationResponse>): Promise<LocationResponse> => {
  try {
    return await apiClient.patch<LocationResponse>(`/locations/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    throw error;
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/locations/${id}`);
  } catch (error) {
    console.error('Erro ao excluir localização:', error);
    throw error;
  }
};

export const getAreas = async (): Promise<AreaResponse[]> => {
  try {
    return await apiClient.get<AreaResponse[]>('/areas');
  } catch (error) {
    console.error('Erro ao buscar áreas:', error);
    throw error;
  }
};

export const createArea = async (data: { name: string; description?: string }): Promise<AreaResponse> => {
  try {
    return await apiClient.post<AreaResponse>('/areas', data);
  } catch (error) {
    console.error('Erro ao criar área:', error);
    throw error;
  }
};

export const updateArea = async (id: string, data: { name?: string; description?: string }): Promise<AreaResponse> => {
  try {
    return await apiClient.patch<AreaResponse>(`/areas/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar área:', error);
    throw error;
  }
};

export const deleteArea = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/areas/${id}`);
  } catch (error) {
    console.error('Erro ao excluir área:', error);
    throw error;
  }
};



// =============================================
// Orders API
// =============================================

import { OrderStatus } from '@/components/orders/OrderStatusBadge';

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  customerName?: string;
  tableId: string;
  tableName?: string;
  channel?: 'table' | 'counter' | 'delivery' | 'takeaway' | string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  total: number;
  estimatedTime: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  table: {
    number: number;
  } | null;
  customer: {
    name: string;
  } | null;
  items: OrderItem[];
}

export interface PaginatedOrdersResponse {
  orders: OrderResponse[];
  total: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getOrders = async (): Promise<OrderResponse[]> => {
  try {
    return await apiClient.get<OrderResponse[]>('/orders');
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const getOrder = async (id: string): Promise<CommandOrderResponse> => {
  try {
    const response = await apiClient.get<CommandOrderResponse>(`/orders/${id}`);
    return normalizeCommandOrder(response);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
};

export type CreateOrderPayload = {
  channel: 'table' | 'counter' | 'delivery' | 'takeaway';
  numberOfPeople: number;
  notes?: string;
  discount?: number;
  tax?: number;
  tableId?: string;
  customerId?: string;
  orderItems: Array<{
    productId?: string;
    productName: string;
    productDescription?: string;
    unitPrice: number;
    quantity: number;
    discount?: number;
    tax?: number;
    notes?: string;
    specialInstructions?: string;
    modifications?: Array<{
      optionId: string;
      optionName: string;
      extraPrice: number;
    }>;
  }>;
  metadata?: {
    source?: string;
    deviceInfo?: string;
    location?: string;
    specialInstructions?: string;
  };
};

export const createOrder = async (data: CreateOrderPayload): Promise<OrderResponse> => {
  try {
    return await apiClient.post<OrderResponse>('/orders', data);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const updateOrder = async (id: string, data: { 
  customerId?: string; 
  tableId?: string; 
  items?: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTime?: number;
  notes?: string;
}): Promise<OrderResponse> => {
  try {
    return await apiClient.patch<OrderResponse>(`/orders/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/orders/${id}`);
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    throw error;
  }
};


// =============================================
// KDS API
// =============================================

export interface KdsOrdersResponse {
  open: OrderResponse[];
  preparing: OrderResponse[];
}

export const getKdsOrders = async (): Promise<KdsOrdersResponse> => {
  const [open, preparing] = await Promise.all([
    apiClient.get<OrderResponse[]>('/orders/status/OPEN'),
    apiClient.get<OrderResponse[]>('/orders/status/PREPARING'),
  ]);
  return { open, preparing };
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<OrderResponse> => {
    return apiClient.patch<OrderResponse>(
        `/orders/${orderId}/status/${status}`
    );
};

export type KitchenItemStatus = 'pending' | 'preparing' | 'ready' | 'served';

export interface UpdateOrderItemStatusPayload {
  orderId: string;
  itemId: string;
  status: KitchenItemStatus;
  notes?: string;
}

export const updateOrderItemStatus = async (payload: UpdateOrderItemStatusPayload) => {
  return apiClient.post('/kitchen/item/status', payload);
};



// =============================================
// Menu API
// =============================================

export interface MenuItemResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategoryResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const getMenuItems = async (): Promise<MenuItemResponse[]> => {
    try {
        const data = await apiClient.get<any>('/products');

        let items: any[] = [];
        if (data && Array.isArray(data.products)) {
            items = data.products;
        } else if (Array.isArray(data?.data)) {
            items = data.data;
        } else if (Array.isArray(data)) {
            items = data;
        }

        return items.map((item) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price ?? 0),
            preparationTime: typeof item.preparationTime === 'string' ? parseInt(item.preparationTime, 10) : item.preparationTime,
            imageUrl: item.imageUrl ?? item.mainImage ?? null,
            mainImage: item.mainImage ?? item.imageUrl ?? null,
        })) as MenuItemResponse[];
    } catch (error) {
        console.error('Erro ao buscar itens do menu:', error);
        return [
            {
                id: '1',
                name: 'Hambúrguer Artesanal',
                description: 'Hambúrguer com carne 180g, queijo, alface, tomate e molho especial',
                price: 25.90,
                categoryId: '1',
                imageUrl: 'https://via.placeholder.com/150',
                isAvailable: true,
                preparationTime: 10,
                allergens: ['Glúten'],
                nutritionalInfo: { calories: 200, protein: 10, carbs: 10, fat: 5 },
                companyId: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Batata Frita',
                description: 'Porção de batata frita crocante',
                price: 12.50,
                categoryId: '2',
                imageUrl: 'https://via.placeholder.com/150',
                isAvailable: true,
                preparationTime: 5,
                allergens: [],
                nutritionalInfo: { calories: 150, protein: 5, carbs: 15, fat: 10 },
                companyId: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Refrigerante Lata',
                description: 'Coca-Cola, Pepsi ou Guaraná 350ml',
                price: 5.00,
                categoryId: '3',
                imageUrl: 'https://via.placeholder.com/150',
                isAvailable: true,
                preparationTime: 0,
                allergens: [],
                nutritionalInfo: { calories: 100, protein: 0, carbs: 25, fat: 0 },
                companyId: '1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
};

export const createMenuItem = async (data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    return apiClient.post<MenuItemResponse>('/products', data);
};

export const updateMenuItem = async (id: string, data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    return apiClient.patch<MenuItemResponse>(`/products/${id}`, data);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${id}`);
};



// =============================================
// Stock API
// =============================================

export interface IngredientResponse {
    id: string;
    companyId?: string;
    categoryId: string;
    category?: {
        id: string;
        name: string;
    };
    name: string;
    sku?: string;
    description?: string;
    ingredientType?: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unitCost: number;
    unitPrice: number;
    supplierName?: string;
    brand?: string;
    barcode?: string;
    allergens?: string;
    nutritionalInfo?: Record<string, any> | null;
    storageConditions?: Record<string, any> | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    totalValue?: number;
    stockPercentage?: number;
    lowStock?: boolean;
    overStock?: boolean;
}

interface IngredientListResponse {
    ingredients?: any[];
    data?: any[];
    total?: number;
}

const normalizeIngredient = (ingredient: any): IngredientResponse => {
    if (!ingredient) {
        return {
            id: '',
            categoryId: '',
            name: '',
            unit: 'unit',
            currentStock: 0,
            minStock: 0,
            maxStock: 0,
            unitCost: 0,
            unitPrice: 0,
        };
    }

    const parseNumber = (value: any, fallback = 0) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isNaN(parsed) ? fallback : parsed;
        }
        return fallback;
    };

    return {
        id: ingredient.id,
        companyId: ingredient.companyId,
        categoryId: ingredient.categoryId ?? ingredient.category?.id ?? '',
        category: ingredient.category,
        name: ingredient.name,
        sku: ingredient.sku,
        description: ingredient.description,
        ingredientType: ingredient.ingredientType,
        unit: ingredient.unit ?? 'unit',
        currentStock: parseNumber(ingredient.currentStock ?? ingredient.quantity, 0),
        minStock: parseNumber(ingredient.minStock ?? ingredient.lowStockThreshold, 0),
        maxStock: parseNumber(ingredient.maxStock ?? ingredient.maxStockThreshold, 0),
        unitCost: parseNumber(ingredient.unitCost, 0),
        unitPrice: parseNumber(ingredient.unitPrice, 0),
        supplierName: ingredient.supplierName,
        brand: ingredient.brand,
        barcode: ingredient.barcode,
        allergens: ingredient.allergens,
        nutritionalInfo: ingredient.nutritionalInfo ?? null,
        storageConditions: ingredient.storageConditions ?? null,
        isActive: ingredient.isActive,
        createdAt: ingredient.createdAt,
        updatedAt: ingredient.updatedAt,
        totalValue: parseNumber(ingredient.totalValue, parseNumber(ingredient.currentStock, 0) * parseNumber(ingredient.unitCost, 0)),
        stockPercentage: parseNumber(ingredient.stockPercentage, 0),
        lowStock: ingredient.lowStock,
        overStock: ingredient.overStock,
    };
};

const normalizeIngredientArray = (data: any): IngredientResponse[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.map(normalizeIngredient);
    }
    if (Array.isArray(data.ingredients)) {
        return data.ingredients.map(normalizeIngredient);
    }
    if (Array.isArray(data.data)) {
        return data.data.map(normalizeIngredient);
    }
    return [];
};

export const getIngredients = async (): Promise<IngredientResponse[]> => {
    try {
        const response = await apiClient.get<IngredientListResponse | IngredientResponse[]>('/ingredients');
        return normalizeIngredientArray(response);
    } catch (error) {
        console.error('Erro ao buscar ingredientes:', error);
        throw error;
    }
};

type CreateIngredientPayload = {
    categoryId: string;
    name: string;
    sku?: string;
    description?: string;
    ingredientType?: string;
    unit?: string;
    currentStock?: number;
    minStock?: number;
    maxStock?: number;
    unitCost?: number;
    unitPrice?: number;
    supplierName?: string;
    brand?: string;
    barcode?: string;
    allergens?: string;
    nutritionalInfo?: Record<string, any> | null;
    storageConditions?: Record<string, any> | null;
    isActive?: boolean;
};

type UpdateIngredientPayload = Partial<CreateIngredientPayload>;

export const createIngredient = async (data: CreateIngredientPayload): Promise<IngredientResponse> => {
    try {
        const payload = {
            ...data,
            currentStock: data.currentStock ?? 0,
            minStock: data.minStock ?? 0,
            maxStock: data.maxStock ?? 0,
            unitCost: data.unitCost ?? 0,
            unitPrice: data.unitPrice ?? 0,
        };

        const response = await apiClient.post<IngredientResponse>('/ingredients', payload);
        return normalizeIngredient(response);
    } catch (error) {
        console.error('Erro ao criar ingrediente:', error);
        throw error;
    }
};

export const updateIngredient = async (id: string, data: UpdateIngredientPayload): Promise<IngredientResponse> => {
    try {
        const response = await apiClient.patch<IngredientResponse>(`/ingredients/${id}`, data);
        return normalizeIngredient(response);
    } catch (error) {
        console.error('Erro ao atualizar ingrediente:', error);
        throw error;
    }
};

export const deleteIngredient = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/ingredients/${id}`);
    } catch (error) {
        console.error('Erro ao excluir ingrediente:', error);
        throw error;
    }
};



// =============================================
// Financial API
// =============================================

import { TransactionType } from '@/components/financial/TransactionTypeBadge';

export interface FinancialSummaryResponse {
    currentBalance: number;
    totalRevenue: number;
    totalExpenses: number;
}

export interface TransactionResponse {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    date: string;
    category: string;
}

export const getFinancialSummary = async (): Promise<FinancialSummaryResponse> => {
    return apiClient.get<FinancialSummaryResponse>('/financial/summary');
};

export const getTransactions = async (): Promise<TransactionResponse[]> => {
    return apiClient.get<TransactionResponse[]>('/financial/transactions');
};



// =============================================
// Reports API
// =============================================

export interface SalesReportData {
    totalRevenue: number;
    totalOrders: number;
    averageTicket: number;
    topSellingItems: {
        id: string;
        name: string;
        quantity: number;
    }[];
    salesByDay: {
        date: string;
        total: number;
    }[];
}

export interface GetSalesReportParams {
    startDate: string; // ISO 8601 format
    endDate: string; // ISO 86_01 format
}

export const getSalesReport = async (params: GetSalesReportParams): Promise<SalesReportData> => {
    const query = new URLSearchParams();
    query.append('startDate', params.startDate);
    query.append('endDate', params.endDate);

    return apiClient.get<SalesReportData>(`/reports/sales?${query.toString()}`);
};

export interface SalesSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export const getSalesSummary = async (params: { startDate?: string, endDate?: string }): Promise<SalesSummaryResponse> => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  
  return apiClient.get<SalesSummaryResponse>(`/reports/sales-summary?${query.toString()}`);
};

export interface TopSellingProductResponse {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export const getTopSellingProducts = async (params: { startDate?: string, endDate?: string, limit?: number }): Promise<TopSellingProductResponse[]> => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  const products = await apiClient.get<TopSellingProductResponse[]>(`/reports/top-selling-products?${query.toString()}`);
  if (params.limit && params.limit > 0) {
    return products.slice(0, params.limit);
  }
  return products;
};

export interface SalesByCategoryResponse {
  categoryName: string;
  totalRevenue: number;
  totalQuantitySold: number;
}

export const getSalesByCategory = async (params: { startDate?: string, endDate?: string }): Promise<SalesByCategoryResponse[]> => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  return apiClient.get<SalesByCategoryResponse[]>(`/reports/sales-by-category?${query.toString()}`);
};

export interface SalesTimelineResponse {
  date: string;
  totalRevenue: number;
}

export const getSalesTimeline = async (params: { startDate?: string, endDate?: string }): Promise<SalesTimelineResponse[]> => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);

  return apiClient.get<SalesTimelineResponse[]>(`/reports/sales-timeline?${query.toString()}`);
};

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
// Cash Register API
// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

export enum MovementType {
  OPENING = 'opening',
  CLOSING = 'closing',
  SALE = 'sale',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  EXPENSE = 'expense',
  ADJUSTMENT = 'adjustment',
}

export interface CashMovementResponse {
  id: string;
  companyId?: string;
  cashRegisterId?: string;
  userId?: string;
  movementType: MovementType;
  amount: number;
  description: string;
  notes?: string;
  paymentMethod?: string;
  previousBalance?: number;
  newBalance?: number;
  orderId?: string;
  paymentId?: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    name: string;
  };
}

export interface CashRegisterResponse {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  openedBy: { id: string, name: string };
  movements: CashMovementResponse[];
}

const normalizeCashMovement = (movement: any): CashMovementResponse => ({
  id: movement.id,
  companyId: movement.companyId ?? undefined,
  cashRegisterId: movement.cashRegisterId ?? undefined,
  userId: movement.userId ?? undefined,
  movementType: movement.movementType,
  amount: normalizeNumber(movement.amount, 0),
  description: movement.description ?? 'Movimentação',
  notes: movement.notes ?? undefined,
  paymentMethod:
    movement.paymentMethod ??
    movement.metadata?.paymentMethod ??
    movement.metadata?.customFields?.paymentMethod ??
    undefined,
  previousBalance: movement.previousBalance !== undefined && movement.previousBalance !== null
    ? normalizeNumber(movement.previousBalance, 0)
    : undefined,
  newBalance: movement.newBalance !== undefined && movement.newBalance !== null
    ? normalizeNumber(movement.newBalance, 0)
    : undefined,
  orderId: movement.orderId ?? movement.metadata?.orderId ?? undefined,
  paymentId: movement.paymentId ?? movement.metadata?.paymentId ?? undefined,
  metadata: movement.metadata ?? movement.customFields ?? null,
  createdAt: normalizeDate(movement.createdAt) ?? new Date().toISOString(),
  updatedAt: normalizeDate(movement.updatedAt) ?? undefined,
  user: movement.user
    ? {
        id: movement.user.id ?? undefined,
        name: movement.user.name ?? 'Usuário',
      }
    : undefined,
});

const normalizeCashRegister = (cashRegister: any): CashRegisterResponse => ({
  id: cashRegister.id,
  openingBalance: normalizeNumber(cashRegister.openingBalance, 0),
  closingBalance:
    cashRegister.closingBalance !== undefined && cashRegister.closingBalance !== null
      ? normalizeNumber(cashRegister.closingBalance, 0)
      : undefined,
  expectedBalance:
    cashRegister.expectedBalance !== undefined && cashRegister.expectedBalance !== null
      ? normalizeNumber(cashRegister.expectedBalance, 0)
      : undefined,
  status: cashRegister.status,
  openedAt: normalizeDate(cashRegister.openedAt) ?? new Date().toISOString(),
  closedAt: normalizeDate(cashRegister.closedAt) ?? undefined,
  openedBy: cashRegister.openedBy ?? { id: '', name: 'Usuário' },
  movements: Array.isArray(cashRegister.movements)
    ? cashRegister.movements.map(normalizeCashMovement)
    : [],
});

export const getCurrentCashRegister = async (): Promise<CashRegisterResponse> => {
  const data = await apiClient.get<any>('/cash-registers/current');
  return normalizeCashRegister(data);
};

export const openCashRegister = async (data: { openingBalance: number, notes?: string }): Promise<CashRegisterResponse> => {
  return apiClient.post<CashRegisterResponse>('/cash-registers/open', data);
};

export const closeCashRegister = async (data: { closingBalance: number, notes?: string }): Promise<CashRegisterResponse> => {
  return apiClient.post<CashRegisterResponse>('/cash-registers/close', data);
};

export const createCashMovement = async (data: {
  amount: number;
  movementType: MovementType;
  description: string;
  notes?: string;
}): Promise<CashMovementResponse> => {
  const response = await apiClient.post<any>('/cash-registers/movements', data);
  return normalizeCashMovement(response);
};

export interface PaginatedMovementsResponse {
  movements: CashMovementResponse[];
  total: number;
}

export const getCashMovements = async (
  cashRegisterId: string,
  params: { page?: number; limit?: number },
): Promise<PaginatedMovementsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const data = await apiClient.get<any>(`/cash-registers/${cashRegisterId}/movements?${query.toString()}`);
  const movements = Array.isArray(data.movements) ? data.movements.map(normalizeCashMovement) : [];
  const total = typeof data.total === 'number' ? data.total : movements.length;
  return { movements, total };
};


// =============================================
// Settings / Users API
// =============================================

export type UserRole = 'Admin' | 'Gerente' | 'Garçom' | 'Cozinha' | 'Caixa';

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastLogin: string;
}

export interface InviteUserRequest {
    email: string;
    role: UserRole;
}

export const getUsers = async (): Promise<UserResponse[]> => {
    return apiClient.get<UserResponse[]>('/users');
};

export const inviteUser = async (data: InviteUserRequest): Promise<void> => {
    return apiClient.post<void>('/users/invite', data);
};


// Suppliers API
export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface SuppliersResponse {
  data: Supplier[];
  total: number;
}

export const getSuppliers = async (params: SupplierQueryParams = {}): Promise<SuppliersResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  const response = await api.get(`/suppliers?${queryParams.toString()}`);
  return response.data;
};

export const getSupplier = async (id: string): Promise<Supplier> => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (data: CreateSupplierRequest): Promise<Supplier> => {
  const response = await api.post('/suppliers', data);
  return response.data;
};

export const updateSupplier = async (id: string, data: UpdateSupplierRequest): Promise<Supplier> => {
  const response = await api.patch(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};

export const getActiveSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get('/suppliers/active');
  return response.data;
};

// =============================================
// Customers API
// =============================================

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: string;
  notes?: string;
  isActive: boolean;
  preferences?: {
    favoriteProducts?: string[];
    dietaryRestrictions?: string[];
    allergies?: string[];
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const getCustomers = async (): Promise<CustomerResponse[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<CustomerResponse>>('/customers');
    return Array.isArray(response.data) ? response.data : []; // Garante que sempre retorne um array
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

export const createCustomer = async (data: { 
  name: string; 
  email: string; 
  phone: string; 
  cpf: string; 
  address?: string; 
  city?: string; 
  state?: string; 
  zipCode?: string; 
  birthDate?: string; 
  notes?: string; 
  isActive: boolean; 
  preferences?: {
    favoriteProducts?: string[];
    dietaryRestrictions?: string[];
    allergies?: string[];
  };
}): Promise<CustomerResponse> => {
  try {
    return await apiClient.post<CustomerResponse>('/customers', data);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, data: { 
  name?: string; 
  email?: string; 
  phone?: string; 
  cpf?: string; 
  address?: string; 
  city?: string; 
  state?: string; 
  zipCode?: string; 
  birthDate?: string; 
  notes?: string; 
  isActive?: boolean; 
  preferences?: {
    favoriteProducts?: string[];
    dietaryRestrictions?: string[];
    allergies?: string[];
  };
}): Promise<CustomerResponse> => {
  try {
    return await apiClient.patch<CustomerResponse>(`/customers/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/customers/${id}`);
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    throw error;
  }
};

// Purchases API
export interface PurchaseItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  invoiceNumber?: string;
  notes?: string;
  freightCost: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseRequest {
  supplierId: string;
  purchaseDate: string;
  items: {
    ingredientId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }[];
  invoiceNumber?: string;
  notes?: string;
  freightCost?: number;
  taxAmount?: number;
}

export interface UpdatePurchaseRequest extends Partial<CreatePurchaseRequest> {}

export interface PurchaseQueryParams {
  page?: number;
  limit?: number;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface PurchasesResponse {
  data: Purchase[];
  total: number;
}

export const getPurchases = async (params: PurchaseQueryParams = {}): Promise<PurchasesResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  const response = await api.get(`/purchases?${queryParams.toString()}`);
  return response.data;
};

export const getPurchase = async (id: string): Promise<Purchase> => {
  const response = await api.get(`/purchases/${id}`);
  return response.data;
};

export const createPurchase = async (data: CreatePurchaseRequest): Promise<Purchase> => {
  const response = await api.post('/purchases', data);
  return response.data;
};

export const updatePurchase = async (id: string, data: UpdatePurchaseRequest): Promise<Purchase> => {
  const response = await api.patch(`/purchases/${id}`, data);
  return response.data;
};

export const deletePurchase = async (id: string): Promise<void> => {
  await api.delete(`/purchases/${id}`);
};

export const confirmPurchase = async (id: string): Promise<Purchase> => {
  const response = await api.post(`/purchases/${id}/confirm`);
  return response.data;
};

export const cancelPurchase = async (id: string): Promise<Purchase> => {
  const response = await api.post(`/purchases/${id}/cancel`);
  return response.data;
};


export default api;

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  image?: string;
  color?: string;
  sortOrder?: number; // opcional para compatibilidade
  order?: number; // compatedvel com backend que retorna `order`
  isActive: boolean;
  isFeatured: boolean; // Novo campo para categorias em destaque
  metadata?: any; // Novo campo para dados adicionais
  companyId: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export const getCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const data = await apiClient.get<any>('/categories');
    // Suporta tanto { categories: CategoryResponse[], total } quanto um array direto
    if (data && Array.isArray(data.categories)) {
      return data.categories as CategoryResponse[];
    }
    return Array.isArray(data) ? (data as CategoryResponse[]) : [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  image?: string;
  order?: number; // usar `order` conforme backend
  sortOrder?: number; // compatibilidade
  isActive: boolean;
  isFeatured?: boolean;
  metadata?: any;
}): Promise<CategoryResponse> => {
  try {
    return await apiClient.post<CategoryResponse>('/categories', data);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, data: {
  name?: string;
  description?: string;
  image?: string;
  order?: number;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: any;
}): Promise<CategoryResponse> => {
  try {
    return await apiClient.patch<CategoryResponse>(`/categories/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    throw error;
  }
};

// =============================================
// Products API (antigo Menu API)
// =============================================

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string; // Adicionado para facilitar exibição
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const getProducts = async (): Promise<ProductResponse[]> => {
  try {
    const data = await apiClient.get<any>('/products');
    let products: any[] = [];

    if (data && Array.isArray(data.products)) {
      products = data.products;
    } else if (Array.isArray(data?.data)) {
      products = data.data;
    } else if (Array.isArray(data)) {
      products = data;
    }

    return products.map((product) => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0),
      costPrice: typeof product.costPrice === 'string' ? parseFloat(product.costPrice) : (product.costPrice ?? undefined),
      preparationTime: typeof product.preparationTime === 'string' ? parseInt(product.preparationTime, 10) : product.preparationTime,
      stockQuantity: typeof product.stockQuantity === 'string' ? parseInt(product.stockQuantity, 10) : product.stockQuantity,
      minStockLevel: typeof product.minStockLevel === 'string' ? parseInt(product.minStockLevel, 10) : product.minStockLevel,
      maxStockLevel: typeof product.maxStockLevel === 'string' ? parseInt(product.maxStockLevel, 10) : product.maxStockLevel,
      imageUrl: product.imageUrl ?? product.mainImage ?? null,
    })) as ProductResponse[];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const createProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}): Promise<ProductResponse> => {
  try {
    const payload = {
      ...data,
      mainImage: data.imageUrl ?? undefined,
    };
    return await apiClient.post<ProductResponse>('/products', payload);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}): Promise<ProductResponse> => {
  try {
    const payload = {
      ...data,
      mainImage: data.imageUrl ?? undefined,
    };
    return await apiClient.patch<ProductResponse>(`/products/${id}`, payload);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    throw error;
  }
};

// =============================================
// Payments API
// =============================================

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const getPayments = async (): Promise<PaymentResponse[]> => {
  try {
    return await apiClient.get<PaymentResponse[]>('/payments');
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    throw error;
  }
};

export const createPayment = async (data: {
  orderId: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
}): Promise<PaymentResponse> => {
  try {
    return await apiClient.post<PaymentResponse>('/payments', data);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
};

export const updatePayment = async (id: string, data: {
  orderId?: string;
  amount?: number;
  method?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'TRANSFER';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  notes?: string;
}): Promise<PaymentResponse> => {
  try {
    return await apiClient.patch<PaymentResponse>(`/payments/${id}`, data);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    throw error;
  }
};

export const deletePayment = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/payments/${id}`);
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    throw error;
  }
};









