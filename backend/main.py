import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generate, video

app = FastAPI(title="ShortForm Content Generator")

# 환경변수 ALLOWED_ORIGINS 에 콤마 구분으로 추가 도메인 설정 가능
_extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://shortform-agent.vercel.app",
        *_extra_origins,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
app.include_router(video.router, prefix="/api")
