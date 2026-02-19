import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Don't hash audio assets — SampleBank references paths from manifest
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.match(/\.(webm|mp3|wav)$/)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
