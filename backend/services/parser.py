import re

# 제거할 레이블 패턴
LABEL_PATTERNS = [
    r"^제목\s*[:：]",
    r"^Hook\s*[:：]",
    r"^스크립트\s*[:：]",
    r"^CTA\s*[:：]",
    r"^해시태그\s*[:：]",
    r"^#\w+",           # 해시태그 줄
    r"^\*{1,3}",        # 마크다운 볼드/이탤릭
    r"^\d+\.\s",        # 번호 목록 (1. 2. 3.)
    r"^\-\s",           # 불릿 목록
]

SKIP_LABELS = {"해시태그", "hashtag", "cta", "hook", "스크립트", "제목", "title"}


def parse_script_to_lines(script: str) -> tuple[list[str], list[str]]:
    """
    스크립트 텍스트를 파싱해서
    - tts_lines: TTS로 읽을 대사 목록
    - subtitle_lines: 자막으로 표시할 줄 목록
    반환
    """
    raw_lines = script.strip().split("\n")
    tts_lines = []
    subtitle_lines = []
    skip_section = False

    for line in raw_lines:
        line = line.strip()
        if not line:
            continue

        # 해시태그 섹션 시작 → 이후 줄 모두 스킵
        if re.match(r"^해시태그\s*[:：]", line, re.IGNORECASE):
            skip_section = True
            continue
        if skip_section:
            continue

        # CTA는 자막엔 포함, TTS엔 포함
        is_cta = bool(re.match(r"^CTA\s*[:：]", line, re.IGNORECASE))

        # 레이블 제거 후 실제 텍스트 추출
        clean = line
        for pattern in LABEL_PATTERNS:
            clean = re.sub(pattern, "", clean, flags=re.IGNORECASE).strip()

        # 마크다운 볼드/이탤릭 제거
        clean = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", clean)
        # 괄호 지시문 제거 (예: (빠른 컷 전환 효과))
        clean = re.sub(r"[\(\（][^)\）]{0,30}[\)\）]", "", clean).strip()
        # 남은 특수문자 정리
        clean = re.sub(r"[*_`~]", "", clean).strip()

        if not clean:
            continue

        # 자막용 (짧게 유지, 최대 20자)
        subtitle_lines.append(clean[:24])

        # TTS용 (괄호 지시문 없는 순수 텍스트)
        tts_lines.append(clean)

    return tts_lines, subtitle_lines
