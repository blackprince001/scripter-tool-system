from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.router.category import router as category_router
from app.router.generation import router as generation_router
from app.router.stories import router as story_router
from app.router.transcripts import router as transcript_router
from app.router.youtube import router as youtube_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["0.0.0.0"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(story_router)
app.include_router(transcript_router)
app.include_router(generation_router)
app.include_router(category_router)
app.include_router(youtube_router)
