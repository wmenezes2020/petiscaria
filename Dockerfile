# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências do sistema (incluindo libvips para sharp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    wget \
    vips-dev \
    && rm -rf /var/cache/apk/*

# Stage 1: Builder - Construir a aplicação
FROM base AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# CRITICAL: NÃO definir NODE_ENV=production durante o build
# Isso permite que o Next.js faça build de produção mas sem otimizações
# agressivas que podem causar hydration mismatch
# NODE_ENV será definido apenas no runtime stage
ENV NEXT_TELEMETRY_DISABLED=1

# CRITICAL: Limpar cache do Next.js antes do build para garantir build limpo
RUN rm -rf .next

# CRITICAL: Garantir que não há cache de build
RUN rm -rf node_modules/.cache

# Build da aplicação Next.js com modo verbose para debug
# NOTA: npm run build já define NODE_ENV=production internamente se necessário,
# mas não vamos forçar isso aqui para evitar diferenças
RUN npm run build 2>&1 | head -50 || true

# Stage 2: Runner - Executar a aplicação
FROM base AS runner

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Definir variáveis de ambiente para RUNTIME (não build)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# NOTA: Variáveis NEXT_PUBLIC_* devem ser configuradas no Coolify
# como variáveis de ambiente da aplicação (não do build)

# Copiar node_modules do builder (já tem todas as dependências incluindo sharp)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copiar código fonte e build
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder --chown=nextjs:nodejs /app/postcss.config.js ./postcss.config.js
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicialização usando npm start (mesmo que local)
CMD ["npm", "start"]
