# Fly.io Deployment Guide

This guide explains how to deploy your Docker Compose setup to Fly.io using **two separate apps** - one for the API and one for the web interface.

## ✅ **Successfully Deployed!**

- **API**: <https://scripter-tool-system-api.fly.dev>
- **Web Interface**: <https://scripter-tool-system-web.fly.dev>

## Architecture

```
Internet → {
  API: https://scripter-tool-system-api.fly.dev (FastAPI on port 8000)
  Web: https://scripter-tool-system-web.fly.dev (React + Nginx on port 80)
}
```

## Files Created

1. **`fly.api.toml`** - Configuration for API service
2. **`fly.web.toml`** - Configuration for web service  
3. **`deploy-api.sh`** - Script to deploy API service
4. **`deploy-web.sh`** - Script to deploy web service
5. **`.github/workflows/fly-deploy.yml`** - Updated CI/CD workflow

## Prerequisites

1. Fly.io CLI installed (`flyctl`)
2. Two Fly.io apps created (one for API, one for web)
3. Environment variables set as secrets

## Setup Steps

### 1. Install Fly.io CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io

```bash
flyctl auth login
```

### 3. Create Apps

```bash
# Create API app
flyctl apps create scripter-tool-system-api

# Create Web app  
flyctl apps create scripter-tool-system-web
```

### 4. Set Secrets for API App

```bash
# Set secrets for API service
flyctl secrets set OPENAI_API_KEY="your-openai-key" --app scripter-tool-system-api
flyctl secrets set YOUTUBE_API_KEY="your-youtube-key" --app scripter-tool-system-api
```

### 5. Deploy Services

#### Option A: Using Scripts

```bash
# Deploy API first
./deploy-api.sh

# Then deploy web (it will connect to the API)
./deploy-web.sh
```

#### Option B: Manual Deployment

```bash
# Deploy API
flyctl deploy --config fly.api.toml --dockerfile Dockerfile

# Deploy Web (from web-interface directory)
cd web-interface
flyctl deploy --config ../fly.web.toml --dockerfile Dockerfile
cd ..
```

## Environment Variables

### API Service (`scripter-tool-system-api`)

- `FIREBASE_CONFIG_FILE` - Path to Firebase config
- `OPENAI_API_KEY` - OpenAI API key (secret)
- `YOUTUBE_API_KEY` - YouTube API key (secret)
- `ENVIRONMENT` - Set to "production"

### Web Service (`scripter-tool-system-web`)

- `VITE_API_BASE` - API base URL (set to `https://scripter-tool-system-api.fly.dev`)

## URLs

- **API**: <https://scripter-tool-system-api.fly.dev>
- **Web Interface**: <https://scripter-tool-system-web.fly.dev>

## Dockerfiles Used

- **API**: Uses existing `Dockerfile` (Python FastAPI)
- **Web**: Uses existing `web-interface/Dockerfile` (React + Nginx)

## Key Fix Applied

The main issue was the **build context**. The web service Dockerfile expects to be run from the `web-interface` directory, not the root directory. The solution was to:

1. Change to the `web-interface` directory before running `flyctl deploy`
2. Use the correct path to the fly.toml config file (`../fly.web.toml`)

## Local Development

To test locally with the same setup:

```bash
# Terminal 1: Start API
docker-compose up api

# Terminal 2: Start Web
docker-compose up web
```

## Troubleshooting

### Check API Logs

```bash
flyctl logs --app scripter-tool-system-api
```

### Check Web Logs

```bash
flyctl logs --app scripter-tool-system-web
```

### SSH into API Container

```bash
flyctl ssh console --app scripter-tool-system-api
```

### SSH into Web Container

```bash
flyctl ssh console --app scripter-tool-system-web
```

### Scale Resources

```bash
# Scale API
flyctl scale memory 2048 --app scripter-tool-system-api

# Scale Web
flyctl scale memory 1024 --app scripter-tool-system-web
```

## Cost Optimization

- Both apps use `auto_stop_machines = 'stop'` to save costs
- Machines will automatically start when traffic arrives
- API uses 1GB RAM, Web uses 512MB RAM
- Consider using `min_machines_running = 1` for always-on availability

## CORS Configuration

The API service is configured to allow requests from the web domain. The CORS configuration in `app/main.py` includes:

```python
allowed_origins = [
    "https://scripter-tool-system-web.fly.dev",  # Production web app
    "http://localhost:3000",  # Local development
    "http://localhost:80",    # Local docker-compose
]
```

## Alternative: Single App Approach

If you prefer a single app, you can use a combined Dockerfile approach, but the two-app approach is cleaner and more maintainable.
