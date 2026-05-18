from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generate, video

app = FastAPI(title="ShortForm Content Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://shortform-agent.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
app.include_router(video.router, prefix="/api")
