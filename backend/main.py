import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generate, video

app = FastAPI(title="ShortForm Content Generator")

# 환경변수로 허용 origin 추가
# Railway 환경변수 ALLOWED_ORIGINS 에 콤마 구분으로 Vercel URL 입력
# 예: https://your-app.vercel.app,https://your-custom-domain.com
_extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        *_extra_origins,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
app.include_router(video.router, prefix="/api")
