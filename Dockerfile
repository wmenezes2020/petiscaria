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

# Definir NODE_ENV para produção durante o build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build da aplicação Next.js (mesmo processo que local)
RUN npm run build

# Stage 2: Runner - Executar a aplicação
FROM base AS runner

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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
