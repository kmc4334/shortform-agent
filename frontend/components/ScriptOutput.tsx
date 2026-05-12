"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  output: string;
  loading: boolean;
  duration: number;
}

const VOICE_STYLES = [
  { value: "normal",    label: "기본",    desc: "보통 속도" },
  { value: "energetic", label: "활기차게", desc: "빠르고 힘차게" },
  { value: "fast",      label: "빠르게",  desc: "템포 업" },
  { value: "slow",      label: "천천히",  desc: "차분하게" },
  { value: "calm",      label: "잔잔하게", desc: "낮고 부드럽게" },
];

export default function ScriptOutput({ output, loading, duration }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState("normal");
  const [fontSize, setFontSize] = useState(58);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [output]);

  // 스크립트 바뀌면 이전 영상 초기화
  useEffect(() => {
    setVideoUrl(null);
    setVideoError(null);
  }, [output]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleGenerateVideo = async () => {
    if (!output) return;
    setVideoLoading(true);
    setVideoUrl(null);
    setVideoError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: output, duration, voice_style: voiceStyle, font_size: fontSize }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "영상 생성 실패");
      }
      const data = await res.json();
      setVideoUrl(`${process.env.NEXT_PUBLIC_API_URL}/api/video/${data.filename}`);
    } catch (e: unknown) {
      setVideoError(e instanceof Error ? e.message : "영상 생성 중 오류 발생");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 스크립트 출력 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400">생성된 스크립트</h2>
          {output && (
            <button
              onClick={handleCopy}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              복사하기
            </button>
          )}
        </div>

        <div
          ref={ref}
          className="min-h-[300px] max-h-[400px] bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-y-auto"
        >
          {!output && !loading && (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              왼쪽 폼을 채우고 생성 버튼을 눌러보세요
            </div>
          )}
          {loading && !output && (
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse">●</span>
              <span className="animate-pulse">●</span>
              <span className="ml-1">스크립트 생성 중...</span>
            </div>
          )}
          {output && (
            <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-sans">
              {output}
              {loading && <span className="animate-pulse text-purple-400">▌</span>}
            </pre>
          )}
        </div>
      </div>

      {/* 음성 스타일 선택 + 자막 크기 + 영상 생성 버튼 */}
      {output && !loading && (
        <div className="space-y-3">
          {/* 음성 스타일 */}
          <div>
            <p className="text-xs text-gray-400 mb-2">🎙️ 음성 스타일</p>
            <div className="grid grid-cols-5 gap-1.5">
              {VOICE_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setVoiceStyle(s.value)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                    voiceStyle === s.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-[10px] ${voiceStyle === s.value ? "text-blue-200" : "text-gray-600"}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 자막 크기 슬라이더 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">🔤 자막 크기</p>
              <span className="text-xs font-mono text-purple-400">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">작게</span>
              <input
                type="range"
                min={28}
                max={100}
                step={4}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none bg-gray-700 accent-purple-500 cursor-pointer"
              />
              <span className="text-xs text-gray-600">크게</span>
            </div>
            {/* 미리보기 */}
            <div className="mt-2 bg-gray-800 rounded-lg p-3 text-center overflow-hidden">
              <span
                style={{ fontSize: `${Math.round(fontSize * 0.28)}px` }}
                className="text-white font-bold leading-tight"
              >
                자막 미리보기
              </span>
            </div>
          </div>

          <button
            onClick={handleGenerateVideo}
            disabled={videoLoading}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {videoLoading ? "🎬 영상 생성 중..." : "🎬 영상 생성"}
          </button>
        </div>
      )}

      {/* 영상 미리보기 */}
      {videoLoading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="animate-pulse text-blue-400">●</span>
            <span className="animate-pulse text-blue-400">●</span>
            <span className="animate-pulse text-blue-400">●</span>
          </div>
          TTS 음성 생성 및 자막 영상 렌더링 중...<br />
          <span className="text-xs text-gray-600">30초~1분 소요될 수 있어요</span>
        </div>
      )}

      {videoError && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-sm text-red-400">
          ⚠️ {videoError}
        </div>
      )}

      {videoUrl && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-3">✅ 영상 생성 완료</p>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg max-h-[400px]"
          />
          <a
            href={videoUrl}
            download
            className="mt-3 block text-center py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            ⬇️ 다운로드
          </a>
        </div>
      )}
    </div>
  );
}
