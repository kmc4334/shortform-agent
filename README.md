# 숏폼 콘텐츠 생성기

개인 맞춤형 바이럴 숏폼 스크립트를 AI로 자동 생성하는 웹 애플리케이션입니다.

사용자의 주제, 타겟, 톤, 플랫폼 정보를 입력하면 TikTok / YouTube Shorts / Instagram Reels에 최적화된 스크립트를 실시간 스트리밍으로 생성합니다.

---

## 스크린샷

> 좌측 입력 폼 → 우측 실시간 스트리밍 출력

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | FastAPI, Python 3.10+ |
| LLM | Qwen3.5:4b (Ollama) |
| 통신 | Server-Sent Events (SSE) 스트리밍 |

---

## 프로젝트 구조

```
shortform-gen/
├── backend/
│   ├── main.py               # FastAPI 앱 진입점
│   ├── config.py             # Ollama URL, 모델명 설정
│   ├── requirements.txt
│   ├── routers/
│   │   └── generate.py       # POST /api/generate 엔드포인트
│   └── services/
│       └── llm.py            # Ollama 스트리밍 호출 로직
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx           # 메인 페이지
    │   └── globals.css
    ├── components/
    │   ├── InputForm.tsx      # 입력 폼 컴포넌트
    │   └── ScriptOutput.tsx   # 스트리밍 출력 컴포넌트
    └── types/
        └── index.ts           # ContentRequest 타입 정의
```

---

## 사전 요구사항

- [Ollama](https://ollama.com) 설치
- Python 3.10+
- Node.js 18+

---

## 실행 방법

### 1. Ollama 모델 준비

```bash
ollama pull qwen3.5:4b
ollama serve
```

> Ollama는 기본적으로 `http://localhost:11434` 에서 실행됩니다.

### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

---

## 환경변수

백엔드 루트에 `.env` 파일을 생성해 설정을 변경할 수 있습니다.

```env
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=qwen3.5:4b
```

---

## API

### `POST /api/generate`

스크립트를 생성하고 SSE 스트림으로 반환합니다.

**Request Body**

```json
{
  "topic": "다이어트 꿀팁",
  "target": "20대 직장인",
  "tone": "유머러스",
  "platform": "TikTok",
  "duration": 30,
  "goal": "팔로워 증가",
  "interests": "운동, 요리",
  "liked_content": "3분 만에 살 빠지는 법",
  "engagement_data": "저녁 시간대 주로 시청"
}
```

**Response** (SSE)

```
data: {"content": "제목: ..."}
data: {"content": "Hook: ..."}
...
data: [DONE]
```

---

## 지원 플랫폼

- TikTok
- YouTube Shorts
- Instagram Reels

---

## 라이선스

MIT
