from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.router.types import RouterTag
from app.core.config import get_settings

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["0.0.0.0"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=[RouterTag.ROOT.value])
async def main():
    return {"message": "Hello World", "settings": get_settings().model_dump()}
