
'use client';

import { useState } from 'react';
import { TransactionResponse } from '@/lib/api';
import { TransactionTypeBadge } from './TransactionTypeBadge';
import { FileText } from 'lucide-react';

interface TransactionsTableProps {
  initialTransactions: TransactionResponse[];
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState(initialTransactions);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-8">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs font-semibold uppercase text-gray-600 tracking-wider bg-gray-100/50 rounded-t-2xl">
                <tr>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Descrição</th>
                <th scope="col" className="px-6 py-3">Categoria</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3 text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {transactions.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                                <FileText className="h-12 w-12 mb-4 text-gray-300" />
                                <p className="text-lg font-semibold mb-2">Nenhuma transação encontrada</p>
                                <p className="text-sm text-center">Parece que não há registros de transações financeiras para exibir.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    transactions.map((item) => (
                    <tr key={item.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 last:border-b-0">
                        <td className="px-6 py-4 text-gray-600">{formatDate(item.date)}</td>
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                            {item.description}
                        </th>
                        <td className="px-6 py-4 text-gray-700">{item.category}</td>
                        <td className="px-6 py-4">
                            <TransactionTypeBadge type={item.type} />
                        </td>
                        <td className={`px-6 py-4 text-right font-bold text-base ${item.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.type === 'SAIDA' && '-'}{formatCurrency(item.amount)}
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
    </div>
  );
}
