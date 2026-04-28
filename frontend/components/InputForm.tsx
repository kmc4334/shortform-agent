"use client";
import { useState } from "react";
import { ContentRequest } from "@/types";

const PLATFORMS = ["TikTok", "YouTube Shorts", "Instagram Reels"];
const TONES = ["유머러스", "진지", "공감형", "충격적", "감성적", "정보전달형"];
const DURATIONS = [15, 30, 60];

interface Props {
  onGenerate: (data: ContentRequest) => void;
  loading: boolean;
}

export default function InputForm({ onGenerate, loading }: Props) {
  const [form, setForm] = useState<ContentRequest>({
    topic: "",
    target: "",
    tone: "유머러스",
    platform: "TikTok",
    duration: 30,
    goal: "",
    interests: "",
    liked_content: "",
    engagement_data: "",
  });

  const set = (key: keyof ContentRequest, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="주제 *" required>
        <input
          className={input}
          placeholder="예: 직장인 점심 절약 꿀팁"
          value={form.topic}
          onChange={(e) => set("topic", e.target.value)}
          required
        />
      </Field>

      <Field label="타겟 *" required>
        <input
          className={input}
          placeholder="예: 20대 직장인"
          value={form.target}
          onChange={(e) => set("target", e.target.value)}
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="플랫폼">
          <select className={input} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="톤">
          <select className={input} value={form.tone} onChange={(e) => set("tone", e.target.value)}>
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <Field label="영상 길이">
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set("duration", d)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                form.duration === d
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {d}초
            </button>
          ))}
        </div>
      </Field>

      <Field label="목표">
        <input
          className={input}
          placeholder="예: 팔로워 증가, 제품 홍보"
          value={form.goal}
          onChange={(e) => set("goal", e.target.value)}
        />
      </Field>

      <Field label="관심사">
        <input
          className={input}
          placeholder="예: 운동, 요리, 재테크"
          value={form.interests}
          onChange={(e) => set("interests", e.target.value)}
        />
      </Field>

      <Field label="최근 반응한 콘텐츠">
        <input
          className={input}
          placeholder="예: 3분 만에 살 빠지는 법"
          value={form.liked_content}
          onChange={(e) => set("liked_content", e.target.value)}
        />
      </Field>

      <Field label="행동 패턴">
        <input
          className={input}
          placeholder="예: 저녁 시간대 시청, 공유 많이 함"
          value={form.engagement_data}
          onChange={(e) => set("engagement_data", e.target.value)}
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "생성 중..." : "✨ 스크립트 생성"}
      </button>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">
        {label}{required && <span className="text-pink-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const input = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors";
