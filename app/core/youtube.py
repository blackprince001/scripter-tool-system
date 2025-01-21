import re

from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi

from firebase_admin import firestore
from app.core.firebase import get_firebase_client
from typing import Optional


async def get_channel_videos(api_key, channel_id):
    youtube = build("youtube", "v3", developerKey=api_key)
    video_data = []  # List to store video IDs and titles
    next_page_token = None

    while True:
        request = youtube.search().list(
            part="id,snippet",
            channelId=channel_id,
            maxResults=50,
            pageToken=next_page_token,
            type="video",
        )
        response = request.execute()

        for item in response["items"]:
            video_id = item["id"]["videoId"]
            video_title = item["snippet"]["title"]
            video_data.append((video_id, video_title))

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return video_data


def extract_youtube_video_id(url: str):
    standard_pattern = re.compile(r"v=([a-zA-Z0-9_-]+)")
    short_pattern = re.compile(r"youtu\.be/([a-zA-Z0-9_-]+)")
    embed_pattern = re.compile(r"embed/([a-zA-Z0-9_-]+)")

    match = standard_pattern.search(url)
    if match:
        return match.group(1)

    match = short_pattern.search(url)
    if match:
        return match.group(1)

    match = embed_pattern.search(url)
    if match:
        return match.group(1)
    return None


async def get_video_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([entry["text"] for entry in transcript])
        return transcript_text
    except Exception as e:
        print(f"Error fetching transcript for video {video_id}: {e}")
        return None


async def save_transcript(
    video_id: str,
    video_title: str,
    transcript: str,
    category: str,
    metadata: Optional[dict] = None,
) -> str:
    sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())

    firebase_client = get_firebase_client()

    doc_data = {
        "video_id": video_id,
        "title": video_title,
        "transcript": transcript,
        "category": category,  # Store original category name
        "sanitized_category": sanitized_category,
        "created_at": firestore.SERVER_TIMESTAMP,
        "metadata": metadata or {},
    }

    try:
        collection_name = f"transcripts_{sanitized_category}"
        doc_id = f"{video_id}_transcript"

        await firebase_client.set_document(
            collection=collection_name, doc_id=doc_id, data=doc_data
        )

        await firebase_client.set_document(
            collection="transcripts",
            doc_id=doc_id,
            data={**doc_data, "collection_ref": collection_name},
        )

        print(
            f"Transcript saved to Firebase for video {video_id}: "
            f"{video_title} (Category: {category})"
        )

        return doc_id

    except Exception as e:
        print(f"Error saving transcript to Firebase: {e}")
        raise


# Helper function to retrieve transcripts
async def get_transcript(
    video_id: str, category: Optional[str] = None
) -> Optional[dict]:
    """
    Retrieve a transcript from Firebase

    Args:
        video_id: YouTube video ID
        category: Optional category to look in specific collection

    Returns:
        dict: Transcript document data or None if not found
    """
    firebase_client = get_firebase_client()
    doc_id = f"{video_id}_transcript"

    if category:
        # Look in specific category collection
        sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())
        collection_name = f"transcripts_{sanitized_category}"
        return await firebase_client.get_document(collection_name, doc_id)
    else:
        # Look in main transcripts collection
        return await firebase_client.get_document("transcripts", doc_id)


# Helper function to list transcripts by category
async def list_firebase_transcripts(category: Optional[str] = None) -> list:
    firebase_client = get_firebase_client()

    if category:
        sanitized_category = re.sub(r"[^a-zA-Z0-9_]", "_", category.lower())
        return await firebase_client.query_collection(
            collection="transcripts",
            field="sanitized_category",
            operator="==",
            value=sanitized_category,
        )
    else:
        # Get all transcripts
        docs = await firebase_client.query_collection(
            collection="transcripts", field="created_at", operator="!=", value=None
        )
        return docs
