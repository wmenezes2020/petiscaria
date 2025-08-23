# Sistema de Gestão para Petiscarias - Petiscaria da Thay

Sistema completo de gestão para petiscarias, bares, restaurantes e eventos noturnos, desenvolvido com Next.js e NestJS.

## 🚀 Status do Projeto

### ✅ Fase 1 - MVP (Concluído)
- ✅ Landing page moderna e elegante
- ✅ Sistema de autenticação (login/logout)
- ✅ Dashboard principal com métricas
- ✅ Gestão de pedidos
- ✅ Sistema KDS (Kitchen Display System)
- ✅ Cardápio e produtos
- ✅ Gestão de clientes
- ✅ Relatórios e analytics
- ✅ Configurações e perfil

### 🔄 Fase 2 - Funcionalidades Core (Em Desenvolvimento)
- 🔄 Backend NestJS com APIs RESTful
- 🔄 Autenticação JWT e sistema de usuários
- 🔄 Integração com MySQL via TypeORM
- 🔄 Estrutura de entidades (Company, User, Product, Category)
- 🔄 Sistema de autenticação completo
- ⏳ Comanda digital mobile
- ⏳ Integração OpenPIX
- ⏳ Gestão de mesas
- ⏳ Controle de estoque

### ⏳ Fase 3 - Analytics e Relatórios
- ⏳ Relatórios avançados
- ⏳ Dashboards analíticos
- ⏳ Métricas de performance
- ⏳ Exportação de dados

### ⏳ Fase 4 - Integrações Avançadas
- ⏳ Impressoras fiscais
- ⏳ Sistemas de delivery
- ⏳ Integração com iFood/Rappi
- ⏳ API para terceiros

## 🏗️ Arquitetura

### Frontend (Next.js 14)
- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Ícones**: Heroicons
- **Notificações**: React Hot Toast

### Backend (NestJS)
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL 8 + TypeORM
- **Cache**: Redis
- **Autenticação**: JWT + Passport
- **Validação**: Class Validator + Class Transformer
- **Documentação**: Swagger/OpenAPI
- **Segurança**: Helmet, CORS, Rate Limiting

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Banco de Dados**: MySQL 8
- **Cache**: Redis
- **Monitoramento**: phpMyAdmin, Redis Commander

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd petiscaria-da-thay/Aplicacoes
```

### 2. Configure as variáveis de ambiente
```bash
# Backend
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações
```

### 3. Execute com Docker Compose
```bash
docker-compose up -d
```

### 4. Acesse as aplicações
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Documentação API**: http://localhost:3001/api/docs
- **phpMyAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

### Desenvolvimento Local

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

## 📁 Estrutura do Projeto

```
Aplicacoes/
├── frontend/                 # Frontend Next.js
│   ├── app/                 # App Router
│   ├── components/          # Componentes reutilizáveis
│   ├── lib/                 # Utilitários e configurações
│   └── public/              # Arquivos estáticos
├── backend/                  # Backend NestJS
│   ├── src/
│   │   ├── config/          # Configurações
│   │   ├── entities/        # Entidades TypeORM
│   │   ├── modules/         # Módulos da aplicação
│   │   └── main.ts          # Ponto de entrada
│   ├── database/            # Scripts SQL
│   └── uploads/             # Uploads de arquivos
├── docker-compose.yml       # Configuração Docker
└── README.md               # Este arquivo
```

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Login**: `/api/v1/auth/login`
- **Refresh Token**: `/api/v1/auth/refresh`
- **Perfil**: `/api/v1/auth/profile`
- **Logout**: `/api/v1/auth/logout`

### Estrutura do Token
```json
{
  "sub": "user-id",
  "email": "user@email.com",
  "role": "admin",
  "companyId": "company-uuid",
  "permissions": {
    "canManageUsers": true,
    "canManageProducts": true,
    "canManageOrders": true
  }
}
```

## 🗄️ Banco de Dados

### Tabelas Principais
- `cliente_petiscaria_companies` - Empresas/estabelecimentos
- `cliente_petiscaria_users` - Usuários do sistema
- `cliente_petiscaria_categories` - Categorias de produtos
- `cliente_petiscaria_products` - Produtos do cardápio

### Prefixo das Tabelas
Todas as tabelas seguem o padrão: `cliente_petiscaria_{nome}`

## 🔧 Desenvolvimento

### Scripts Disponíveis

#### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
```

#### Backend
```bash
npm run start:dev    # Desenvolvimento com hot reload
npm run build        # Build de produção
npm run start:prod   # Iniciar produção
npm run test         # Executar testes
npm run migration:generate  # Gerar migração
npm run migration:run       # Executar migrações
```

### Padrões de Código
- **Clean Code**: Código limpo e legível
- **SOLID**: Princípios de design orientado a objetos
- **DDD**: Domain-Driven Design
- **Clean Architecture**: Arquitetura limpa e modular

## 📱 Funcionalidades

### Dashboard
- Métricas em tempo real
- Gráficos interativos
- Ações rápidas
- Visão geral do negócio

### Gestão de Pedidos
- Criação de pedidos
- Acompanhamento de status
- Histórico completo
- Filtros e busca

### Sistema KDS
- Interface para cozinha
- Pedidos em tempo real
- Priorização de pedidos
- Controle de status

### Cardápio
- Gestão de produtos
- Categorias organizadas
- Imagens e descrições
- Controle de estoque

### Clientes
- Cadastro completo
- Histórico de pedidos
- Preferências
- Segmentação

### Relatórios
- Vendas por período
- Produtos mais vendidos
- Performance da equipe
- Análise de tendências

## 🔒 Segurança

- **JWT**: Autenticação segura
- **Rate Limiting**: Proteção contra ataques
- **CORS**: Configuração segura
- **Helmet**: Headers de segurança
- **Validação**: Validação de entrada
- **Criptografia**: Senhas hasheadas com bcrypt

## 🌐 API REST

### Endpoints Principais
- **Auth**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Companies**: `/api/v1/companies/*`
- **Products**: `/api/v1/products/*`
- **Categories**: `/api/v1/categories/*`
- **Orders**: `/api/v1/orders/*`

### Documentação
Acesse `/api/docs` para documentação interativa da API (Swagger/OpenAPI).

## 🚀 Deploy

### Produção
```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Executar em produção
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente de Produção
- `NODE_ENV=production`
- `DB_SYNCHRONIZE=false`
- `DB_LOGGING=false`
- Configurações de SSL para banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- **Email**: suporte@petiscariadathay.com
- **Telefone**: (XX) XXXX-XXXX
- **Documentação**: Consulte este README e a documentação da API

---

**Desenvolvido com ❤️ para a Petiscaria da Thay**
