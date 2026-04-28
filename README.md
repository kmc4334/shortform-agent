# 숏폼 콘텐츠 생성기

개인 맞춤형 바이럴 숏폼 스크립트 자동 생성 웹앱

## 스택
- Frontend: Next.js 14 (App Router + Tailwind CSS)
- Backend: FastAPI
- LLM: Qwen3.5:4b via vLLM

## 실행 방법

### 1. vLLM 서버 시작
```bash
python -m vllm.entrypoints.openai.api_server \
  --model qwen3.5:4b \
  --port 8000
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 환경변수 (backend/.env)
```
VLLM_BASE_URL=http://localhost:8000
MODEL_NAME=qwen3.5:4b
```
