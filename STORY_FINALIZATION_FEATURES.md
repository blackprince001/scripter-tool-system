# Story Finalization & Task Creation Features

This document describes the new features added to integrate story finalization with channel management project task creation.

## Overview

The system now supports:

1. **Story Status Management**: Stories can be in "draft" or "finalized" status
2. **Task Creation Integration**: Finalized stories automatically create tasks in the channel management project
3. **Individual Story View**: Dedicated page for viewing and finalizing individual stories
4. **Enhanced Story Management**: Save, edit, and manage stories with full CRUD operations

## Backend Changes

### 1. Database Integration

- Added Prisma dependency for PostgreSQL integration
- Created database service for task management
- Extended Story model with status and project_id fields

### 2. New API Endpoints

- `POST /stories/{story_id}/finalize` - Finalize a story and create a task
- Enhanced story CRUD operations with status management

### 3. Models & Schemas

- `StoryStatus` enum (DRAFT, FINALIZED)
- `StoryFinalizeRequest` model for finalization data
- Extended `Story` model with new fields

## Frontend Changes

### 1. New Pages

- **Story Detail Page** (`/stories/:id`): Individual story view with finalization
- **Stories List Page** (`/stories/all`): Browse and manage all stories

### 2. Enhanced Components

- Updated `StoryVariations` component with save/view functionality
- Added finalization forms and status indicators
- Improved navigation and routing

### 3. New Features

- Save individual story variations
- View and edit saved stories
- Finalize stories with task creation
- Status tracking and visual indicators

## Usage Flow

### 1. Story Generation

1. Generate story variations using existing methods
2. Save individual variations with custom titles
3. Stories are created with "draft" status

### 2. Story Management

1. View all saved stories at `/stories/all`
2. Click "View & Finalize" to open individual story page
3. Edit story content if needed

### 3. Story Finalization

1. Navigate to individual story page
2. Fill in finalization form:
   - Project slug (e.g., "channel-management")
   - Assignee username
   - Optional task title and description
3. Click "Finalize Story & Create Task"
4. System creates task in channel management project
5. Story status changes to "finalized"

## API Reference

### Finalize Story

```http
POST /stories/{story_id}/finalize
Content-Type: application/json

{
  "project_slug": "channel-management",
  "assignee_username": "john_doe",
  "task_title": "Optional custom title",
  "task_description": "Optional custom description"
}
```

### Response

```json
{
  "id": "story-uuid",
  "title": "Story Title",
  "content": "Story content...",
  "status": "finalized",
  "project_id": 123,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Database Schema

### Story Model (Extended)

```python
class Story(BaseModel):
    id: str
    title: str
    content: str
    status: StoryStatus  # NEW: draft or finalized
    project_id: Optional[int]  # NEW: linked project ID
    created_at: datetime
    updated_at: Optional[datetime]
```

### Task Model (Prisma)

```prisma
model Task {
  id          Int       @id @default(autoincrement())
  title       String
  status      Status    @default(pending)
  authorId    Int
  assigneeId  Int
  projectId   Int
  storyId     String?   // NEW: Reference to story
  description String?   // NEW: Task description
  // ... other fields
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Database

```bash
# Set DATABASE_URL in .env file
DATABASE_URL="postgresql://username:password@localhost:5432/channel_management_db"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 3. Environment Variables

Add to your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/channel_management_db"
```

### 4. Start Application

```bash
# Backend
python -m uvicorn app.main:app --reload

# Frontend
cd web-interface
npm run dev
```

## Error Handling

The system includes comprehensive error handling for:

- Database connection issues
- Story not found scenarios
- Project/user lookup failures
- Task creation failures
- Network connectivity issues

## Security Considerations

- Input validation on all endpoints
- SQL injection protection via Prisma
- Proper error messages without sensitive data exposure
- Authentication integration ready (currently uses default author ID)

## Future Enhancements

Potential improvements:

1. User authentication and authorization
2. Bulk story operations
3. Advanced task management features
4. Story templates and categorization
5. Analytics and reporting
6. Real-time notifications
7. API rate limiting
8. Caching for improved performance

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check network connectivity

2. **Prisma Client Not Found**
   - Run `npx prisma generate`
   - Restart the application

3. **Story Not Found**
   - Verify story ID is correct
   - Check if story exists in database

4. **Task Creation Failed**
   - Verify project slug exists
   - Check assignee username exists
   - Ensure proper permissions

### Debug Mode

Enable debug logging by setting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```
