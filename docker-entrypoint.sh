#!/bin/bash

echo "Docker entrypoint: Starting Daiana agent and Web client"

cd /app/web/
vite preview --host &

cd /app/
pnpm start