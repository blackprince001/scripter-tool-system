#!/bin/bash

# Setup script for Docker deployment

echo "🚀 Setting up Docker environment for Scripter Tool System"

# Create config directory if it doesn't exist
if [ ! -d "config" ]; then
    echo "📁 Creating config directory..."
    mkdir -p config
fi

# Check if Firebase config exists
if [ ! -f "config/firebase-config.json" ]; then
    echo "⚠️  Warning: Firebase config file not found at config/firebase-config.json"
    echo "   Please place your firebase-config.json file in the config/ directory"
    echo "   You can download it from Firebase Console > Project Settings > Service Accounts"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Please create a .env file with the following variables:"
    echo "   OPENAI_API_KEY=your_openai_api_key"
    echo "   YOUTUBE_API_KEY=your_youtube_api_key"
fi

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ] && [ -f ".env" ]; then
    echo "📝 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if required variables are available
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY is not set"
    echo "   Please set it in your .env file or export it in your shell"
    exit 1
fi

if [ -z "$YOUTUBE_API_KEY" ]; then
    echo "❌ Error: YOUTUBE_API_KEY is not set"
    echo "   Please set it in your .env file or export it in your shell"
    exit 1
fi

echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure your firebase-config.json is in the config/ directory"
echo "2. Run: docker-compose up --build"
echo "3. Access the web interface at: http://localhost:3000"
echo "4. Access the API at: http://localhost:8000"
echo ""
echo "🔧 To stop the services: docker-compose down" 