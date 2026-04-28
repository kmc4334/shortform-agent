from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.llm import stream_script

router = APIRouter()

class ContentRequest(BaseModel):
    topic: str
    target: str
    tone: str
    platform: str  # TikTok | YouTube Shorts | Instagram Reels
    duration: int  # seconds
    goal: str
    interests: str
    liked_content: str
    engagement_data: str

@router.post("/generate")
async def generate_content(req: ContentRequest):
    return StreamingResponse(
        stream_script(req.model_dump()),
        media_type="text/event-stream"
    )
