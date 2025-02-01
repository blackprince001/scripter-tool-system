# API Documentation

## Table of Contents

- [Stories API](#stories-api)
- [Transcripts API](#transcripts-api)
- [Generation API](#generation-api)
- [Categories API](#categories-api)
- [Common API](#common-api)

## Stories API

### Create Story

```http
POST /stories/
```

Creates a new story.

**Request Body:**

```json
{
  "title": "string",
  "content": "string"
}
```

**Response:** `201 Created`

```json
{
  "_id": "string",
  "title": "string",
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime | null"
}
```

### Get Story

```http
GET /stories/{story_id}
```

Retrieves a specific story by ID.

**Parameters:**

- `story_id` (path, required): Story identifier

**Response:** `200 OK`

- Returns the StoryResponse object

### Update Story

```http
PUT /stories/{story_id}
```

Updates an existing story.

**Parameters:**

- `story_id` (path, required): Story identifier

**Request Body:**

```json
{
  "title": "string | null",
  "content": "datetime",
  "updated_at": "datetime | null"
}
```

### Delete Story

```http
DELETE /stories/{story_id}
```

Deletes a story.

**Parameters:**

- `story_id` (path, required): Story identifier

**Response:** `204 No Content`

## Transcripts API

### Process YouTube Video

```http
POST /transcripts/process
```

Processes a YouTube video to extract and store its transcript.

**Parameters:**

- `url` (query, required): YouTube video URL
- `category` (query, optional): Category name
- `auto_categorize` (query, optional): Enable AI category generation (default: true)

**Response:** `200 OK`

```json
{
  "status": "string",
  "video_id": "string",
  "category": "string",
  "auto_generated": "boolean"
}
```

### Get Transcript

```http
GET /transcripts/{video_id}
```

Retrieves a transcript by video ID.

**Parameters:**

- `video_id` (path, required): YouTube video ID
- `category` (query, optional): Category name

**Response:** `200 OK`

```json
{
  "_id": "string",
  "video_id": "string",
  "title": "string",
  "transcript": "string",
  "embedding": "number[]",
  "category": "string",
  "sanitized_category": "string",
  "created_at": "datetime",
  "metadata": "object | null"
}
```

### Get Category Material

```http
GET /transcripts/by-category/{category}
```

Retrieves transcripts for a specific category.

**Parameters:**

- `category` (path, required): Category name
- `limit` (query, optional): Maximum number of results (default: 20)

**Response:** `200 OK`

```json
{
  "category": "string",
  "total_transcripts": "integer",
  "material": "string[] | null",
  "video_ids": "string[] | null"
}
```

## Generation API

### Generate Story

```http
POST /generate/story
```

Generates stories based on category weights.

**Request Body:**

```json
{
  "category_weights": [
    {
      "name": "string",
      "weight": "number (0-1)"
    }
  ],
  "variations_count": "integer (1-5, default: 3)",
  "style": "string (casual|professional|creative, default: professional)",
  "material_per_category": "integer (1-20, default: 5)",
  "length": "integer (100-2000, default: 500)"
}
```

### Generate Story From Transcripts

```http
POST /generate/story-from-transcripts
```

Generates stories from specific transcripts.

**Request Body:**

```json
{
  "transcript_ids": "string[]",
  "variations_count": "integer (1-5, default: 3)",
  "style": "string (casual|professional|creative)",
  "length": "integer (100-2000, default: 500)"
}
```

### Generate Story From Synopsis

```http
POST /generate/story-from-synopsis
```

Generates story variations from a synopsis.

**Request Body:**

```json
{
  "story": "string",
  "variations_count": "integer (1-5, default: 3)",
  "style": "string (casual|professional|creative)",
  "length": "integer (100-2000, default: 500)"
}
```

## Categories API

### Get Categories

```http
GET /categories/
```

Retrieves all available categories.

**Response:** `200 OK`

```json
[
  {
    "name": "string"
  }
]
```

## Common API

### Get Channel Videos

```http
GET /youtube/channel/{channel_id}/videos
```

Retrieves videos from a YouTube channel.

**Parameters:**

- `channel_id` (path, required): YouTube channel ID
- `max_results` (query, optional): Maximum results (1-50, default: 50)
- `order` (query, optional): Sort order (date|viewCount|rating, default: date)

**Response:** `200 OK`

```json
{
  "channel_id": "string",
  "total_videos": "integer",
  "videos": [
    {
      "video_id": "string",
      "title": "string",
      "published_at": "string",
      "thumbnail": "string"
    }
  ]
}
```

## Error Responses

All endpoints may return the following error response when validation fails:

```json
{
  "detail": [
    {
      "loc": ["string | integer"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

## Response Types

### StoryResponse

```json
{
  "_id": "string",
  "title": "string",
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime | null"
}
```

### TranscriptResponse

```json
{
  "_id": "string",
  "video_id": "string",
  "title": "string",
  "transcript": "string",
  "embedding": "number[]",
  "category": "string",
  "sanitized_category": "string",
  "created_at": "datetime",
  "metadata": "object | null"
}
```

### GeneratedStoryResponse

```json
{
  "variations": "string[]",
  "created_at": "string"
}
```

## Notes

1. All datetime fields follow ISO 8601 format
2. Authentication methods are not specified in the OpenAPI spec
3. Rate limits should be considered for production use
4. Some endpoints (search and semantic search) are marked as deprecated
