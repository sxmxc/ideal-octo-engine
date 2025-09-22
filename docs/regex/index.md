---
title: Regex Toolkit
---

<!-- This file is auto-generated from toolkits/regex/docs/README.md. -->

# Regex Toolkit

This toolkit packages a regex playground for the Toolbox runtime. It exposes a
backend API that evaluates patterns, optional frontend assets, and catalog
metadata suitable for production deployments.

## Features

- FastAPI router under `/toolkits/regex` for evaluating expressions.
- Optional React panel that renders the playground UI when bundled.

## Installation

1. Package the toolkit:
   ```bash
   scripts/package-toolkit.sh regex
   ```
2. Upload the generated zip (`dist/regex-<date>.zip`) through the Toolbox Admin → Toolkits UI.
3. Exercise the `/toolkits/regex/test` endpoint with a simple payload to verify installation.

## Configuration

No runtime configuration is required. Use this toolkit as a scaffold when authoring your own bundles.
