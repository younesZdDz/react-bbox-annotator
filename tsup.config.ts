import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    // Ensure file extensions match package.json:
    // - ESM -> index.mjs
    // - CJS -> index.cjs
    outExtension: ({ format }) => ({
        js: format === 'cjs' ? '.cjs' : '.mjs',
    }),
});
