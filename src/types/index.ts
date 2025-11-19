// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  tenantId: string;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
  companyId?: string;
  twoFactorCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

// Orders
export interface Order {
  id: string;
  orderNumber?: string;
  tableId?: string;
  table?: Table;
  customerId?: string;
  customer?: Customer;
  status: OrderStatus;
  channel: 'mesa' | 'balcao' | 'delivery' | 'retirada';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  orderItems: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'open'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
  notes?: string;
  isReady: boolean;
  preparationTime?: number;
  createdAt: string;
}

// Tables
export interface Table {
  id: string;
  number: string;
  areaId?: string;
  area?: Area;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Area {
  id: string;
  name: string;
  locationId: string;
  description?: string;
}

// Products & Menu
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotionalPrice?: number;
  categoryId?: string;
  category?: Category;
  type: 'food' | 'drink' | 'dessert' | 'side_dish' | 'combo';
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  image?: string;
  images?: string[];
  sku?: string;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

// Customers
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  type: 'individual' | 'corporate' | 'vip';
  status: 'active' | 'inactive' | 'blocked';
  totalSpent: number;
  totalOrders: number;
  createdAt: string;
}

// Payments
export interface Payment {
  id: string;
  orderId: string;
  method: 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  pixTransactionId?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  createdAt: string;
}

// Stock
export interface StockMovement {
  id: string;
  productId?: string;
  ingredientId?: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'loss' | 'return';
  reason: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  categoryId?: string;
  isActive: boolean;
}

// Cash Register
export interface CashRegister {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  openedById: string;
  closedById?: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  movementType: 'opening' | 'closing' | 'sale' | 'refund' | 'withdrawal' | 'deposit' | 'expense' | 'adjustment';
  amount: number;
  description?: string;
  createdAt: string;
}

// Reports
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  averageTicket: number;
  activeTables: number;
  preparingOrders: number;
  lowStockAlerts: number;
}

export interface SalesReport {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  byCategory: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
  byHour: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
}

// KDS
export interface KdsTicket {
  id: string;
  orderId: string;
  orderItemId: string;
  stationId: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}


