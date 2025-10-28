import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AreasManagement } from '../components/settings/AreasManagement';
import { CategoriesManagement } from '../components/settings/CategoriesManagement';
import { ProductsManagement } from '../components/settings/ProductsManagement';
import { TablesManagement } from '../components/settings/TablesManagement';
import { CustomersManagement } from '../components/settings/CustomersManagement';
import { OrdersManagement } from '../components/settings/OrdersManagement';
import { PaymentsManagement } from '../components/settings/PaymentsManagement';
import { InventoryManagement } from '../components/settings/InventoryManagement';
import { ReportsPanel } from '../components/reports/ReportsPanel';

// Mock API functions
jest.mock('../lib/api', () => ({
  getAreas: jest.fn(),
  createArea: jest.fn(),
  updateArea: jest.fn(),
  deleteArea: jest.fn(),
  getLocations: jest.fn(),
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getTables: jest.fn(),
  createTable: jest.fn(),
  updateTable: jest.fn(),
  deleteTable: jest.fn(),
  getCustomers: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
  getOrders: jest.fn(),
  createOrder: jest.fn(),
  updateOrder: jest.fn(),
  deleteOrder: jest.fn(),
  getPayments: jest.fn(),
  createPayment: jest.fn(),
  updatePayment: jest.fn(),
  deletePayment: jest.fn(),
  getIngredients: jest.fn(),
  createIngredient: jest.fn(),
  updateIngredient: jest.fn(),
  deleteIngredient: jest.fn(),
}));

describe('Areas Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render areas management component', () => {
    render(<AreasManagement />);
    expect(screen.getByText('Gerenciamento de Áreas')).toBeInTheDocument();
  });

  it('should show add area button', () => {
    render(<AreasManagement />);
    expect(screen.getByText('Adicionar Área')).toBeInTheDocument();
  });

  it('should open add area form when button is clicked', () => {
    render(<AreasManagement />);
    const addButton = screen.getByText('Adicionar Área');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Nova Área')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
  });
});

describe('Categories Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render categories management component', () => {
    render(<CategoriesManagement />);
    expect(screen.getByText('Gerenciamento de Categorias')).toBeInTheDocument();
  });

  it('should show add category button', () => {
    render(<CategoriesManagement />);
    expect(screen.getByText('Adicionar Categoria')).toBeInTheDocument();
  });

  it('should open add category form when button is clicked', () => {
    render(<CategoriesManagement />);
    const addButton = screen.getByText('Adicionar Categoria');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
  });
});

describe('Products Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render products management component', () => {
    render(<ProductsManagement />);
    expect(screen.getByText('Gerenciamento de Produtos')).toBeInTheDocument();
  });

  it('should show add product button', () => {
    render(<ProductsManagement />);
    expect(screen.getByText('Adicionar Produto')).toBeInTheDocument();
  });

  it('should open add product form when button is clicked', () => {
    render(<ProductsManagement />);
    const addButton = screen.getByText('Adicionar Produto');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Novo Produto')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço')).toBeInTheDocument();
  });
});

describe('Tables Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tables management component', () => {
    render(<TablesManagement />);
    expect(screen.getByText('Gerenciamento de Mesas')).toBeInTheDocument();
  });

  it('should show add table button', () => {
    render(<TablesManagement />);
    expect(screen.getByText('Adicionar Mesa')).toBeInTheDocument();
  });

  it('should open add table form when button is clicked', () => {
    render(<TablesManagement />);
    const addButton = screen.getByText('Adicionar Mesa');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Nova Mesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Capacidade')).toBeInTheDocument();
  });
});

describe('Customers Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render customers management component', () => {
    render(<CustomersManagement />);
    expect(screen.getByText('Gerenciamento de Clientes')).toBeInTheDocument();
  });

  it('should show add customer button', () => {
    render(<CustomersManagement />);
    expect(screen.getByText('Adicionar Cliente')).toBeInTheDocument();
  });

  it('should open add customer form when button is clicked', () => {
    render(<CustomersManagement />);
    const addButton = screen.getByText('Adicionar Cliente');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});

describe('Orders Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render orders management component', () => {
    render(<OrdersManagement />);
    expect(screen.getByText('Gerenciamento de Pedidos')).toBeInTheDocument();
  });

  it('should show add order button', () => {
    render(<OrdersManagement />);
    expect(screen.getByText('Adicionar Pedido')).toBeInTheDocument();
  });

  it('should open add order form when button is clicked', () => {
    render(<OrdersManagement />);
    const addButton = screen.getByText('Adicionar Pedido');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Novo Pedido')).toBeInTheDocument();
    expect(screen.getByLabelText('Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Mesa')).toBeInTheDocument();
  });
});

describe('Payments Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render payments management component', () => {
    render(<PaymentsManagement />);
    expect(screen.getByText('Gerenciamento de Pagamentos')).toBeInTheDocument();
  });

  it('should show add payment button', () => {
    render(<PaymentsManagement />);
    expect(screen.getByText('Adicionar Pagamento')).toBeInTheDocument();
  });

  it('should open add payment form when button is clicked', () => {
    render(<PaymentsManagement />);
    const addButton = screen.getByText('Adicionar Pagamento');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Novo Pagamento')).toBeInTheDocument();
    expect(screen.getByLabelText('Pedido')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toBeInTheDocument();
  });
});

describe('Inventory Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render inventory management component', () => {
    render(<InventoryManagement />);
    expect(screen.getByText('Gerenciamento de Estoque')).toBeInTheDocument();
  });

  it('should show add ingredient button', () => {
    render(<InventoryManagement />);
    expect(screen.getByText('Adicionar Ingrediente')).toBeInTheDocument();
  });

  it('should open add ingredient form when button is clicked', () => {
    render(<InventoryManagement />);
    const addButton = screen.getByText('Adicionar Ingrediente');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Novo Ingrediente')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Unidade')).toBeInTheDocument();
  });
});

describe('Reports Panel Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reports panel component', () => {
    render(<ReportsPanel />);
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('should show sales report section', () => {
    render(<ReportsPanel />);
    expect(screen.getByText('Relatório de Vendas')).toBeInTheDocument();
  });

  it('should show inventory report section', () => {
    render(<ReportsPanel />);
    expect(screen.getByText('Relatório de Estoque')).toBeInTheDocument();
  });
});

