# YouTube Transcript Processing and Story Generation System

## Overview

This project is a FastAPI-based application that provides functionality for processing YouTube video transcripts, generating stories from those transcripts, and managing content using various APIs. The system integrates with YouTube for video data, OpenAI for text generation and embeddings, and Firebase for data storage.

## Key Features

- YouTube video transcript extraction and processing
- Automatic content categorization using AI
- Story generation from video transcripts
- Semantic search capabilities
- Content management with categories
- Multiple API integrations (YouTube, OpenAI, Firebase)

## Prerequisites

- Python 3.8+
- Firebase account and project
- OpenAI API access
- YouTube API access

## Setup Instructions

### 1. Environment Setup

First, clone the repository and create a virtual environment:

```bash
git clone <repository-url>
cd blackprince001-scripter-tool-system
pip install uv
uv venv
source .venv/bin/activate # activating the environment will be different on windows
uv pip install -r requirements.txt
```

### 2. Configuration

Create a `.env` file in the root directory with the following variables:

```env
FIREBASE_CONFIG_FILE=path/to/your/firebase-config.json
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. API Keys and Services Setup

#### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Navigate to Project Settings > Service Accounts
4. Generate a new private key
5. Save the JSON file as `firebase-config.json` in your project
6. Update the `FIREBASE_CONFIG_FILE` path in your `.env`

#### OpenAI API

1. Visit [OpenAI's platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API keys
4. Generate a new API key
5. Add it to your `.env` file as `OPENAI_API_KEY`

#### YouTube API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Add it to your `.env` file as `YOUTUBE_API_KEY`

## Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

[Documentation Reference](DOCS.md)

### Main Endpoints

#### Transcript Processing

```http
POST /transcripts/process
```

Process a YouTube video and extract its transcript.

Parameters:

- `url`: YouTube video URL
- `category`: (optional) Category for the transcript
- `auto_categorize`: (optional) Enable AI category generation

#### Story Generation

```http
POST /generate/story
```

Generate stories from categorized transcripts.

Parameters:

- `category_weights`: List of categories and their weights
- `variations_count`: Number of story variations to generate
- `style`: Story style (casual/professional/creative)
- `length`: Desired story length

#### Category Management

```http
GET /categories/
```

Retrieve all available categories.

## Project Structure

```
blackprince001-scripter-tool-system/
├── app/
│   ├── core/         # Core functionality and API clients
│   ├── models/       # Data models
│   ├── router/       # API routes
│   ├── schemas/      # Pydantic schemas
│   └── utils/        # Utility functions
├── tests/            # Test files
└── main.py          # Application entry point
```

## Error Handling

The application includes custom error handling for various scenarios:

- Invalid YouTube URLs
- Missing transcripts
- API failures
- Database errors

All errors return structured responses with:

- `error_code`: Specific error identifier
- `message`: Human-readable error message
- `details`: Additional error information

## Testing

Run the test suite using pytest:

```bash
pytest
```

## Firebase Collections Structure

The application uses the following Firestore collections:

- `transcripts`: Main collection for all transcripts
- `transcripts_{category}`: Category-specific transcript collections
- `categories`: Available content categories
- `stories`: Generated stories

## Development Guidelines

1. Use the provided models and schemas for data validation
2. Follow the existing error handling patterns
3. Add tests for new functionality
4. Update documentation for API changes

## Security Considerations

- API keys are managed through environment variables
- CORS is configured for specific origins
- Firebase security rules should be properly configured
- Rate limiting should be implemented for production use

## Performance Optimization

The application implements several optimization techniques:

- LRU caching for frequently accessed data
- Efficient transcript processing
- Optimized database queries
- Semantic search capabilities

## Troubleshooting

Common issues and solutions:

1. **Firebase Connection Issues**
   - Verify Firebase configuration file path
   - Check Firebase project permissions
   - Ensure proper network connectivity

2. **YouTube API Errors**
   - Verify API key validity
   - Check daily quota limits
   - Ensure video URLs are properly formatted

3. **OpenAI API Issues**
   - Verify API key
   - Check rate limits
   - Monitor token usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a pull request

## License

[Add License Information]
