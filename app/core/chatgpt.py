from openai import OpenAI
from typing import List, Optional
from functools import lru_cache
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


@lru_cache()
def get_chatgpt_client():
    return ChatGPTClient()
