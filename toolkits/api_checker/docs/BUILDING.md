# Building the API Checker toolkit

1. Compile the React panel to `frontend/dist/index.js`. Leave `react`,
   `react-dom`, and `react-router-dom` external so the Toolbox shell provides
   them at runtime. For example:
   ```bash
   pnpm exec esbuild toolkits/api_checker/frontend/index.tsx \
     --bundle \
     --format=esm \
     --platform=browser \
     --outfile=toolkits/api_checker/frontend/dist/index.js \
     --external:react \
     --external:react-dom \
     --external:react-router-dom \
     --loader:.ts=ts \
     --loader:.tsx=tsx
   ```
2. Package the toolkit:
   ```bash
   scripts/package-toolkit.sh api_checker
   ```
   The script regenerates documentation, validates the manifest, and writes a
   timestamped ZIP archive to `dist/`.
3. Upload the generated archive through **Administration → Toolkits** or by
   calling the `/toolkits/install` API.
