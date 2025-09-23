# Building the Connectivity toolkit

1. Bundle the React frontend to `frontend/dist/index.js`, keeping React
   dependencies external:
   ```bash
   pnpm exec esbuild toolkits/connectivity/frontend/index.tsx \
     --bundle \
     --format=esm \
     --platform=browser \
     --outfile=toolkits/connectivity/frontend/dist/index.js \
     --external:react \
     --external:react-dom \
     --external:react-router-dom \
     --loader:.ts=ts \
     --loader:.tsx=tsx
   ```
2. Package the toolkit with the helper script:
   ```bash
   scripts/package-toolkit.sh connectivity
   ```
   The ZIP artefact is written to `dist/` with a timestamped filename.
3. Upload the generated bundle via the admin UI or automation calling
   `/toolkits/install`.
