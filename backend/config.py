import os

# Ollama OpenAI-compatible endpoint
VLLM_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3.5:4b")
