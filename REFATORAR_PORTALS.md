# Lista de Componentes que Precisam Refatoração

## Componentes já refatorados:
- ✅ `src/components/settings/ProductsManagement.tsx`
- ✅ `src/components/settings/OrdersManagement.tsx`
- ✅ `src/components/orders/CreateOrderForm.tsx`

## Componentes que ainda precisam ser refatorados:
- ⚠️ `src/components/settings/PaymentsManagement.tsx`
- ⚠️ `src/components/orders/OrderDetailsModal.tsx`
- ⚠️ `src/components/settings/InventoryManagement.tsx`
- ⚠️ `src/components/settings/TablesManagement.tsx`
- ⚠️ `src/components/stock/IngredientFormModal.tsx`
- ⚠️ `src/components/stock/QuickAdjustModal.tsx`
- ⚠️ `src/components/settings/CategoriesManagement.tsx`
- ⚠️ `src/components/financial/ClosedCashRegister.tsx`
- ⚠️ `src/components/financial/AddMovementForm.tsx`
- ⚠️ `src/components/tables/TableFormModal.tsx`
- ⚠️ `src/components/suppliers/SupplierForm.tsx`
- ⚠️ `src/components/purchases/PurchaseForm.tsx`
- ⚠️ `src/components/menu/ProductForm.tsx`
- ⚠️ `src/components/settings/LocationsManagement.tsx`
- ⚠️ `src/components/settings/UsersManagement.tsx`
- ⚠️ `src/components/settings/CustomersManagement.tsx`
- ⚠️ `src/components/settings/AreasManagement.tsx`

## Padrão de Refatoração:

1. Substituir import:
   ```typescript
   // ANTES
   import { createPortal } from 'react-dom';
   
   // DEPOIS
   import { Portal } from '@/components/PortalRoot';
   ```

2. Substituir uso:
   ```typescript
   // ANTES
   {mounted && isFormOpen && createPortal(
     <div>...</div>,
     document.body
   )}
   
   // DEPOIS
   {mounted && isFormOpen && (
     <Portal>
       <div>...</div>
     </Portal>
   )}
   ```

