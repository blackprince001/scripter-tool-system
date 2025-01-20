from pydantic import Field
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    firebase_api_key: str = Field(alias="firebase_api_key")
    openai_api_key: str = Field(alias="openai_api_key")
    youtube_api_key: str = Field(alias="youtube_api_key")

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache
def get_settings():
    return Settings()
