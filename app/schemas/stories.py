from pydantic import BaseModel, Field
from typing import List, Optional


class StoryBase(BaseModel):
    """Base story information"""

    title: str
    content: str


class StoryCreate(BaseModel):
    """Schema for creating a new story"""

    user_id: str
    title: str
    category_weights: Dict[str, float]
    num_transcripts: Optional[int] = 5


class StoryUpdate(BaseModel):
    """Schema for updating a story"""

    title: Optional[str] = None
    content: Optional[str] = None
    category_weights: Optional[Dict[str, float]] = None


class StoryResponse(StoryBase):
    """Schema for story response"""

    story_id: str
    user_id: str
    created_at: datetime
    category_weights: Dict[str, float]
    used_transcripts: List[str]


class StoryGeneration(BaseModel):
    """Schema for story generation settings"""

    style: Optional[str] = "narrative"
    tone: Optional[str] = "neutral"
    length: Optional[int] = Field(default=1000, gt=0, le=4000)
    include_citations: bool = True


class StoryPrompt(BaseModel):
    """Schema for story generation prompt"""

    theme: str
    keywords: List[str] = Field(default_factory=list)
    required_elements: List[str] = Field(default_factory=list)
    avoid_elements: List[str] = Field(default_factory=list)
