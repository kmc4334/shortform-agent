# 숏폼 콘텐츠 생성기

AI 기반 개인 맞춤형 바이럴 숏폼 스크립트 자동 생성 및 영상 제작 웹 애플리케이션

사용자의 주제, 타겟, 톤, 플랫폼 정보를 입력하면 TikTok / YouTube Shorts / Instagram Reels에 최적화된 스크립트를 실시간으로 생성하고, TTS 음성과 한글 자막이 포함된 세로형 영상(1080×1920)을 자동으로 만들어줍니다.

---

## 주요 기능

- **AI 스크립트 생성** — Qwen3.5:4b 모델로 바이럴 숏폼 스크립트 실시간 스트리밍 생성
- **플랫폼 최적화** — TikTok / YouTube Shorts / Instagram Reels 맞춤 출력
- **TTS 영상 생성** — 스크립트를 음성으로 변환 후 자막 영상 자동 제작
- **타임라인 자막** — 대사 하나씩 순서대로 나타나는 편집 효과
- **음성 스타일 선택** — 기본 / 활기차게 / 빠르게 / 천천히 / 잔잔하게 (5가지)
- **자막 크기 조절** — 28px ~ 100px 슬라이더로 실시간 조절
- **스크립트 파싱** — 레이블(`제목:`, `Hook:` 등) 자동 제거, 순수 대사만 TTS/자막에 사용
- **영상 다운로드** — 생성된 MP4 파일 바로 다운로드

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backend | FastAPI, Python 3.10+ |
| LLM | Qwen3.5:4b (Ollama) |
| TTS | pyttsx3 (Windows SAPI, 오프라인) |
| 영상 합성 | ffmpeg, Pillow |
| 통신 | Server-Sent Events (SSE) 스트리밍 |

---

## 프로젝트 구조

```
shortform-agent/
├── backend/                    # FastAPI 서버
│   ├── main.py                 # 앱 진입점
│   ├── config.py               # 환경 설정 (Ollama URL, ffmpeg 경로)
│   ├── requirements.txt
│   ├── routers/
│   │   ├── generate.py         # POST /api/generate  (스크립트 생성 SSE)
│   │   └── video.py            # POST /api/video     (영상 생성)
│   │                           # GET  /api/video/{filename} (영상 다운로드)
│   └── services/
│       ├── llm.py              # Ollama 스트리밍 호출
│       ├── video.py            # TTS + 자막 이미지 + ffmpeg 영상 합성
│       └── parser.py           # 스크립트 레이블 제거 및 대사 추출
└── frontend/                   # Next.js 앱 (Vercel 배포 대상)
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            # 메인 페이지
    │   └── globals.css
    ├── components/
    │   ├── InputForm.tsx       # 입력 폼
    │   └── ScriptOutput.tsx    # 스트리밍 출력 + 영상 생성 UI
    ├── types/index.ts
    ├── .env.example
    └── vercel.json
```

---

## 사전 요구사항

- [Ollama](https://ollama.com) 설치
- Python 3.10+
- Node.js 18+
- [ffmpeg](https://ffmpeg.org/download.html) 설치 및 경로 설정

---

## 실행 방법

### 1. Ollama 모델 준비

```bash
ollama pull qwen3.5:4b
ollama serve
```

### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

### 3. 프론트엔드 실행

```bash
cd frontend
cp .env.example .env.local   # 환경변수 설정
npm install
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

---

## 환경변수

### frontend/.env.local

```env
# 백엔드 API 주소
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### backend 환경변수 (선택)

`config.py` 또는 환경변수로 설정 가능합니다.

```env
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=qwen3.5:4b
FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

---

## API

### `POST /api/generate` — 스크립트 생성 (SSE)

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

**Response** (SSE 스트리밍)

```
data: {"content": "제목: ..."}
data: {"content": "Hook: ..."}
...
data: [DONE]
```

---

### `POST /api/video` — 영상 생성

**Request Body**

```json
{
  "script": "생성된 스크립트 전문",
  "duration": 30,
  "voice_style": "normal",
  "font_size": 58
}
```

| voice_style | 속도 | 특징 |
|-------------|------|------|
| normal | 160 wpm | 기본 |
| energetic | 190 wpm | 활기차게 |
| fast | 210 wpm | 빠르게 |
| slow | 110 wpm | 천천히 |
| calm | 130 wpm | 잔잔하게 |

**Response**

```json
{
  "video_path": "outputs/abc123.mp4",
  "filename": "abc123.mp4"
}
```

---

### `GET /api/video/{filename}` — 영상 다운로드

생성된 MP4 파일을 스트리밍으로 반환합니다.

---

## Vercel 배포

1. [vercel.com](https://vercel.com) → GitHub 연동 → `shortform-agent` 레포 선택
2. **Root Directory** → `frontend` 설정
3. **Environment Variables** 추가:
   - `NEXT_PUBLIC_API_URL` = 백엔드 서버 주소 (예: `https://your-api.railway.app`)
4. Deploy

---

## 지원 플랫폼

- TikTok
- YouTube Shorts
- Instagram Reels

---

## 라이선스

MIT
