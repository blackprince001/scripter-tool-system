import logging
import re
from functools import lru_cache
from typing import List, Optional, Tuple

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled

from app.core.chatgpt import get_chatgpt_client
from app.core.config import get_settings
from app.core.firebase import get_firestore_db
from app.models.transcript import Transcript
from app.utils.errors import CustomHTTPException, NoChannelFoundError, NoVideoFoundError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class YouTubeService:
    def __init__(self):
        self.settings = get_settings()
        self.ChatGPTClient = get_chatgpt_client()
        self.db = get_firestore_db()  # Firebase Firestore database instance

    async def get_channel_videos(self, channel_id: str) -> List[Tuple[str, str]]:
        youtube = build("youtube", "v3", developerKey=self.settings.youtube_api_key)
        video_data = []
        next_page_token = None

        try:
            while True:
                request = youtube.search().list(
                    part="id,snippet",
                    channelId=channel_id,
                    maxResults=50,
                    pageToken=next_page_token,
                    type="video",
                    order="date",  # Get most recent videos first
                )
                response = request.execute()

                if not response.get("items"):
                    raise NoChannelFoundError(
                        status_code=404,
                        error_code="no_channel_found",
                        message="Channel not found or has no videos",
                    )

                video_data.extend(
                    [
                        (item["id"]["videoId"], item["snippet"]["title"])
                        for item in response["items"]
                    ]
                )

                next_page_token = response.get("nextPageToken")
                if not next_page_token:
                    break

            return video_data

        except HttpError as e:
            logger.error(f"YouTube API error: {str(e)}")
            raise CustomHTTPException(
                status_code=e.status_code,
                error_code="youtube_api_error",
                message="YouTube API request failed",
                details=str(e),
            )

    @staticmethod
    def extract_video_id(url: str) -> str:
        patterns = [
            r"v=([a-zA-Z0-9_-]{11})",  # Standard URL
            r"youtu\.be/([a-zA-Z0-9_-]{11})",  # Short URL
            r"embed/([a-zA-Z0-9_-]{11})",  # Embed URL
            r"live/([a-zA-Z0-9_-]{11})\??",  # Live URL
            r"/([a-zA-Z0-9_-]{11})/watch\?",  # Alternative format
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)

        raise NoVideoFoundError(
            status_code=400,
            error_code="invalid_url",
            message="Invalid YouTube URL format",
            details="Could not extract video ID from provided URL",
        )

    async def get_video_transcript(
        self, video_id: str, languages: List[str] = ["en"]
    ) -> Optional[str]:
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

            try:
                transcript = transcript_list.find_manually_created_transcript(languages)
            except:  # noqa: E722
                transcript = transcript_list.find_generated_transcript(languages)

            transcript_text = " ".join([entry["text"] for entry in transcript.fetch()])
            return transcript_text

        except (TranscriptsDisabled, NoTranscriptFound):
            logger.warning(f"No transcript available for video {video_id}")
            return None
        except Exception as e:
            logger.error(f"Transcript retrieval failed for {video_id}: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                error_code="transcript_error",
                message="Failed to retrieve transcript",
                details=str(e),
            )

    async def save_transcript(
        self,
        video_id: str,
        video_title: str,
        transcript: str,
        category: str,
        metadata: Optional[dict] = None,
    ) -> str:
        if not category:
            raise ValueError("Category is required for transcript organization")

        sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())
        collection_name = f"transcripts_{sanitized_category}"
        doc_id = f"{video_id}_{sanitized_category}_transcript"

        # Create Transcript model instance
        transcript_data = Transcript(
            video_id=video_id,
            title=video_title,
            transcript=transcript,
            category=category,
            sanitized_category=sanitized_category,
            metadata=metadata or {},
            created_at=self.db.get_timestamp(),
        )

        try:
            # Save to category-specific collection
            await self.db.set_document(
                collection=collection_name,
                doc_id=doc_id,
                data=transcript_data.model_dump(by_alias=True),
            )

            # Save reference to main collection
            await self.db.set_document(
                collection="transcripts",
                doc_id=doc_id,
                data={
                    **transcript_data.model_dump(by_alias=True),
                    "collection_ref": collection_name,
                },
            )

            logger.info(f"Transcript saved for video {video_id} in category {category}")
            return doc_id

        except Exception as e:
            logger.error(f"Firestore save failed: {str(e)}")
            raise CustomHTTPException(
                status_code=500,
                error_code="firestore_error",
                message="Failed to save transcript",
                details=str(e),
            )

    async def get_transcript(
        self, video_id: str, category: Optional[str] = None
    ) -> Optional[Transcript]:
        if category:
            sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())
            collection_name = f"transcripts_{sanitized_category}"
            doc_id = f"{video_id}_{sanitized_category}_transcript"
            doc_data = await self.db.get_document(collection_name, doc_id)
        else:
            # Search across all collections using reference collection
            result = await self.db.query_collection(
                collection="transcripts",
                field="video_id",
                operator="==",
                value=video_id,
            )
            doc_data = result[0] if result else None

        return Transcript(**doc_data) if doc_data else None

    async def process_youtube_video(
        self, url: str, category: Optional[str] = None, auto_categorize: bool = True
    ) -> dict:
        try:
            video_id = self.extract_video_id(url)
            transcript = await self.get_video_transcript(video_id)

            if not transcript:
                raise NoVideoFoundError(
                    status_code=404,
                    error_code="no_transcript",
                    message="No transcript available for this video",
                )

            # Generate category if not provided
            if not category and auto_categorize:
                existing_categories = await self.get_existing_categories()
                category = await self.ChatGPTClient.generate_category(
                    transcript, existing_categories=existing_categories
                )

            # Rest of processing remains the same
            video_info = await self.get_video_info(video_id)
            await self.save_transcript(
                video_id=video_id,
                video_title=video_info["title"],
                transcript=transcript,
                category=category,
                metadata={
                    "auto_generated_category": auto_categorize and not bool(category)
                },
            )

            return {
                "status": "success",
                "video_id": video_id,
                "category": category,
                "auto_generated": auto_categorize and not bool(category),
            }

        except Exception as e:
            logger.error(f"Video processing failed: {str(e)}")
            raise

    async def get_transcripts_by_category(self, category: str, limit: int = 20):
        sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())
        collection_name = f"transcripts_{sanitized_category}"

        try:
            docs = self.db.collection(collection_name).limit(limit).stream()
            return [Transcript(**doc.to_dict()) for doc in docs]
        except Exception as e:
            logger.error(f"Error getting transcripts: {str(e)}")
            raise

    async def get_existing_categories(self) -> List[str]:
        """Get list of existing categories from Firestore"""
        try:
            collections = self.db.collections()
            return [
                col.id.replace("transcripts_", "")
                for col in collections
                if col.id.startswith("transcripts_")
            ]
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return []

    async def get_video_info(self, video_id: str) -> dict:
        youtube = build("youtube", "v3", developerKey=self.settings.youtube_api_key)

        try:
            request = youtube.videos().list(part="snippet", id=video_id)
            response = request.execute()
            snippet = response["items"][0]["snippet"]

            return {
                "title": snippet["title"],
                "channel_id": snippet["channelId"],
                "channel_title": snippet["channelTitle"],
            }
        except (KeyError, IndexError):
            raise NoVideoFoundError(
                status_code=404,
                error_code="video_not_found",
                message="Could not retrieve video information",
            )
        except HttpError as e:
            raise CustomHTTPException(
                status_code=e.status_code,
                error_code="youtube_api_error",
                message="Failed to retrieve video details",
                details=str(e),
            )


@lru_cache
def get_youtube_service() -> YouTubeService:
    return YouTubeService()
