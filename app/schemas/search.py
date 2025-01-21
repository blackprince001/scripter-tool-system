from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SimilaritySearch(BaseModel):
    """Schema for similarity search"""

    reference_text: str
    category_weights: Optional[Dict[str, float]] = None
    user_id: Optional[str] = None
    limit: Optional[int] = Field(default=5, gt=0, le=100)


class SimilarTranscriptResponse(BaseModel):
    """Schema for similar transcript response"""

    transcript_id: str
    video_title: str
    categories: List[str]
    similarity_score: float
    embedding_similarity: float


class SimilaritySearchResponse(BaseModel):
    """Schema for similarity search response"""

    similar_transcripts: List[SimilarTranscriptResponse]
    total_results: int
