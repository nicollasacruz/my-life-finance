# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages needed
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# Deploy to production folder with isolated dependencies
WORKDIR /app
RUN pnpm deploy --filter=@my-life-finance/api --prod /prod/api

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy deployed app from builder
COPY --from=builder /prod/api ./
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma

# Set environment
ENV NODE_ENV=production

EXPOSE 4321

# Install Prisma CLI for migrations
RUN npm install -g prisma@5.22.0

# Generate Prisma client in production folder
RUN prisma generate

# Run migrations and start
CMD ["sh", "-c", "prisma migrate deploy && node dist/main"]
