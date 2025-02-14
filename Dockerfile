# Base stage for Node.js dependencies
FROM node:23.3.0-slim AS base

# Install pnpm and pm2 globally
RUN npm install -g pnpm@9.15.4 pm2

# Install build dependencies
RUN apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python


# Backend base stage
FROM base AS backend-base

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Backend builder stage
FROM backend-base AS backend-builder

# Copy source code
COPY tsconfig.json ./
COPY ./src ./src
COPY ./characters ./characters

# Build backend
RUN pnpm build

# Backend final stage
FROM backend-base AS backend-final

# Copy both built files and source files
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/src ./src
COPY --from=backend-builder /app/characters ./characters
COPY tsconfig.json ./

# Set permissions
RUN chown -R node:node /app && chmod -R 755 /app

# Switch to non-root user
USER node

# Expose backend port
EXPOSE 3000

CMD ["pm2-runtime", "start", "pnpm", "--name", "app", "--", "start"]


# Frontend base stage
FROM base AS frontend-base

WORKDIR /app/web

# Install vite globally
RUN npm install -g vite

# Copy frontend dependencies
COPY ./web/package.json ./web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Frontend builder stage
FROM frontend-base AS frontend-builder

# Copy frontend source code
COPY ./web ./

# Add ARG statements
ARG NODE_ENV
ARG DAIANA_SERVER_PORT
ARG WEB_SERVER_PORT
ARG DAIANA_URL
ARG WEB_URL
ARG ALLOWED_HOSTS
ARG CORS_ORIGIN

# Build frontend
RUN NODE_ENV=${NODE_ENV} \
    DAIANA_SERVER_PORT=${DAIANA_SERVER_PORT} \
    WEB_SERVER_PORT=${WEB_SERVER_PORT} \
    DAIANA_URL=${DAIANA_URL} \
    WEB_URL=${WEB_URL} \
    ALLOWED_HOSTS=${ALLOWED_HOSTS} \
    CORS_ORIGIN=${CORS_ORIGIN} \
    vite build

# Frontend final stage
FROM frontend-base AS frontend-final

# Copy built frontend
COPY --from=frontend-builder /app/web/dist ./dist

# Set permissions
RUN chown -R node:node /app && chmod -R 755 /app

# Switch to non-root user
USER node

# Expose frontend port
EXPOSE 4173

CMD ["pm2-runtime", "start", "vite", "--name", "web", "--", "preview", "--host"]