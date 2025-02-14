import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig(() => {
    // Parse environment variables with defaults from process.env
    const serverPort = parseInt(process.env.DAIANA_SERVER_PORT || "3000");
    const webServerPort = parseInt(process.env.WEB_SERVER_PORT || "4173");
    const daianaUrl = process.env.DAIANA_URL || `http://localhost:${serverPort}`;
    const webUrl = process.env.WEB_URL || `http://localhost:${webServerPort}`;
    const allowedHosts = (process.env.ALLOWED_HOSTS || "localhost").split(",");
    const corsOrigin = process.env.CORS_ORIGIN || "*";

    // Debug logging
    console.log('\n=== Vite Configuration Debug ===');
    console.log('\nRaw Process Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DAIANA_URL:', process.env.DAIANA_URL);
    console.log('WEB_URL:', process.env.WEB_URL);
    console.log('WEB_SERVER_PORT:', process.env.WEB_SERVER_PORT);
    console.log('DAIANA_SERVER_PORT:', process.env.DAIANA_SERVER_PORT);
    console.log('ALLOWED_HOSTS:', process.env.ALLOWED_HOSTS);
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

    console.log('\nParsed Configuration Values:');
    console.log('serverPort:', serverPort, '(type:', typeof serverPort, ')');
    console.log('webServerPort:', webServerPort, '(type:', typeof webServerPort, ')');
    console.log('daianaUrl:', daianaUrl, '(type:', typeof daianaUrl, ')');
    console.log('webUrl:', webUrl, '(type:', typeof webUrl, ')');
    console.log('allowedHosts:', allowedHosts, '(type:', typeof allowedHosts, ')');
    console.log('corsOrigin:', corsOrigin, '(type:', typeof corsOrigin, ')');

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
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                DAIANA_URL: JSON.stringify(daianaUrl),
                WEB_URL: JSON.stringify(webUrl),
                SERVER_PORT: JSON.stringify(serverPort),
                WEB_SERVER_PORT: JSON.stringify(webServerPort),
                ALLOWED_HOSTS: JSON.stringify(allowedHosts),
                CORS_ORIGIN: JSON.stringify(corsOrigin)
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
            port: webServerPort,
            host: '0.0.0.0',
            strictPort: true,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
            },
            allowedHosts: 'all'
        },
        resolve: {
            alias: {
                "@": "/src",
            },
        },
    };

    console.log('\nFinal Configuration:');
    console.log('preview.port:', config.preview.port);
    console.log('preview.host:', config.preview.host);
    console.log('preview.cors:', config.preview.cors);
    console.log('preview.headers:', config.preview.headers);
    console.log('preview.allowedHosts:', config.preview.allowedHosts);
    console.log('\nDefined Environment Variables:');
    console.log(config.define['process.env']);
    console.log('\n=== End Debug ===\n');

    return config;
});
