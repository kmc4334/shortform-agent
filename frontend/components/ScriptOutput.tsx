"use client";
import { useEffect, useRef } from "react";

interface Props {
  output: string;
  loading: boolean;
}

export default function ScriptOutput({ output, loading }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [output]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full">
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
        className="flex-1 min-h-[500px] bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-y-auto"
      >
        {!output && !loading && (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            왼쪽 폼을 채우고 생성 버튼을 눌러보세요
          </div>
        )}

        {loading && !output && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse delay-100">●</span>
            <span className="animate-pulse delay-200">●</span>
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
  );
}
