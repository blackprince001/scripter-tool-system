from typing import List, Optional
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.models.transcript import Transcript


class TranscriptResponse(Transcript):
    model_config = ConfigDict(
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
        }
    )


class TranscriptProcessResponse(BaseModel):
    status: str
    video_id: str
    category: str
    auto_generated: bool


class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    name: str


class CategoryWeight(BaseModel):
    name: str
    weight: float = Field(..., ge=0, le=1)  # 0-1 range for slider values


class CategoryMaterialResponse(BaseModel):
    category: str
    total_transcripts: int
    material: Optional[List[str]]
    video_ids: Optional[List[str]]


# Batch Processing Schemas
class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoProcessingItem(BaseModel):
    video_id: str
    title: str
    url: str
    status: ProcessingStatus = ProcessingStatus.PENDING
    category: Optional[str] = None
    error_message: Optional[str] = None


class BatchProcessRequest(BaseModel):
    videos: List[VideoProcessingItem]
    auto_categorize: bool = True
    default_category: Optional[str] = None


class BatchProcessResponse(BaseModel):
    batch_id: str
    total_videos: int
    processed_count: int
    failed_count: int
    videos: List[VideoProcessingItem]


class BatchStatusResponse(BaseModel):
    batch_id: str
    status: ProcessingStatus
    total_videos: int
    processed_count: int
    failed_count: int
    videos: List[VideoProcessingItem]
    created_at: str
    updated_at: str
