from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.firebase import App, get_firebase_client

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["0.0.0.0"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/settings", tags=["root"])
async def main():
    return {"message": "Hello World", "settings": get_settings().model_dump()}


@app.get("/firebase", tags=["root"])
async def firebase_settings(firebase_client: App = Depends(get_firebase_client)):
    return {"firebase_client_name": firebase_client.project_id}
