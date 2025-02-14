# Use a specific Node.js version for better reproducibility
FROM node:23.3.0-slim

# Install pnpm globally and install necessary dependencies
RUN npm install -g pnpm@9.15.4 && \
    apt-get update && \
    apt-get install -y git python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy package.json and other configuration files
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy the rest of the application code
COPY ./src ./src
COPY ./characters ./characters

# Copy entrypoint script
COPY ./docker-entrypoint.sh ./

# Install dependencies and build the project
RUN pnpm install && \
    pnpm build

# Build frontend
#COPY ./web ./web
#WORKDIR /app/web
#COPY ./web/package.json ./
#COPY ./web/pnpm-lock.yaml ./
#RUN npm install -g vite
#RUN pnpm install && \
#    vite build

# Set permissions
RUN chown -R node:node /app && \
    chmod -R 755 /app

# Switch to node user for security
USER node

# Expose ports
EXPOSE 3000 4173