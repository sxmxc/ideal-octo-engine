# Building TLS Watchtower

1. Install toolkit dependencies in your local environment:

   ```bash
   npm install
   ```

   The repository does not bundle a dedicated package.json for community
   toolkits, so use the Toolbox runtime build tooling when compiling assets.

2. Rebuild the React panel from the toolkit root:

   ```bash
   npm run build -- --entry toolkits/tls-watchtower/frontend/index.tsx \
     --outdir toolkits/tls-watchtower/frontend/dist --format esm
   ```

   Adjust the bundler command to the runtime you use (Vite, esbuild, or the
   Toolbox-provided builder). The generated file must be written to
   `frontend/dist/index.js`.

3. Verify the output bundle includes the certificate dashboard and can be loaded
   by the Toolbox UI without extra polyfills.

4. Run `scripts/validate-repo.sh` after rebuilding to refresh catalog metadata
   and generated documentation before committing.
