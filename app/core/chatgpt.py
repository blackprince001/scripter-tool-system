import re
from functools import lru_cache
from typing import List, Optional

from openai import OpenAI

from app.core.config import get_settings

settings = get_settings()


class ChatGPTClient:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.default_model = "gpt-3.5-turbo"

    async def generate_response(
        self,
        messages: List[dict],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ):
        try:
            response = self.client.chat.completions.create(
                model=model or self.default_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return {
                "content": response.choices[0].message.content,
                "total_tokens": response.usage.total_tokens,
            }
        except Exception as e:
            print(f"Error generating ChatGPT response: {e}")
            raise

    async def generate_completion(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ):
        messages = [{"role": "user", "content": prompt}]
        return await self.generate_response(
            messages, model=model, temperature=temperature, max_tokens=max_tokens
        )

    async def generate_category(
        self, text: str, existing_categories: List[str] = [], max_retries: int = 3
    ) -> str:
        category_prompt = f"""Analyze this text and suggest the most appropriate category. 
        {f'Choose from existing categories: {", ".join(existing_categories)}' if existing_categories else 'Create a new concise category name (1 or 2 words)'}
        Respond ONLY with the category name, nothing else.
        Text: {text[:3000]}"""  # Truncate to avoid token limits

        for _ in range(max_retries):
            try:
                response = await self.generate_completion(category_prompt)
                raw_category = response["content"].strip()

                # Clean and validate response
                clean_category = (
                    re.sub(r"[^a-zA-Z0-9\s]", "", raw_category).strip().title()
                )
                if len(clean_category) < 3 or len(clean_category) > 35:
                    continue

                return clean_category

            except Exception:
                continue

        return "Uncategorized"

    async def generate_story_variations(
        self, prompt: str, variations: int = 3, style: str = "professional"
    ):
        system_message = f"""You are a professional writer creating {variations} story variations.
        Style: {style}
        Each variation should be distinct but based on the same source material."""

        response = await self.generate_response(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt},
            ],
            temperature=0.9,  # Higher creativity
            max_tokens=2000,
        )

        # Parse response into variations (implementation depends on your preferred format)
        return self._parse_variations(response["content"])

    def _parse_variations(self, content: str):
        # Implement parsing logic based on your ChatGPT response format
        # Example: Split by "Variation X:" markers
        return [v.strip() for v in content.split("Variation") if v.strip()]


@lru_cache()
def get_chatgpt_client():
    return ChatGPTClient()
