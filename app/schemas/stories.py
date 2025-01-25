from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.schemas.stories import StoryVariation
from app.schemas.transcripts import CategoryWeight


class StoryResponse(BaseModel):
    variations: List[StoryVariation]
    prompt: str
    category_weights: List[CategoryWeight]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class StoryGenerationRequest(BaseModel):
    category_weights: List[CategoryWeight]
    variations_count: int = Field(3, ge=1, le=5)
    style: str = Field("professional", enum=["casual", "professional", "creative"])
    material_per_category: int = Field(5, ge=1, le=20)
    length: int = Field(500, ge=100, le=2000)


class StoryVariation(BaseModel):
    content: str
    style: str
    length: int
