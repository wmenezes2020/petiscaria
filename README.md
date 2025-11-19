# Petiscaria da Thay - Frontend

Sistema de gestão para petiscarias, bares e restaurantes desenvolvido com Next.js 14.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI
- **Zustand** - Gerenciamento de estado
- **React Query** - Sincronização com servidor
- **Socket.io** - Comunicação em tempo real
- **Recharts** - Gráficos e visualizações
- **PWA** - Progressive Web App

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start
```

## 📁 Estrutura

```
src/
├── app/              # App Router (Next.js 14)
│   ├── app/         # Páginas protegidas
│   ├── login/       # Autenticação
│   └── layout.tsx   # Layout raiz
├── components/       # Componentes React
│   ├── ui/          # Componentes base (shadcn/ui)
│   └── layout/      # Componentes de layout
├── hooks/           # Custom hooks
├── lib/             # Utilitários e configurações
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── providers/       # Context providers
```

## 🔐 Autenticação

O sistema usa autenticação baseada em cookies httpOnly. O middleware protege rotas automaticamente.

## 📱 PWA

O aplicativo é uma Progressive Web App (PWA) que pode ser instalado em dispositivos móveis.

## 🔄 Tempo Real

WebSocket é usado para atualizações em tempo real de:
- Pedidos (KDS)
- Mesas
- Pagamentos PIX

## 📄 Licença

Proprietário - Petiscaria da Thay


