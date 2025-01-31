from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class Story(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    title: str = Field(...)
    content: str = Field(...)
    created_at: datetime
    updated_at: Optional[datetime] = None


class StoryCreate(BaseModel):
    title: str
    content: str


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    content: datetime
    updated_at: Optional[datetime] = None
