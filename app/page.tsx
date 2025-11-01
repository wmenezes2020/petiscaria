'use client';

import { useEffect, useState } from 'react';

// CRITICAL: Renderização puramente client-side para evitar hydration mismatch
// Esta página NÃO renderiza nada no servidor
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garantir que só renderiza após montagem no cliente
    setMounted(true);
  }, []);

  // NUNCA renderizar no servidor - retornar null durante SSR
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Petiscaria da Thay
        </h1>
        <p className="text-xl text-gray-600">
          Se você vê esta mensagem, a renderização client-side funciona.
        </p>
      </div>
    </div>
  );
}
