# Base stage: Install dependencies
FROM node:23.3.0-slim AS base

# Install pnpm globally
RUN npm install -g pnpm@9.15.4

# Install build dependencies
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy package manager files separately to optimize caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
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

# Copy frontend dependencies separately for caching
COPY ./web/package.json ./web/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install Vite globally
RUN npm install -g vite

# Copy frontend source code
COPY ./web ./

# Build frontend
RUN vite build


# Final stage: Production image
FROM node:23.3.0-slim AS final

# Set the working directory
WORKDIR /app

# Copy runtime dependencies from the base image to reduce final image size
COPY --from=base /usr/local/bin/pnpm /usr/local/bin/pnpm
COPY --from=base /usr/lib/node_modules /usr/lib/node_modules

# Copy built backend
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend
COPY --from=frontend-builder /app/web/dist ./web/dist

# Copy entrypoint script
COPY ./docker-entrypoint.sh ./

# Set permissions
RUN chown -R node:node /app && chmod -R 755 /app

# Switch to non-root user for security
USER node

# Expose ports
EXPOSE 3000 4173