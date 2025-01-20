from pydantic import BaseModel
from typing import List, Optional


class YouTubeVideoProcess(BaseModel):
    url: str
    user_id: str
    categories: List[str]


class YouTubeChannelProcess(BaseModel):
    channel_id: str
    user_id: str
    categories: List[str]
    process_transcripts: bool = True
