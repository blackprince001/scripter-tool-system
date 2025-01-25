from typing import List

from pydantic import BaseModel


class EmbeddingRequest(BaseModel):
    text: str
    model: str = "text-embedding-3-small"
    dimensions: int = 1536


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model: str
    dimensions: int
