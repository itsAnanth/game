import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: Number(process.env.CLIENT_PORT) || 3000
    }
})
