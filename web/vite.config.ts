import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";

// Environment variable parsing with proper typing and defaults
const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DAIANA_SERVER_PORT: parseInt(process.env.DAIANA_SERVER_PORT || '3000'),
    WEB_SERVER_PORT: parseInt(process.env.WEB_SERVER_PORT || '4173'),
    DAIANA_URL: process.env.DAIANA_URL || 'http://localhost:3000',
    WEB_URL: process.env.WEB_URL || 'http://localhost:4173',
    ALLOWED_HOSTS: (process.env.ALLOWED_HOSTS || 'localhost').split(',').map(host => host.trim()),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

// https://vite.dev/config/
export default defineConfig(() => {
    const config = {
        plugins: [
            react(),
            viteCompression({
                algorithm: "brotliCompress",
                ext: ".br",
                threshold: 1024,
            }),
        ],
        clearScreen: false,
        define: {
            'process.env': {
                NODE_ENV: JSON.stringify(env.NODE_ENV),
                DAIANA_URL: JSON.stringify(env.DAIANA_URL),
                WEB_URL: JSON.stringify(env.WEB_URL),
                DAIANA_SERVER_PORT: JSON.stringify(env.DAIANA_SERVER_PORT),
                WEB_SERVER_PORT: JSON.stringify(env.WEB_SERVER_PORT),
                ALLOWED_HOSTS: JSON.stringify(env.ALLOWED_HOSTS),
                CORS_ORIGIN: JSON.stringify(env.CORS_ORIGIN)
            }
        },
        build: {
            outDir: "dist",
            minify: true,
            cssMinify: true,
            sourcemap: false,
            cssCodeSplit: true,
        },
        preview: {
            port: env.WEB_SERVER_PORT,
            host: '0.0.0.0',
            strictPort: true,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': env.CORS_ORIGIN,
            },
            allowedHosts: env.ALLOWED_HOSTS
        },
        resolve: {
            alias: {
                "@": "/src",
            },
        },
    };

    // Debug: Log final configuration
    console.log('\n=== Final Vite Configuration ===');
    console.log('Preview Server:', JSON.stringify({
        port: config.preview.port,
        host: config.preview.host,
        cors: config.preview.cors,
        headers: config.preview.headers,
        allowedHosts: config.preview.allowedHosts
    }, null, 2));
    console.log('\nDefined Environment Variables:', JSON.stringify(config.define['process.env'], null, 2));

    return config;
});
