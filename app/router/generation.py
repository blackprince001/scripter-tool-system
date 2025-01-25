# app/router/generation.py
import random
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.chatgpt import ChatGPTClient, get_chatgpt_client
from app.core.youtube import YouTubeService, get_youtube_service
from app.models.stories import StoryGenerationRequest, StoryResponse
from app.models.transcript import CategoryWeight

router = APIRouter(prefix="/generate", tags=["generation"])


@router.post("/story", response_model=StoryResponse)
async def generate_story(
    request: StoryGenerationRequest,
    youtube_service: YouTubeService = Depends(get_youtube_service),
    chatgpt: ChatGPTClient = Depends(get_chatgpt_client),
):
    try:
        # 1. Get material from selected categories
        category_material = {}
        for category in request.category_weights:
            transcripts = await youtube_service.get_transcripts_by_category(
                category.name, limit=request.material_per_category
            )
            category_material[category.name] = [t.transcript for t in transcripts]

        # 2. Create weighted prompt
        prompt = await _create_weighted_prompt(
            category_material, request.category_weights
        )

        # 3. Generate story variations
        variations = await chatgpt.generate_story_variations(
            prompt=prompt, variations=request.variations_count, style=request.style
        )

        # 4. Store generated stories and return them
        return {
            "variations": variations,
            "prompt": prompt,
            "category_weights": request.category_weights,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


async def _create_weighted_prompt(material: dict, weights: List[CategoryWeight]):
    # Implement your custom logic to combine materials based on weights
    # This could use different algorithms for content mixing
    combined_prompt = []
    for category, weight in weights.items():
        sample_size = int(weight * 10)  # Example weighting algorithm
        combined_prompt.extend(random.sample(material[category], sample_size))
    return " ".join(combined_prompt)
