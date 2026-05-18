import httpx
import json
from config import VLLM_BASE_URL, MODEL_NAME

SYSTEM_PROMPT = """당신은 바이럴 숏폼 콘텐츠 기획자이자 스크립트 작가입니다.
조회수, 시청 유지율, 공유를 극대화하는 숏폼 영상 스크립트를 만드세요.

제작 지침:
1. 시작 3초 안에 강력한 후킹을 만든다.
2. 호기심, 감정 자극, 반전 요소를 적극 활용한다.
3. 문장은 짧고 빠르게, 구어체로 작성한다.
4. 지루한 설명 없이 몰입도를 유지한다.
5. 플랫폼 특성에 맞게 최적화한다.
6. **영상 길이를 반드시 준수한다** — 한국어 평균 낭독 속도는 분당 약 300자이므로:
   - 15초 영상 → 스크립트 본문 75자 내외
   - 30초 영상 → 스크립트 본문 150자 내외
   - 60초 영상 → 스크립트 본문 300자 내외
   스크립트(Hook + 본문 + CTA) 합산 글자 수가 위 기준을 넘지 않도록 작성한다.

출력 형식 (반드시 이 형식으로만 출력):
제목:
Hook:
스크립트:
CTA:
해시태그:"""

def build_prompt(data: dict) -> str:
    duration = int(data['duration'])
    # 한국어 낭독 속도 기준 목표 글자 수 (분당 300자 → 초당 5자)
    target_chars = duration * 5
    return f"""주제: {data['topic']}
타겟: {data['target']}
톤: {data['tone']}
플랫폼: {data['platform']}
영상 길이: {duration}초 (Hook+스크립트+CTA 합산 {target_chars}자 내외로 작성)
목표: {data['goal']}
관심사: {data['interests']}
최근 반응한 콘텐츠: {data['liked_content']}
행동 패턴: {data['engagement_data']}

위 정보를 바탕으로 바이럴 숏폼 스크립트를 작성해주세요.
반드시 {duration}초 안에 읽힐 수 있는 분량으로 작성하세요."""

async def stream_script(data: dict):
    prompt = build_prompt(data)
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "stream": True,
        "think": False,   # Qwen3 thinking 모드 비활성화
        "options": {
            "temperature": 0.85,
            "num_predict": 1024,
        }
    }

    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream(
            "POST",
            f"{VLLM_BASE_URL}/api/chat",
            json=payload,
            headers={"Content-Type": "application/json"}
        ) as response:
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                try:
                    parsed = json.loads(line)
                    message = parsed.get("message", {})

                    # thinking 필드는 무시, content 필드만 사용
                    content = message.get("content", "")

                    if content:
                        yield f"data: {json.dumps({'content': content})}\n\n"

                    if parsed.get("done"):
                        yield "data: [DONE]\n\n"
                        return
                except Exception:
                    continue
