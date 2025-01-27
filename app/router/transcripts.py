from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.youtube import YouTubeService, get_youtube_service
from app.schemas.transcripts import (
    CategoryMaterialResponse,
    TranscriptProcessResponse,
    TranscriptResponse,
)

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


@router.post("/process", response_model=TranscriptProcessResponse)
async def process_youtube_video(
    url: str,
    category: Optional[str] = None,
    auto_categorize: bool = Query(True, description="Enable AI category generation"),
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        result = await youtube_service.process_youtube_video(
            url, category=category, auto_categorize=auto_categorize
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{video_id}", response_model=TranscriptResponse)
async def get_transcript(
    video_id: str,
    category: str = None,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    transcript = await youtube_service.get_transcript(video_id, category)
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    return transcript


@router.get("/search/{query}", response_model=list[TranscriptResponse])
async def search_transcripts(
    query: str,
    category: str = None,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    # This would need implementation of a search method in YouTubeService
    # using Firestore's search capabilities
    raise NotImplementedError("Search functionality not yet implemented")


@router.get("/search/semantic/{query}", response_model=list[TranscriptResponse])
async def search_transcript_by_embedding(
    query: str,
    category: str = None,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    # This would need implementation of a search method in YouTubeService
    # using Firestore's search capabilities
    raise NotImplementedError("Search functionality not yet implemented")


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transcript(
    video_id: str,
    category: str,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        transcript = await youtube_service.get_transcript(video_id, category)
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

        await youtube_service.db.delete_document(
            transcript.collection_ref, transcript.id
        )
        await youtube_service.db.delete_document("transcripts", transcript.id)
        return
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/by-category/{category}", response_model=CategoryMaterialResponse)
async def get_category_material(
    category: str,
    limit: int = 20,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        transcripts = await youtube_service.get_transcripts_by_category(category, limit)
        return {
            "category": category,
            "total_transcripts": len(transcripts),
            "material": [t.transcript for t in transcripts],
            "video_ids": [t.video_id for t in transcripts],
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
