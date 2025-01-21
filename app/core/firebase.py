from functools import lru_cache
from pathlib import Path
from typing import Annotated, Optional

from fastapi import Depends
from firebase_admin import App, credentials, firestore, get_app, initialize_app

from app.core.config import get_settings

settings = get_settings()

config_path = Path.cwd() / settings.firebase_config_file

cred = credentials.Certificate(config_path)
firebase_app = initialize_app(cred)


class Database:
    def __init__(self):
        self.db = firestore.client()

    async def get_document(self, collection: str, doc_id: str) -> Optional[dict]:
        doc_ref = self.db.collection(collection).document(doc_id)
        doc = doc_ref.get()

        return doc.to_dict() if doc.exists else None

    async def set_document(self, collection: str, doc_id: str, data: dict) -> bool:
        doc_ref = self.db.collection(collection).document(doc_id)
        doc_ref.set(data)

        return True

    async def update_document(self, collection: str, doc_id: str, data: dict):
        doc_ref = self.db.collection(collection).document(doc_id)
        doc_ref.update(data)
        return True

    async def delete_document(self, collection: str, doc_id: str):
        doc_ref = self.db.collection(collection).document(doc_id)
        doc_ref.delete()
        return True

    async def query_collection(
        self, collection: str, field: str, operator: str, value: any
    ):
        docs = self.db.collection(collection).where(field, operator, value).stream()
        return [doc.to_dict() for doc in docs]


@lru_cache
def get_firebase_client() -> App:
    return get_app()


@lru_cache
def get_firestore_db():
    return Database


FirestoreDatabase = Annotated[Database, Depends(get_firestore_db)]
