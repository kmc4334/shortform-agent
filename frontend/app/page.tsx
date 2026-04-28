"use client";
import { useState } from "react";
import InputForm from "@/components/InputForm";
import ScriptOutput from "@/components/ScriptOutput";
import { ContentRequest } from "@/types";

export default function Home() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (data: ContentRequest) => {
    setOutput("");
    setLoading(true);

    const res = await fetch("http://localhost:8081/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const raw = line.slice(6);
        if (raw === "[DONE]") { setLoading(false); return; }
        try {
          const parsed = JSON.parse(raw);
          setOutput((prev) => prev + parsed.content);
        } catch {}
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          숏폼 콘텐츠 생성기
        </h1>
        <p className="text-center text-gray-400 mb-10 text-sm">
          AI가 당신만을 위한 바이럴 스크립트를 만들어드립니다
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputForm onGenerate={handleGenerate} loading={loading} />
          <ScriptOutput output={output} loading={loading} />
        </div>
      </div>
    </main>
  );
}
