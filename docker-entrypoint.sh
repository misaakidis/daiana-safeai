#!/bin/sh
set -e

# Function to check if a port is available
check_port() {
    if ! nc -z localhost "$1" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Wait for ports to be available
for port in 3000 4173; do
    until check_port "$port"; do
        echo "Port $port is in use. Waiting..."
        sleep 5
    done
done

# Start Vite preview server
cd /app/web || exit 1
echo "Starting Vite preview server..."
vite preview --host &
VITE_PID=$!

# Wait for Vite server to be ready
until nc -z localhost 4173; do
    echo "Waiting for Vite server..."
    sleep 2
done

# Start the main application
cd /app || exit 1
echo "Starting main application..."
exec pnpm start

# Cleanup on exit
trap 'kill $VITE_PID' EXIT