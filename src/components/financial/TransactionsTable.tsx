
'use client';

import { useState } from 'react';
import { TransactionResponse } from '@/lib/api';
import { TransactionTypeBadge } from './TransactionTypeBadge';

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
    <div className="bg-white rounded-lg shadow-sm mt-8">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Descrição</th>
                <th scope="col" className="px-6 py-3">Categoria</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3 text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{formatDate(item.date)}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                        {item.description}
                    </th>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">
                        <TransactionTypeBadge type={item.type} />
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${item.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'SAIDA' && '-'}{formatCurrency(item.amount)}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
}
