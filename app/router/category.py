from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.firebase import Database, get_firestore_db
from app.schemas.transcripts import CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Database = Depends(get_firestore_db)):
    try:
        categories = await db.query_collection(
            "categories", field="name", operator="!=", value=""
        )
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
