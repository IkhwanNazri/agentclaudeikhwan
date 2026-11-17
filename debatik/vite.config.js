import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            // Set SKIP_FONTS=1 untuk build tanpa internet (fon jatuh ke serif/sans sistem).
            fonts: process.env.SKIP_FONTS
                ? []
                : [
                      bunny('Playfair Display', { weights: [600, 700] }),
                      bunny('Plus Jakarta Sans', { weights: [400, 500, 600, 700] }),
                  ],
        }),
        vue({
            template: {
                transformAssetUrls: { base: null, includeAbsolute: false },
            },
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
