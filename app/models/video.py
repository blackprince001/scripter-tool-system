from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class YoutubeVideo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., max_length=200)
    channel_id: str = Field(..., description="Source YouTube channel ID")
    channel_title: str = Field("Unknown Channel", description="Channel display name")

    # Processing information
    transcript_id: Optional[str] = Field(None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class YoutubeVideoUpdate(BaseModel):
    transcript_id: Optional[str] = None
