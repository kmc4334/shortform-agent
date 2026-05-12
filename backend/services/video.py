import asyncio
import os
import subprocess
import uuid
from pathlib import Path

import pyttsx3
from PIL import Image, ImageDraw, ImageFont
from config import FFMPEG_PATH
from services.parser import parse_script_to_lines

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

FONT_PATH = r"C:\Windows\Fonts\malgunbd.ttf"
FONT_FALLBACK = r"C:\Windows\Fonts\malgun.ttf"
VIDEO_W, VIDEO_H = 1080, 1920
BG_COLOR = (20, 20, 30)


def get_font(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.truetype(FONT_FALLBACK, size)


def get_audio_duration(audio_path: str) -> float:
    """ffmpeg로 오디오 길이 확인"""
    result = subprocess.run(
        [FFMPEG_PATH, "-i", audio_path],
        capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    for line in result.stderr.split("\n"):
        if "Duration:" in line:
            try:
                t = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = t.split(":")
                return int(h) * 3600 + int(m) * 60 + float(s)
            except Exception:
                pass
    return 10.0


def estimate_line_durations(lines: list[str], total_duration: float) -> list[tuple[float, float]]:
    """
    각 줄의 글자 수 비율로 시작/끝 시간 추정
    반환: [(start, end), ...]
    """
    if not lines:
        return []

    # 글자 수 기반 가중치 (최소 0.5초 보장)
    weights = [max(len(l), 3) for l in lines]
    total_weight = sum(weights)

    timings = []
    cursor = 0.0
    for w in weights:
        duration = (w / total_weight) * total_duration
        timings.append((round(cursor, 3), round(cursor + duration, 3)))
        cursor += duration

    return timings


def create_subtitle_frame(
    line: str,
    output_path: str,
    fontsize: int = 58,
    is_highlight: bool = False,
):
    """단일 자막 줄 PNG 프레임 생성"""
    img = Image.new("RGBA", (VIDEO_W, VIDEO_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font = get_font(fontsize)

    # 텍스트 크기 측정
    bbox = draw.textbbox((0, 0), line, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x = (VIDEO_W - text_w) // 2
    y = VIDEO_H // 2 - text_h // 2  # 화면 중앙

    # 반투명 배경 박스
    pad = 24
    box_x0 = x - pad
    box_y0 = y - pad
    box_x1 = x + text_w + pad
    box_y1 = y + text_h + pad

    overlay = Image.new("RGBA", (VIDEO_W, VIDEO_H), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    box_color = (255, 200, 0, 200) if is_highlight else (0, 0, 0, 160)
    overlay_draw.rounded_rectangle([box_x0, box_y0, box_x1, box_y1], radius=16, fill=box_color)
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # 그림자
    shadow_color = (0, 0, 0, 200)
    draw.text((x + 3, y + 3), line, font=font, fill=shadow_color)

    # 본문 텍스트
    text_color = (20, 20, 20, 255) if is_highlight else (255, 255, 255, 255)
    draw.text((x, y), line, font=font, fill=text_color)

    img.save(output_path, "PNG")


def generate_tts_sync(text: str, output_path: str, rate: int = 160, volume: float = 1.0):
    """오프라인 TTS 생성 (pyttsx3)"""
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    for voice in voices:
        if "korean" in voice.name.lower() or "ko" in voice.id.lower():
            engine.setProperty("voice", voice.id)
            break
    engine.setProperty("rate", rate)
    engine.setProperty("volume", volume)
    engine.save_to_file(text, output_path)
    engine.runAndWait()
    engine.stop()


def build_overlay_filter(frame_paths: list[str], timings: list[tuple[float, float]]) -> tuple[str, list[str]]:
    """
    ffmpeg filter_complex: 각 자막 프레임을 타임라인에 맞게 오버레이
    반환: (filter_complex 문자열, 추가 입력 파일 목록)
    """
    n = len(frame_paths)
    inputs = frame_paths  # 추가 -i 입력들

    # [0:v] = 배경, [1:v]~[n:v] = 자막 프레임들, [n+1:a] = 오디오
    filter_parts = []
    prev = "[0:v]"

    for i, (path, (start, end)) in enumerate(zip(frame_paths, timings)):
        idx = i + 1  # 입력 인덱스 (0=배경, 1~n=자막)
        out_label = f"[v{i}]"
        filter_parts.append(
            f"{prev}[{idx}:v]overlay=0:0:enable='between(t,{start},{end})'{out_label}"
        )
        prev = out_label

    filter_complex = ";".join(filter_parts)
    final_label = f"[v{n-1}]" if n > 0 else "[0:v]"
    return filter_complex, final_label


def create_video_with_subtitles(
    audio_path: str,
    lines: list[str],
    timings: list[tuple[float, float]],
    duration: float,
    output_path: str,
    tmp_dir: str,
    fontsize: int = 58,
):
    """자막 프레임별 PNG 생성 후 ffmpeg로 타임라인 합성"""
    # 자막 프레임 PNG 생성
    frame_paths = []
    for i, line in enumerate(lines):
        frame_path = os.path.join(tmp_dir, f"sub_{i:03d}.png")
        # Hook 줄(1번째)은 노란 하이라이트
        is_highlight = (i == 0)
        create_subtitle_frame(line, frame_path, fontsize=fontsize, is_highlight=is_highlight)
        frame_paths.append(frame_path)

    # ffmpeg 명령 구성
    cmd = [FFMPEG_PATH, "-y"]

    # 배경
    cmd += ["-f", "lavfi", "-i",
            f"color=c=0x14141e:size={VIDEO_W}x{VIDEO_H}:duration={duration:.3f}:rate=24"]

    # 자막 프레임 입력
    for fp in frame_paths:
        cmd += ["-loop", "1", "-i", fp]

    # 오디오
    cmd += ["-i", audio_path]

    # filter_complex 구성
    filter_complex, final_label = build_overlay_filter(frame_paths, timings)

    audio_idx = len(frame_paths) + 1
    cmd += [
        "-filter_complex", filter_complex,
        "-map", final_label,
        "-map", f"{audio_idx}:a",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-shortest",
        output_path,
    ]

    result = subprocess.run(
        cmd, capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg 영상 생성 실패:\n{result.stderr[-2000:]}")


def _generate_video_sync(
    script: str,
    audio_path: str,
    video_path: str,
    rate: int = 160,
    volume: float = 1.0,
    font_size: int = 58,
):
    import time

    # 1. 스크립트 파싱 → 대사/자막 분리
    tts_lines, subtitle_lines = parse_script_to_lines(script)
    tts_text = " ".join(tts_lines)  # TTS는 전체 대사를 이어서 읽음

    # 2. TTS 생성
    generate_tts_sync(tts_text, str(audio_path), rate=rate, volume=volume)

    # 2. 파일 저장 완료 대기
    prev_size = -1
    for _ in range(30):
        time.sleep(0.5)
        curr_size = os.path.getsize(audio_path) if os.path.exists(audio_path) else 0
        if curr_size > 0 and curr_size == prev_size:
            break
        prev_size = curr_size

    # 3. 오디오 길이 확인
    duration = get_audio_duration(str(audio_path))

    # 4. 자막 줄 분리 (파싱된 subtitle_lines 사용)
    lines = subtitle_lines[:16]

    # 5. 타이밍 계산
    timings = estimate_line_durations(lines, duration)

    # 6. 임시 디렉토리
    tmp_dir = str(OUTPUT_DIR / f"tmp_{uuid.uuid4().hex[:6]}")
    os.makedirs(tmp_dir, exist_ok=True)

    try:
        # 7. 영상 합성
        create_video_with_subtitles(
            str(audio_path), lines, timings, duration, str(video_path), tmp_dir,
            fontsize=font_size,
        )
    finally:
        # 8. 임시 파일 정리
        for f in os.listdir(tmp_dir):
            os.remove(os.path.join(tmp_dir, f))
        os.rmdir(tmp_dir)
        if os.path.exists(audio_path):
            os.remove(audio_path)


async def generate_video(
    script: str,
    duration: int,
    rate: int = 160,
    volume: float = 1.0,
    font_size: int = 58,
) -> str:
    video_id = str(uuid.uuid4())[:8]
    audio_path = OUTPUT_DIR / f"{video_id}.wav"
    video_path = OUTPUT_DIR / f"{video_id}.mp4"

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        _generate_video_sync,
        script,
        str(audio_path),
        str(video_path),
        rate,
        volume,
        font_size,
    )

    return str(video_path)
