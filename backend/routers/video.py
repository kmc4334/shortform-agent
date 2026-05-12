from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.video import generate_video
import os

router = APIRouter()

class VideoRequest(BaseModel):
    script: str
    duration: int = 30
    voice_style: str = "normal"
    font_size: int = 58  # 자막 크기 (24~120)

VOICE_PRESETS = {
    "normal":    {"rate": 160, "volume": 1.0},
    "fast":      {"rate": 210, "volume": 1.0},
    "slow":      {"rate": 110, "volume": 0.9},
    "energetic": {"rate": 190, "volume": 1.0},
    "calm":      {"rate": 130, "volume": 0.85},
}

@router.post("/video")
async def create_video(req: VideoRequest):
    try:
        preset = VOICE_PRESETS.get(req.voice_style, VOICE_PRESETS["normal"])
        video_path = await generate_video(
            req.script,
            req.duration,
            rate=preset["rate"],
            volume=preset["volume"],
            font_size=max(24, min(120, req.font_size)),
        )
        return {"video_path": video_path, "filename": os.path.basename(video_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video/{filename}")
async def download_video(filename: str):
    path = f"outputs/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    return FileResponse(path, media_type="video/mp4", filename=filename)
