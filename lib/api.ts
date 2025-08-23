import axios from 'axios';

// Configuração base da API
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
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
          if (authData.state?.accessToken) {
            config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
          }
        } catch (error) {
          console.error('Erro ao parsear dados de autenticação:', error);
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
          if (authData.state?.refreshToken) {
            const response = await api.post('/auth/refresh', {
              refreshToken: authData.state.refreshToken,
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

// Funções auxiliares para diferentes tipos de requisições
export const apiClient = {
  // GET
  get: <T>(url: string, config?: any) => 
    api.get<T>(url, config).then(response => response.data),

  // POST
  post: <T>(url: string, data?: any, config?: any) => 
    api.post<T>(url, data, config).then(response => response.data),

  // PUT
  put: <T>(url: string, data?: any, config?: any) => 
    api.put<T>(url, data, config).then(response => response.data),

  // PATCH
  patch: <T>(url: string, data?: any, config?: any) => 
    api.patch<T>(url, data, config).then(response => response.data),

  // DELETE
  delete: <T>(url: string, config?: any) => 
    api.delete<T>(url, config).then(response => response.data),
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

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Executa as chamadas em paralelo para maior eficiência
  const [orderStats, tableStats] = await Promise.all([
    apiClient.get<OrderStats>('/orders/stats/summary'),
    apiClient.get<TableStats>('/tables/stats'),
  ]);

  return {
    orderStats,
    tableStats,
  };
};



// =============================================
// Tables API
// =============================================

import { TableStatus } from '@/components/tables/TableStatusBadge';

export interface TableResponse {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  area: {
    id: string;
    name: string;
  };
}

export const getTables = async (area?: string): Promise<TableResponse[]> => {
  const params = new URLSearchParams();
  if (area) {
    params.append('area', area);
  }
  
  const response = await apiClient.get<{ tables: TableResponse[]; total: number }>(
    `/tables?${params.toString()}`
  );
  return response.tables;
};



// =============================================
// Orders API
// =============================================

import { OrderStatus } from '@/components/orders/OrderStatusBadge';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
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

export const getOrders = async (params: GetOrdersParams = {}): Promise<PaginatedOrdersResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.status) query.append('status', params.status);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const response = await apiClient.get<PaginatedOrdersResponse>(
    `/orders?${query.toString()}`
  );
  return response;
};

export const createOrder = async (orderData: any): Promise<OrderResponse> => {
  return apiClient.post<OrderResponse>('/orders', orderData);
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



// =============================================
// Menu API
// =============================================

export interface CategoryResponse {
    id: string;
    name: string;
}

export interface MenuItemResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    category: CategoryResponse;
    active: boolean;
}

export const getMenuItems = async (): Promise<MenuItemResponse[]> => {
    // Assuming the planning document's endpoint `/menu/items`
    // In a real scenario, this might be paginated.
    return apiClient.get<MenuItemResponse[]>('/products'); // Corrected based on likely backend module name
};

export const createMenuItem = async (data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    return apiClient.post<MenuItemResponse>('/products', data);
};

export const updateMenuItem = async (id: string, data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    return apiClient.patch<MenuItemResponse>(`/products/${id}`, data);
};

export const getCategories = async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<{ categories: CategoryResponse[] }>('/categories');
    return response.categories;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/products/${id}`);
};



// =============================================
// Stock API
// =============================================

export interface IngredientResponse {
    id: string;
    name: string;
    quantity: number;
    unit: string; // e.g., 'kg', 'L', 'un'
    lowStockThreshold: number;
    criticalStockThreshold: number;
}

export const getIngredients = async (): Promise<IngredientResponse[]> => {
    // Based on the backend module, the endpoint is likely /ingredients or /stock
    return apiClient.get<IngredientResponse[]>('/ingredients');
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
  if (params.limit) query.append('limit', params.limit.toString());

  return apiClient.get<TopSellingProductResponse[]>(`/reports/top-selling-products?${query.toString()}`);
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
  movementType: MovementType;
  amount: number;
  description: string;
  notes?: string;
  createdAt: string;
  user?: {
    name: string;
  }
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

export const getCurrentCashRegister = async (): Promise<CashRegisterResponse> => {
  return apiClient.get<CashRegisterResponse>('/cash-registers/current');
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
  return apiClient.post<CashMovementResponse>('/cash-registers/movements', data);
};

export interface PaginatedMovementsResponse {
  movements: CashMovementResponse[];
  total: number;
}

export const getCashMovements = async (
  cashRegisterId: string, 
  params: { page?: number, limit?: number }
): Promise<PaginatedMovementsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  
  return apiClient.get<PaginatedMovementsResponse>(`/cash-registers/${cashRegisterId}/movements?${query.toString()}`);
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









