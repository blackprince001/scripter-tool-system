import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status

from app.core.youtube import YouTubeService, get_youtube_service
from app.schemas.transcripts import (
    BatchProcessRequest,
    BatchProcessResponse,
    BatchStatusResponse,
    CategoryMaterialResponse,
    ProcessingStatus,
    TranscriptProcessResponse,
    TranscriptResponse,
)

router = APIRouter(prefix="/transcripts", tags=["transcripts"])

# In-memory storage for batch processing (in production, use Redis or database)
batch_storage = {}


@router.post("/process", response_model=TranscriptProcessResponse)
async def process_youtube_video(
    url: str = Query(..., description="YouTube video URL"),
    category: Optional[str] = Query(None),
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


@router.post("/batch-process", response_model=BatchProcessResponse)
async def batch_process_videos(
    request: BatchProcessRequest,
    background_tasks: BackgroundTasks,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        batch_id = str(uuid.uuid4())

        # Initialize batch status
        batch_status = BatchStatusResponse(
            batch_id=batch_id,
            status=ProcessingStatus.PENDING,
            total_videos=len(request.videos),
            processed_count=0,
            failed_count=0,
            videos=request.videos,
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat(),
        )

        batch_storage[batch_id] = batch_status

        # Start background processing
        background_tasks.add_task(
            process_videos_background, batch_id, request, youtube_service
        )

        return BatchProcessResponse(
            batch_id=batch_id,
            total_videos=len(request.videos),
            processed_count=0,
            failed_count=0,
            videos=request.videos,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/batch-status/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str):
    if batch_id not in batch_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found"
        )

    return batch_storage[batch_id]


async def process_videos_background(
    batch_id: str, request: BatchProcessRequest, youtube_service: YouTubeService
):
    """Background task to process videos in batch"""
    batch_status = batch_storage[batch_id]
    batch_status.status = ProcessingStatus.PROCESSING
    batch_status.updated_at = datetime.utcnow().isoformat()

    for video_item in batch_status.videos:
        try:
            video_item.status = ProcessingStatus.PROCESSING
            batch_status.updated_at = datetime.utcnow().isoformat()

            # Construct YouTube URL from video_id
            youtube_url = f"https://www.youtube.com/watch?v={video_item.video_id}"

            # Process the video
            result = await youtube_service.process_youtube_video(
                youtube_url,
                category=video_item.category or request.default_category,
                auto_categorize=request.auto_categorize,
            )

            video_item.status = ProcessingStatus.COMPLETED
            # result may be a dict, so use .get() to access 'category' safely
            video_item.category = (
                result.get("category")
                if isinstance(result, dict)
                else getattr(result, "category", None)
            )
            batch_status.processed_count += 1

        except Exception as e:
            video_item.status = ProcessingStatus.FAILED
            video_item.error_message = str(e)
            batch_status.failed_count += 1

        batch_status.updated_at = datetime.utcnow().isoformat()

    # Mark batch as completed
    batch_status.status = ProcessingStatus.COMPLETED
    batch_status.updated_at = datetime.utcnow().isoformat()


@router.get("/{video_id}", response_model=TranscriptResponse)
async def get_transcript(
    video_id: str,
    category: str,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    transcript = await youtube_service.get_transcript(video_id, category)
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    return transcript


@router.get("/by-category/{category}", response_model=CategoryMaterialResponse)
async def get_category_material(
    category: str,
    limit: int = 20,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        result = await youtube_service.get_transcripts_by_category(category, limit)
        return CategoryMaterialResponse(
            category=category,
            total_transcripts=len(result),
            material=[t.transcript for t in result],
            video_ids=[t.video_id for t in result],
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{video_id}")
async def delete_transcript(
    video_id: str,
    category: str,
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        # Delete from both collections
        await youtube_service.delete_transcript(video_id, category)
        return {"message": "Transcript deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
