#!/bin/bash
set -e

echo "🚀 Deploying Web service to Fly.io..."

# Deploy Web service with correct working directory
cd web-interface
flyctl deploy --config ../fly.web.toml --dockerfile Dockerfile
cd ..

echo "✅ Web service deployed successfully!"
echo "🌐 Web URL: https://scripter-tool-system-web.fly.dev"
