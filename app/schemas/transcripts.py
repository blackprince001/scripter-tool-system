from pydantic import BaseModel, Field
from typing import List, Optional


class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class TranscriptBase(BaseModel):
    video_id: str
    video_title: str
    transcript: str
    categories: List[str]


class TranscriptCreate(TranscriptBase):
    user_id: str


class TranscriptUpdate(BaseModel):
    video_title: Optional[str] = None
    categories: Optional[List[str]] = None


class TranscriptResponse(TranscriptBase):
    transcript_id: str
    user_id: str
    created_at: datetime
    embedding: Optional[List[float]] = None
    used_in_stories: List[str] = Field(default_factory=list)


class BatchTranscriptCreate(BaseModel):
    transcripts: List[TranscriptCreate]
