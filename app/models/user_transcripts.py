from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class UserTranscript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    user_id: str = Field(...)
    transcript_id: str = Field(...)
    created_at: str = Field(...)
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "user_id": "12345",
                "transcript_id": "67890",
                "created_at": "2023-10-01T12:00:00Z",
                "updated_at": "2023-10-02T12:00:00Z",
            }
        },
    )


class UserTranscriptUpdate(BaseModel):
    user_id: Optional[str] = None
    transcript_id: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "54321",
                "transcript_id": "09876",
                "updated_at": "2023-10-03T12:00:00Z",
            }
        }
    )
