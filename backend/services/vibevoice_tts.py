"""
Microsoft Edge TTS 서비스
https://github.com/rany2/edge-tts
pip install edge-tts
한국어 고품질 지원 (온라인 필요)
"""
import asyncio
import os

import edge_tts
import soundfile as sf
import numpy as np

# 한국어 음성 스타일별 설정
# 사용 가능한 전체 목록: edge-tts --list-voices | grep ko-KR
VOICE_MAP = {
    "normal":    {"voice": "ko-KR-SunHiNeural",   "rate": "+0%",  "pitch": "+0Hz"},
    "energetic": {"voice": "ko-KR-SunHiNeural",   "rate": "+15%", "pitch": "+5Hz"},
    "fast":      {"voice": "ko-KR-InJoonNeural",  "rate": "+25%", "pitch": "+0Hz"},
    "slow":      {"voice": "ko-KR-SunHiNeural",   "rate": "-15%", "pitch": "-3Hz"},
    "calm":      {"voice": "ko-KR-InJoonNeural",  "rate": "-10%", "pitch": "-5Hz"},
}


async def _generate_async(text: str, output_path: str, voice_style: str = "normal"):
    config = VOICE_MAP.get(voice_style, VOICE_MAP["normal"])
    communicate = edge_tts.Communicate(
        text=text,
        voice=config["voice"],
        rate=config["rate"],
        pitch=config["pitch"],
    )
    await communicate.save(output_path)


def generate_vibevoice_tts(
    text: str,
    output_path: str,
    voice_style: str = "normal",
) -> bool:
    """
    Edge TTS로 음성 생성 (MP3 → WAV 변환 없이 MP3로 저장)
    성공 시 True, 실패 시 False 반환 (실패 시 pyttsx3 fallback 사용)
    """
    try:
        # edge-tts는 mp3 출력 — output_path 그대로 사용 (.mp3 전달됨)
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    future = pool.submit(
                        asyncio.run,
                        _generate_async(text, output_path, voice_style)
                    )
                    future.result()
            else:
                loop.run_until_complete(_generate_async(text, output_path, voice_style))
        except RuntimeError:
            asyncio.run(_generate_async(text, output_path, voice_style))

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            print("[EdgeTTS] 출력 파일이 비어 있음")
            return False

        print(f"[EdgeTTS] TTS 생성 완료: {output_path}")
        return True

    except Exception as e:
        print(f"[EdgeTTS] TTS 실패, pyttsx3 fallback 사용: {e}")
        import traceback
        traceback.print_exc()
        return False
