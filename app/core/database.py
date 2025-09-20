"""
Database service for Prisma integration with channel management project
"""

from typing import Optional

from pydantic import BaseModel

from prisma import Prisma


class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    author_id: int
    assignee_id: int
    story_id: Optional[str] = None


class DatabaseService:
    def __init__(self):
        self.prisma = Prisma()

    async def connect(self):
        """Connect to the database"""
        await self.prisma.connect()

    async def disconnect(self):
        """Disconnect from the database"""
        await self.prisma.disconnect()

    async def create_task(self, task_data: TaskCreateRequest):
        """Create a new task in the channel management project"""
        try:
            task = await self.prisma.task.create(
                data={
                    "title": task_data.title,
                    "description": task_data.description,
                    "projectId": task_data.project_id,
                    "authorId": task_data.author_id,
                    "assigneeId": task_data.assignee_id,
                    "storyId": task_data.story_id,
                    "status": "pending",
                }
            )
            return task
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")

    async def get_project_by_slug(self, slug: str):
        """Get a project by its slug"""
        try:
            project = await self.prisma.project.find_unique(where={"slug": slug})
            return project
        except Exception as e:
            raise Exception(f"Failed to get project: {str(e)}")

    async def get_user_by_username(self, username: str):
        """Get a user by username"""
        try:
            user = await self.prisma.user.find_unique(where={"username": username})
            return user
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")

    async def get_task_by_story_id(self, story_id: str):
        """Get a task by story ID"""
        try:
            task = await self.prisma.task.find_first(where={"storyId": story_id})
            return task
        except Exception as e:
            raise Exception(f"Failed to get task by story ID: {str(e)}")


# Global database service instance
_db_service: Optional[DatabaseService] = None


async def get_database_service() -> DatabaseService:
    """Get the global database service instance"""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
        await _db_service.connect()
    return _db_service


async def close_database_connection():
    """Close the database connection"""
    global _db_service
    if _db_service:
        await _db_service.disconnect()
        _db_service = None
