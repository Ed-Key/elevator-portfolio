import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js core is a single irreducible module (~720 kB minified); the
    // default 500 kB warning would fire on every build with no fix available.
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Order matters: earlier groups claim modules first, so react must
          // come before the three groups or fiber's react dependency would be
          // pulled into the r3f chunk.
          groups: [
            { name: 'react', test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/ },
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/](?:three-stdlib|@react-three|@monogrid)[\\/]/ },
          ],
        },
      },
    },
  },
})
