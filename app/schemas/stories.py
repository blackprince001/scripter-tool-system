from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.models.stories import Story
from app.schemas.transcripts import CategoryWeight


class StoryResponse(Story):
    pass


class GeneratedStoryResponse(BaseModel):
    variations: List[str]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class StoryGenerationRequest(BaseModel):
    category_weights: List[CategoryWeight]
    variations_count: int = Field(3, ge=1, le=5)
    style: str = Field("professional", enum=["casual", "professional", "creative"])
    material_per_category: int = Field(5, ge=1, le=20)
    length: int = Field(500, ge=100, le=2000)


class StoryGenerationFromTranscriptsRequest(BaseModel):
    transcript_ids: List[str] = Field(...)
    variations_count: int = Field(3, ge=1, le=5)
    style: str = Field("professional", enum=["casual", "professional", "creative"])
    length: int = Field(500, ge=100, le=2000)
