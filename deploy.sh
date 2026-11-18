#!/usr/bin/env bash
# Prepare this project for deployment and print the remaining Render steps.
# The actual publish step happens on render.com after pushing to a Git host.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Installing dependencies"
npm ci --no-bin-links

echo "==> Building for production"
npm run build

echo
echo "Build ready. To publish:"
echo "  1. Push this folder to GitHub or GitLab."
echo "  2. In Render choose New -> Blueprint and select that repo."
echo "     render.yaml configures the service automatically."
echo
echo "Manual setup: build command 'npm ci --no-bin-links && npm run build',"
echo "              start command 'npm start', health check path '/'."
