# Base stage: Install dependencies
FROM node:23.3.0-slim AS base

# Install pnpm, vite and pm2 globally
RUN npm install -g pnpm@9.15.4 vite pm2

# Install build dependencies
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy backend dependencies separately to optimize caching
COPY package.json pnpm-lock.yaml ./

# Install backend dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /app/web

# Copy frontend dependencies separately for caching
COPY ./web/package.json ./web/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile


# Builder stage: Build backend
FROM base AS backend-builder

WORKDIR /app

# Copy source code
COPY tsconfig.json ./
COPY ./src ./src
COPY ./characters ./characters

# Build backend
RUN pnpm build


# Frontend stage: Build frontend
FROM base AS frontend-builder

WORKDIR /app/web

# Copy frontend source code
COPY ./web ./

# Build frontend
RUN vite build


# Final stage: Production image
FROM base AS final

# Set the working directory
WORKDIR /app

# Copy built backend
COPY --from=backend-builder /app ./

# Copy built frontend
COPY --from=frontend-builder /app/web/ ./web/

# Copy entrypoint script
COPY ./docker-entrypoint.sh ./

# Set permissions
RUN chown -R node:node /app && chmod -R 755 /app

# Switch to non-root user for security
USER node

# Expose ports
EXPOSE 3000 4173