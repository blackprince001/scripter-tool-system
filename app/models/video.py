from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class YoutubeVideo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., max_length=200)
    channel_id: str = Field(..., description="Source YouTube channel ID")
    channel_title: str = Field("Unknown Channel", description="Channel display name")
    # Processing information
    transcript_id: Optional[str] = Field(
        None, description="Reference to transcripts collection document ID"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="When we added to our system"
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "550e8400-e29b-41d4-a716-446655440000",
                "video_id": "dQw4w9WgXcQ",
                "title": "Never Gonna Give You Up",
                "channel_id": "UCuAXFkgsw1L7xaCfnd5JJOw",
                "channel_title": "Rick Astley",
                "transcript_id": "transcript_12345",
                "created_at": "2024-03-20T09:00:00Z",
            }
        },
    )


class YoutubeVideoUpdate(BaseModel):
    transcript_id: Optional[str] = None
