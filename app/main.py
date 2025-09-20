from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import close_database_connection
from app.router.category import router as category_router
from app.router.common import router as common_router
from app.router.generation import router as generation_router
from app.router.stories import router as story_router
from app.router.transcripts import router as transcript_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    await close_database_connection()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(story_router)
app.include_router(transcript_router)
app.include_router(generation_router)
app.include_router(category_router)
app.include_router(common_router)
