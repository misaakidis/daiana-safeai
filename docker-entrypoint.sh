#!/bin/bash

# Start Vite in the background using pm2
if [ -d "/app/web" ]; then
    cd /app/web/
    pm2 start vite --name web -- preview --host
fi

# Start the main application using pm2
cd /app/
pm2 start pnpm --name app -- start

# Keep the script running
pm2 logs
pm2 monit