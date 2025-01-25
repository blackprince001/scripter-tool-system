from typing import List

from pydantic import BaseModel


class VideoDetails(BaseModel):
    video_id: str
    title: str
    published_at: str
    thumbnail: str


class ChannelVideosResponse(BaseModel):
    channel_id: str
    total_videos: int
    videos: List[VideoDetails]
