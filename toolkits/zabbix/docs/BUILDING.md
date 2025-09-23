# Building the Zabbix toolkit

1. Bundle the React UI into `frontend/dist/index.js` while keeping shared
   dependencies external:
   ```bash
   pnpm exec esbuild toolkits/zabbix/frontend/index.tsx \
     --bundle \
     --format=esm \
     --platform=browser \
     --outfile=toolkits/zabbix/frontend/dist/index.js \
     --external:react \
     --external:react-dom \
     --external:react-router-dom \
     --loader:.ts=ts \
     --loader:.tsx=tsx
   ```
2. Package the toolkit using the shared helper:
   ```bash
   scripts/package-toolkit.sh zabbix
   ```
   The script regenerates docs, validates metadata, and writes a timestamped ZIP
   to `dist/`.
3. Upload the archive via **Administration → Toolkits** or automation targeting
   the `/toolkits/install` API.
