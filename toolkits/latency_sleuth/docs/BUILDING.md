# Building the Latency Sleuth toolkit

1. Compile the React UI to `frontend/dist/index.js`. Keep `react`, `react-dom`,
   and `react-router-dom` external so the Toolbox shell provides them at
   runtime:
   ```bash
   pnpm exec esbuild toolkits/latency_sleuth/frontend/index.tsx \
     --bundle \
     --format=esm \
     --platform=browser \
     --outfile=toolkits/latency_sleuth/frontend/dist/index.js \
     --external:react \
     --external:react-dom \
     --external:react-router-dom \
     --loader:.ts=ts \
     --loader:.tsx=tsx
   ```
2. Package the toolkit with the helper script:
   ```bash
   scripts/package-toolkit.sh latency_sleuth
   ```
   The script regenerates generated docs, validates metadata, and writes a
   timestamped ZIP to `dist/`.
3. Upload the resulting archive via **Administration → Toolkits** or automate
   deployment with the `/toolkits/install` API.
