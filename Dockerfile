# Build stage
FROM node:20-slim AS builder

# Install pnpm and other build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ && \
    npm install -g pnpm@9.15.1 vite && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage cache
COPY package.json pnpm-lock.yaml ./
COPY web/package.json web/pnpm-lock.yaml ./web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY tsconfig.json ./
COPY src ./src
COPY characters ./characters
COPY web ./web

# Build backend
RUN pnpm build

# Build frontend
WORKDIR /app/web
RUN pnpm install --frozen-lockfile
RUN vite build

# Production stage
FROM node:20-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 && \
    npm install -g pnpm@9.15.1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create app user
RUN groupadd -r appuser && \
    useradd -r -g appuser -s /bin/bash appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

# Copy built artifacts
COPY --from=builder --chown=appuser:appuser /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/web/dist ./web/dist
COPY --from=builder --chown=appuser:appuser /app/characters ./characters
COPY docker-entrypoint.sh ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose ports
EXPOSE 3000 4173

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set entrypoint
ENTRYPOINT ["sh", "docker-entrypoint.sh"]