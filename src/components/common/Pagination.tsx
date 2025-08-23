'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(total / limit);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-700">
                Página {page} de {totalPages}
            </span>
            <div className="inline-flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPreviousPage}
                    className="p-2 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage}
                    className="p-2 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
