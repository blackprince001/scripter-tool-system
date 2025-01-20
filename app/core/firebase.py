import firebase_admin
from firebase_admin import credentials, firestore
from functools import lru_cache
from app.core.config import get_settings

settings = get_settings()


class FirebaseClient:
    def __init__(self):
        self._initialize_app()
        self.db = firestore.client()

    def _initialize_app(self):
        """Initialize Firebase app with credentials"""
        try:
            cred = credentials.Certificate(
                {
                    "type": "service_account",
                    "project_id": "your-project-id",
                    "private_key_id": settings.firebase_api_key,
                    # Add other required credential fields from your service account JSON
                }
            )
            firebase_admin.initialize_app(cred)
        except ValueError:
            pass

    async def get_document(self, collection: str, doc_id: str):
        doc_ref = self.db.collection(collection).document(doc_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None

    async def set_document(self, collection: str, doc_id: str, data: dict):
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


@lru_cache()
def get_firebase_client():
    return FirebaseClient()
