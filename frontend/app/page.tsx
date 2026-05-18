"use client";
import { useState } from "react";
import InputForm from "@/components/InputForm";
import ScriptOutput from "@/components/ScriptOutput";
import { ContentRequest } from "@/types";

export default function Home() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(30);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async (data: ContentRequest) => {
    setOutput("");
    setLoading(true);
    setDuration(data.duration);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.body) { setLoading(false); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const raw = trimmed.slice(6).trim();
          if (raw === "[DONE]") { setLoading(false); return; }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.content) setOutput((prev) => prev + parsed.content);
          } catch {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f4f7ff]">

      {/* ── 왼쪽 사이드바 ── */}
      <aside className="w-[320px] shrink-0 flex flex-col bg-white border-r border-slate-100 shadow-[1px_0_0_0_#e2e8f0]">
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">숏폼 생성기</p>
              <p className="text-[10px] text-slate-400 mt-0.5">AI Powered</p>
            </div>
          </div>
        </div>

        {/* 폼 영역 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto py-5 px-5">
          <InputForm onGenerate={handleGenerate} loading={loading} />
        </div>
      </aside>

      {/* ── 오른쪽 메인 ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 */}
        <div className="h-14 shrink-0 flex items-center justify-between px-8 bg-white/70 backdrop-blur-sm border-b border-slate-100">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">스크립트 에디터</h1>
            <p className="text-[11px] text-slate-400">생성된 스크립트를 확인하고 영상을 만들어보세요</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              생성 중...
            </div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-8">
          <ScriptOutput
            output={output}
            loading={loading}
            duration={duration}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing((v) => !v)}
            onOutputChange={setOutput}
          />
        </div>
      </main>
    </div>
  );
}
