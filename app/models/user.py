from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    username: str = Field(...)
    email: str = Field(...)
    hashed_password: str = Field(...)
    created_at: str = Field(...)
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "username": "johndoe",
                "email": "johndoe@example.com",
                "hashed_password": "hashed_password_here",
                "created_at": "2023-10-01T12:00:00Z",
                "updated_at": "2023-10-02T12:00:00Z",
            }
        },
    )


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    hashed_password: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "janedoe",
                "email": "janedoe@example.com",
                "hashed_password": "new_hashed_password_here",
                "updated_at": "2023-10-03T12:00:00Z",
            }
        }
    )
