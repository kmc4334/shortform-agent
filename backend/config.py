import os

# vLLM/Ollama OpenAI-compatible endpoint
VLLM_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3.5:4b")

# ffmpeg 경로 (Windows 기본값)
FFMPEG_PATH = os.getenv(
    "FFMPEG_PATH",
    r"C:\Users\pc\Downloads\ffmpeg-2025-09-15-git-16b8a7805b-full_build\ffmpeg-2025-09-15-git-16b8a7805b-full_build\bin\ffmpeg.exe"
)
