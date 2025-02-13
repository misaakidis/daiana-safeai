#!/bin/bash

cd /app/web/
vite preview --host &

cd /app/
pnpm start