# ============================================================================
# 🚀 DOCKERFILE OTIMIZADO - PETISCARIA DA THAY (Next.js)
# ============================================================================
# Production Build - Corrigido para evitar hydration mismatch
# ============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Instalar dependências do sistema (incluindo libvips para sharp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    wget \
    vips-dev \
    libc6-compat \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --prefer-offline --no-audit --progress=false

# ============================================================================
# Stage 2: Builder
# ============================================================================
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++ vips-dev libc6-compat

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# ✅ CRITICAL: Accept build args and convert to env vars
# Next.js needs NEXT_PUBLIC_* at BUILD TIME to embed in client code
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

# CRITICAL: NÃO definir NODE_ENV=production durante o build
# Isso causa hydration mismatch porque o Next.js otimiza diferente
ENV NEXT_TELEMETRY_DISABLED=1
# NODE_ENV será definido apenas no runtime stage

# CRITICAL: Limpar cache antes do build
RUN rm -rf .next node_modules/.cache

# Build the application with embedded env vars
RUN npm run build && \
    echo "✅ Build concluído com sucesso" && \
    echo "🔍 Verificando arquivos gerados:" && \
    ls -la .next/ | head -20

# ============================================================================
# Stage 3: Runner (Production)
# ============================================================================
FROM node:18-alpine AS runner

WORKDIR /app

# Instalar dependências do sistema necessárias para runtime
RUN apk add --no-cache curl

# CRITICAL: NODE_ENV=production apenas no RUNTIME, não durante build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder --chown=nextjs:nodejs /app/postcss.config.js ./postcss.config.js
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Copy node_modules (production only)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built files (NÃO usar standalone - usar padrão do Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ✅ RUNTIME: Env vars (para server-side, client já tem embedded durante build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ✅ HEALTHCHECK: Verificar se aplicação está respondendo
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# CRITICAL: Usar npm start (padrão do Next.js) ao invés de node server.js
# Isso funciona igual ao build local
CMD ["npm", "start"]
