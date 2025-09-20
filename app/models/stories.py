from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class StoryStatus(str, Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"


class Story(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    title: str = Field(...)
    content: str = Field(...)
    status: StoryStatus = Field(default=StoryStatus.DRAFT)
    project_id: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class StoryCreate(BaseModel):
    title: str
    content: str
    project_id: Optional[int] = None


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[StoryStatus] = None
    project_id: Optional[int] = None
    updated_at: Optional[datetime] = None


class StoryFinalizeRequest(BaseModel):
    project_slug: str
    assignee_username: str
    task_title: Optional[str] = None
    task_description: Optional[str] = None
