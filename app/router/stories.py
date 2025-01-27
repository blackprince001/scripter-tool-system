from fastapi import APIRouter, Depends, HTTPException, status

from app.core.firebase import Database, get_firestore_db
from app.models.stories import Story, StoryUpdate
from app.schemas.stories import StoryResponse

router = APIRouter(prefix="/stories", tags=["stories"])


@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(story: Story, db: Database = Depends(get_firestore_db)):
    try:
        await db.set_document("stories", story.id, story.model_dump(by_alias=True))
        return story
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str, db: Database = Depends(get_firestore_db)):
    story_data = await db.get_document("stories", story_id)
    if not story_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Story not found"
        )
    return Story(**story_data)


@router.put("/{story_id}", response_model=StoryResponse)
async def update_story(
    story_id: str, update_data: StoryUpdate, db: Database = Depends(get_firestore_db)
):
    existing = await db.get_document("stories", story_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Story not found"
        )

    updated_story = Story(**existing).model_copy(
        update=update_data.model_dump(exclude_unset=True)
    )
    await db.set_document("stories", story_id, updated_story.model_dump(by_alias=True))
    return updated_story


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story(story_id: str, db: Database = Depends(get_firestore_db)):
    success = await db.delete_document("stories", story_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Story not found"
        )
    return
