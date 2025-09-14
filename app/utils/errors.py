from fastapi.exception_handlers import HTTPException
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: str


class CustomHTTPException(HTTPException):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: str = "",
    ):
        super().__init__(
            status_code=status_code,
            detail=ErrorResponse(
                error_code=error_code,
                message=message,
                details=details,
            ).model_dump(),
        )


class NoVideoFoundError(CustomHTTPException):
    pass


class NoChannelFoundError(CustomHTTPException):
    pass
