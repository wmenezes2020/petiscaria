// CRITICAL: Página que renderiza exatamente o mesmo HTML no servidor e cliente
// Isso previne completamente hydration mismatch
'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Marcar como montado apenas após hidratação
    // Usar requestIdleCallback para garantir que passamos pela hidratação
    if (typeof window === 'undefined') return;

    // Aguardar que o React complete a hidratação inicial
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // CRITICAL: Renderizar HTML IDÊNTICO no servidor e cliente
  // O estado 'mounted' só muda após hidratação, então o HTML inicial é sempre o mesmo
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #fff7ed, #ffffff, #fff7ed)',
      padding: '16px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        {!mounted ? (
          <>
            <div 
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #fed7aa',
                borderTop: '4px solid #ea580c',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            />
            <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' }} />
            <p style={{ fontSize: '20px', color: '#4b5563' }}>Carregando...</p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              Petiscaria da Thay
            </h1>
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '32px' }}>
              Sistema de gestão para petiscarias
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/login"
                style={{
                  backgroundColor: '#ea580c',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2410c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              >
                Entrar
              </a>
              <a
                href="/register"
                style={{
                  border: '2px solid #ea580c',
                  color: '#ea580c',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ea580c';
                }}
              >
                Criar Conta
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
