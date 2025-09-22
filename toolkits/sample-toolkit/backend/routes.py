"""Sample FastAPI router used to showcase backend integration."""
from fastapi import APIRouter

router = APIRouter(prefix="/toolkits/sample", tags=["sample-toolkit"])


@router.get("/health")
async def get_health() -> dict[str, str]:
    """Return a static response so operators can verify installation."""
    return {"status": "ok", "message": "Sample toolkit is installed."}
