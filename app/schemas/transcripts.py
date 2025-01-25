from typing import List

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
    transcript_length: int


class CategoryCreate(BaseModel):
    name: str
    description: str
    processing_rules: dict


class CategoryResponse(CategoryCreate):
    created_at: str


class CategoryWeight(BaseModel):
    name: str
    weight: float = Field(..., ge=0, le=1)  # 0-1 range for slider values


class CategoryMaterialResponse(BaseModel):
    category: str
    total_transcripts: int
    material: List[str]
    video_ids: List[str]
