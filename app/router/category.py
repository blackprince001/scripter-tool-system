from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.core.firebase import FirestoreDatabase
from app.models.transcript import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: FirestoreDatabase):
    try:
        category_data = {
            "name": category.name,
            "description": category.description,
            "processing_rules": category.processing_rules,
            "created_at": datetime.utcnow().isoformat(),
        }
        await db.set_document("categories", category.name.lower(), category_data)
        return category_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: FirestoreDatabase):
    try:
        categories = await db.query_collection(
            "categories", field="name", operator="!=", value=""
        )
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
