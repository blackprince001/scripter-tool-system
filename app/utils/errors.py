from fastapi.exception_handlers import HTTPException


class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, error_code: str, message: str, details: str | None = None):
        super().__init__(
            status_code=status_code,
            detail=ErrorResponse(
                error_code=error_code,
                message=message,
                details=details,
            ).dict(),
        )


class NoVideoFoundError(CustomHTTPException):
    pass


class NoChannelFoundError(CustomHTTPException):
    pass
