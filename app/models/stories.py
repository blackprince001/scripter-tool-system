from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class Story(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    title: str = Field(...)
    content: str = Field(...)
    created_at: str = Field(...)
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "title": "The Adventure Begins",
                "content": "Once upon a time...",
                "created_at": "2023-10-01T12:00:00Z",
                "updated_at": "2023-10-02T12:00:00Z",
            }
        },
    )


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "The Adventure Continues",
                "content": "And so the journey continued...",
                "updated_at": "2023-10-03T12:00:00Z",
            }
        }
    )
