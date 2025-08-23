
import { getIngredients, IngredientResponse } from '@/lib/api';
import { StockTable } from '@/components/stock/StockTable';
import { PlusCircle, ShoppingCart, Sliders } from 'lucide-react';

export default async function EstoquePage() {
  let ingredients: IngredientResponse[] = [];
  let error = null;

  try {
    ingredients = await getIngredients();
  } catch (e) {
    console.error('Failed to fetch ingredients:', e);
    error = 'Não foi possível carregar os insumos do estoque.';
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Controle de Estoque</h1>
        <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <Sliders size={18} className="mr-2"/>
                Ajuste Rápido
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <ShoppingCart size={18} className="mr-2"/>
                Registrar Compra
            </button>
            <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <PlusCircle size={18} className="mr-2"/>
                Adicionar Insumo
            </button>
        </div>
      </div>

      {/* Stock Table */}
      <StockTable initialIngredients={ingredients} />
    </div>
  );
}
