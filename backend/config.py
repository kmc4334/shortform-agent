import os

# vLLM server (ollama compatible OpenAI endpoint)
VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://localhost:8000")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3.5:4b")
