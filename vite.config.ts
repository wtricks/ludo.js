import { UserConfig, defineConfig } from 'vite'
import dts from "vite-plugin-dts";
import { resolve } from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: 'LudoJs',
            fileName: (formate) => {
                return "ludo."
                    + (formate == 'iife'
                        ? 'js'
                        : formate == 'es'
                            ? 'mjs' : 'cjs');
            },
            formats: ['cjs', 'iife', 'es'],
        },
        minify: false,
        sourcemap: true,
        copyPublicDir: false,
        emptyOutDir: true,
    },
    plugins: [
        dts({
            outDir: 'dist/types',
            rollupTypes: true
        })
    ],
} as UserConfig);