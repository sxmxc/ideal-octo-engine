# Building the Toolbox Health toolkit

1. Bundle the React UI to `frontend/dist/index.js`, keeping shared dependencies
   external:
   ```bash
   pnpm exec esbuild toolkits/toolbox_health/frontend/index.tsx \
     --bundle \
     --format=esm \
     --platform=browser \
     --outfile=toolkits/toolbox_health/frontend/dist/index.js \
     --external:react \
     --external:react-dom \
     --external:react-router-dom \
     --loader:.ts=ts \
     --loader:.tsx=tsx
   ```
2. Package the toolkit using the shared helper:
   ```bash
   scripts/package-toolkit.sh toolbox_health
   ```
   The script regenerates docs, validates metadata, and writes a timestamped ZIP
   to `dist/`.
3. Upload the resulting archive via **Administration → Toolkits** or automate
   installation with `/toolkits/install`.
