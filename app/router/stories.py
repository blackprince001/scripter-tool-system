from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.database import DatabaseService, TaskCreateRequest, get_database_service
from app.core.firebase import Database, get_firestore_db
from app.models.stories import (
    Story,
    StoryCreate,
    StoryFinalizeRequest,
    StoryStatus,
    StoryUpdate,
)
from app.schemas.stories import StoryResponse


class ProjectResponse(BaseModel):
    id: int
    name: str
    slug: str


class UserResponse(BaseModel):
    id: int
    username: str


router = APIRouter(prefix="/stories", tags=["stories"])


@router.post("/", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(story: StoryCreate, db: Database = Depends(get_firestore_db)):
    try:
        new_story = Story(
            title=story.title,
            content=story.content,
            project_id=story.project_id,
            created_at=datetime.utcnow(),
            updated_at=None,
        )
        await db.set_document("stories", new_story.id, new_story.model_dump())
        return new_story
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


@router.post("/{story_id}/finalize", response_model=StoryResponse)
async def finalize_story(
    story_id: str,
    finalize_request: StoryFinalizeRequest,
    db: Database = Depends(get_firestore_db),
    db_service: DatabaseService = Depends(get_database_service),
):
    """Finalize a story and create a task in the channel management project"""
    try:
        # Get the story
        story_data = await db.get_document("stories", story_id)
        if not story_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Story not found"
            )

        story = Story(**story_data)

        # Check if story is already finalized
        if story.status == StoryStatus.FINALIZED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Story is already finalized",
            )

        # Get the project
        project = await db_service.get_project_by_slug(finalize_request.project_slug)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )

        # Get the assignee user
        assignee = await db_service.get_user_by_username(
            finalize_request.assignee_username
        )
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Assignee user not found"
            )

        # Create task in the channel management project
        task_data = TaskCreateRequest(
            title=finalize_request.task_title or f"Story: {story.title}",
            description=finalize_request.task_description or story.content[:500] + "..."
            if len(story.content) > 500
            else story.content,
            project_id=project.id,
            author_id=1,  # Default author - you might want to get this from authentication
            assignee_id=assignee.id,
            story_id=story.id,
        )

        await db_service.create_task(task_data)

        # Update story status to finalized
        updated_story = story.model_copy(
            update={
                "status": StoryStatus.FINALIZED,
                "project_id": project.id,
                "updated_at": datetime.utcnow(),
            }
        )

        await db.set_document("stories", story_id, updated_story.model_dump())

        return updated_story

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to finalize story: {str(e)}",
        )


@router.get("/projects", response_model=list[ProjectResponse])
async def get_projects(db_service: DatabaseService = Depends(get_database_service)):
    """Get all available projects"""
    try:
        projects = await db_service.prisma.project.find_many()
        return [
            ProjectResponse(id=project.id, name=project.name, slug=project.slug)
            for project in projects
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}",
        )


@router.get("/users", response_model=list[UserResponse])
async def get_users(db_service: DatabaseService = Depends(get_database_service)):
    """Get all available users"""
    try:
        users = await db_service.prisma.user.find_many()
        return [UserResponse(id=user.id, username=user.username) for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}",
        )
