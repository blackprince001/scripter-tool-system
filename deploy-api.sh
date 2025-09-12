#!/bin/bash
set -e

echo "🚀 Deploying API service to Fly.io..."

# Deploy API service
flyctl deploy --config fly.api.toml --dockerfile Dockerfile

echo "✅ API service deployed successfully!"
echo "🌐 API URL: https://scripter-tool-system-api.fly.dev"
