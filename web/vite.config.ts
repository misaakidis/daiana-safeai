import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, "..");
    const env = loadEnv(mode, envDir, "");
    return {
        plugins: [
            react(),
            viteCompression({
                algorithm: "brotliCompress",
                ext: ".br",
                threshold: 1024,
            }),
        ],
        clearScreen: false,
        envDir,
        define: {
            'process.env.DAIANA_URL': JSON.stringify(process.env.DAIANA_URL),
            'process.env.WEB_URL': JSON.stringify(process.env.WEB_URL),
        },
        build: {
            outDir: "dist",
            minify: true,
            cssMinify: true,
            sourcemap: false,
            cssCodeSplit: true,
        },
        preview: {
            port: parseInt(env.WEB_SERVER_PORT || "4173"),
            host: '0.0.0.0',
            strictPort: true,
            cors: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            allowedHosts: 'all'
        },
        resolve: {
            alias: {
                "@": "/src",
            },
        },
    };
});
