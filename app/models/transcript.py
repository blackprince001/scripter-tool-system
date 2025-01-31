from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class Transcript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    video_id: str = Field(...)
    title: str = Field(...)
    transcript: str = Field(...)
    embedding: List[float] = []
    category: str = Field(...)
    sanitized_category: str = Field(...)
    created_at: datetime
    metadata: Optional[dict] = None


class TranscriptUpdate(BaseModel):
    title: Optional[str] = None
    transcript: Optional[str] = None
    category: Optional[str] = None
    metadata: Optional[dict] = None
