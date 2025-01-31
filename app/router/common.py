from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.config import get_settings
from app.core.firebase import App, get_firebase_client
from app.core.youtube import YouTubeService, get_youtube_service
from app.schemas.common import ChannelVideosResponse

router = APIRouter(prefix="", tags=["common"])


@router.get(
    "/youtube/channel/{channel_id}/videos", response_model=ChannelVideosResponse
)
async def get_channel_videos(
    channel_id: str,
    max_results: int = Query(50, ge=1, le=50),
    order: str = Query("date", enum=["date", "viewCount", "rating"]),
    youtube_service: YouTubeService = Depends(get_youtube_service),
):
    try:
        videos = await youtube_service.get_channel_videos(
            channel_id=channel_id, max_results=max_results, order=order
        )
        return {"channel_id": channel_id, "total_videos": len(videos), "videos": videos}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/settings")
async def main():
    return {"message": "Hello World", "settings": get_settings().model_dump()}


@router.get("/firebase")
async def firebase_settings(firebase_client: App = Depends(get_firebase_client)):
    return {"firebase_client_name": firebase_client.project_id}
