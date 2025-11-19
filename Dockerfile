#
# Multistage Dockerfile optimised for production deployments of the Next.js frontend
#
# Usage:
#   docker build -t petiscaria-frontend .
#   docker run -p 3000:3000 petiscaria-frontend
#

ARG NODE_VERSION=20.11.1

# ------------------------------------------------------------
# Base stage – common configuration
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# ------------------------------------------------------------
# Dependencies stage – install all deps (including dev)
# ------------------------------------------------------------
FROM base AS deps

# Install OS packages required for sharp/canvas and friends (if added later)
RUN apk add --no-cache libc6-compat

COPY package*.json ./

# Use npm ci for reproducible installs
RUN npm ci --include=dev

# ------------------------------------------------------------
# Builder stage – compile Next.js app
# ------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ------------------------------------------------------------
# Runner stage – run only the production build
# ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nextjs -G nodejs

# Copy only the necessary output artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

