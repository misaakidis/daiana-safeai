#!/bin/bash

cd web
vite preview --host &

cd ..
pnpm start