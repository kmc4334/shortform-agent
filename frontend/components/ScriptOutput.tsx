"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  output: string;
  loading: boolean;
  duration: number;
  isEditing: boolean;
  onEditToggle: () => void;
  onOutputChange: (val: string) => void;
}

const VOICE_STYLES = [
  { value: "normal",    label: "기본",    icon: "○" },
  { value: "energetic", label: "활기차게", icon: "◎" },
  { value: "fast",      label: "빠르게",  icon: "▶" },
  { value: "slow",      label: "천천히",  icon: "◁" },
  { value: "calm",      label: "잔잔하게", icon: "◇" },
];

export default function ScriptOutput({ output, loading, duration, isEditing, onEditToggle, onOutputChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState("normal");
  const [fontSize, setFontSize] = useState(58);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    setVideoUrl(null);
    setVideoError(null);
  }, [output]);

  const handleCopy = () => navigator.clipboard.writeText(output);

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

  const hasOutput = !!output;
  const showOptions = hasOutput && !loading;

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">

      {/* ── 스크립트 패널 ── */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {/* 탭 바 */}
        <div className="flex items-center justify-between px-5 h-11 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            <span className="ml-3 text-xs font-medium text-slate-400">
              script.txt
              {isEditing && <span className="ml-1.5 text-blue-400">— 편집 중</span>}
            </span>
          </div>
          {hasOutput && (
            <div className="flex items-center gap-1">
              {/* 편집 토글 */}
              <button
                onClick={onEditToggle}
                className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                  isEditing
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {isEditing ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    완료
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    편집
                  </>
                )}
              </button>
              {/* 복사 */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400
                  hover:text-blue-600 transition-colors px-2.5 py-1 rounded-md hover:bg-blue-50"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                복사
              </button>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div
          ref={ref}
          className={`overflow-y-auto p-6 font-mono ${isEditing ? "min-h-[320px]" : "min-h-[320px] max-h-[480px]"}`}
        >
          {!hasOutput && !loading && (
            <div className="flex flex-col items-center justify-center h-[280px] select-none">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-300">아직 생성된 스크립트가 없어요</p>
              <p className="text-xs text-slate-200 mt-1">왼쪽 패널에서 정보를 입력하고 생성해보세요</p>
            </div>
          )}

          {loading && !hasOutput && (
            <div className="flex flex-col items-center justify-center h-[280px] gap-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-6 bg-blue-200 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 100}ms`, animationDuration: "0.8s" }}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-300">스크립트 생성 중...</p>
            </div>
          )}

          {hasOutput && (
            isEditing ? (
              <textarea
                className="w-full min-h-[320px] resize-none text-sm text-slate-700 leading-[1.8] font-sans
                  bg-transparent outline-none border-none p-0 focus:ring-0"
                value={output}
                onChange={(e) => onOutputChange(e.target.value)}
                autoFocus
                spellCheck={false}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-[1.8] font-sans">
                {output}
                {loading && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
                )}
              </pre>
            )
          )}
        </div>
      </div>

      {/* ── 영상 설정 패널 ── */}
      {showOptions && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">영상 설정</span>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6">
            {/* 음성 스타일 */}
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">음성 스타일</p>
              <div className="flex gap-2">
                {VOICE_STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setVoiceStyle(s.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium
                      border transition-all duration-150 ${
                      voiceStyle === s.value
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500"
                    }`}
                  >
                    <span className="text-base leading-none">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 자막 크기 */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">자막 크기</p>
                <span className="text-xs font-mono font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                  {fontSize}px
                </span>
              </div>
              <input
                type="range" min={28} max={100} step={4}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              {/* 미리보기 */}
              <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-blue-950 h-16 flex items-center justify-center">
                <span
                  style={{ fontSize: `${Math.round(fontSize * 0.26)}px` }}
                  className="text-white font-bold drop-shadow-md"
                >
                  자막 미리보기
                </span>
              </div>
            </div>
          </div>

          {/* 영상 생성 버튼 */}
          <div className="px-6 pb-6">
            <button
              onClick={handleGenerateVideo}
              disabled={videoLoading}
              className="w-full h-12 rounded-xl text-sm font-bold bg-blue-600 text-white
                hover:bg-blue-700 active:scale-[0.99] shadow-sm shadow-blue-200
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                transition-all duration-150 flex items-center justify-center gap-2"
            >
              {videoLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  영상 렌더링 중...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  영상 생성
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── 렌더링 대기 ── */}
      {videoLoading && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">TTS 음성 생성 및 자막 렌더링 중</p>
              <p className="text-xs text-slate-400 mt-1">30초~1분 소요될 수 있어요</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 에러 ── */}
      {videoError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[11px] font-bold text-red-400">!</span>
          </div>
          <p className="text-sm text-red-500">{videoError}</p>
        </div>
      )}

      {/* ── 영상 완료 ── */}
      {videoUrl && (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-200" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">영상 완료</span>
            </div>
            <a
              href={videoUrl}
              download
              className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500
                hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              다운로드
            </a>
          </div>
          <div className="p-4 bg-slate-900">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-xl max-h-[480px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
