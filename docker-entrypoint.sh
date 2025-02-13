#!/bin/bash

pnpm start --non-interactive &

cd web
vite serve &
