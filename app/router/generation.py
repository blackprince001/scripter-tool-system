import math
import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.chatgpt import ChatGPTClient, get_chatgpt_client
from app.core.firebase import Database, get_firestore_db
from app.core.youtube import YouTubeService, get_youtube_service
from app.schemas.stories import (
    GeneratedStoryResponse,
    StoryGenerationFromTranscriptsRequest,
    StoryGenerationRequest,
    StoryRegenerationFromSynopsis,
)
from app.schemas.transcripts import CategoryWeight

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("/story", response_model=GeneratedStoryResponse)
async def generate_story(
    request: StoryGenerationRequest,
    youtube_service: YouTubeService = Depends(get_youtube_service),
    chatgpt: ChatGPTClient = Depends(get_chatgpt_client),
):
    try:
        category_material = {}
        for category in request.category_weights:
            transcripts = await youtube_service.get_transcripts_by_category(
                category.name, limit=request.material_per_category
            )
            category_material[category.name] = [t.transcript for t in transcripts]

        prompt = await _create_weighted_prompt(
            category_material,
            request.category_weights,
            request.material_per_category,
        )

        variations = await chatgpt.generate_story_variations(
            prompt=prompt,
            variations=request.variations_count,
            style=request.style,
            length=request.length,
        )

        return {
            "variations": variations,
            "prompt": prompt,
            "category_weights": request.category_weights,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/story-from-transcripts", response_model=GeneratedStoryResponse)
async def generate_story_from_transcripts(
    request: StoryGenerationFromTranscriptsRequest,
    db: Database = Depends(get_firestore_db),
    chatgpt: ChatGPTClient = Depends(get_chatgpt_client),
):
    try:
        transcripts = []
        for transcript_id in request.transcript_ids:
            transcript = await db.get_document("transcripts", transcript_id)
            if not transcript:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Transcript {transcript_id} not found",
                )
            transcripts.append(transcript["transcript"])

        combined_text = " ".join(transcripts)
        prompt = f"""
        Create a cohesive story using the following content:
        {combined_text}

        Style: {request.style}
        Length: {request.length} words
        """

        variations = await chatgpt.generate_story_variations(
            prompt=prompt,
            variations=request.variations_count,
            style=request.style,
            length=request.length,
        )

        return {
            "variations": variations,
            "transcript_ids": request.transcript_ids,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/story-from-synopsis", response_model=GeneratedStoryResponse)
async def generated_story_from_synopsis(
    request: StoryRegenerationFromSynopsis,
    db: Database = Depends(get_firestore_db),
    chatgpt: ChatGPTClient = Depends(get_chatgpt_client),
):
    try:
        prompt = f"""
        Create a cohesive story using the following content:
        {request.story}

        Style: {request.style}
        Length: {request.length} words
        """

        variations = await chatgpt.regenerate_from_synopsis(
            prompt=prompt,
            variations=request.variations_count,
            style=request.style,
            length=request.length,
        )

        return {
            "variations": variations,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


async def _create_weighted_prompt(
    material: dict, weights: List[CategoryWeight], material_per_category: int
):
    combined_prompt = []
    size = material_per_category * len(weights)
    for item in weights:
        category, weight = item.name, item.weight
        sample_size = (
            len(material[category])
            if len(material[category]) <= material_per_category
            else math.floor(weight * size) - 1
        )

        combined_prompt.extend(random.sample(material[category], sample_size))
    return " ".join(combined_prompt)
