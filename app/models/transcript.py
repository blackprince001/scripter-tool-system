from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class Transcript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    video_id: str = Field(...)
    title: str = Field(...)
    transcript: str = Field(...)
    category: str = Field(...)
    sanitized_category: str = Field(...)
    created_at: datetime
    metadata: Optional[dict] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "video_id": "dQw4w9WgXcQ",
                "title": "Never Gonna Give You Up",
                "transcript": "We're no strangers to love...",
                "category": "Music",
                "sanitized_category": "music",
                "created_at": "2023-10-01T12:00:00Z",
                "metadata": {"views": 1000000, "likes": 50000},
            }
        },
    )


class TranscriptUpdate(BaseModel):
    title: Optional[str] = None
    transcript: Optional[str] = None
    category: Optional[str] = None
    metadata: Optional[dict] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Never Gonna Give You Up (Remix)",
                "transcript": "We're no strangers to love... (Remix)",
                "category": "Remix",
                "metadata": {"views": 1500000, "likes": 75000},
            }
        }
    )
