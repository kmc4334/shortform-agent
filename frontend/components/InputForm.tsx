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

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onGenerate(form); }}
      className="flex flex-col gap-6"
    >
      {/* 섹션: 기본 */}
      <Section title="기본 정보">
        <Field label="주제" required>
          <input
            className={inputCls}
            placeholder="예: 직장인 점심 절약 꿀팁"
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            required
          />
        </Field>
        <Field label="타겟" required>
          <input
            className={inputCls}
            placeholder="예: 20대 직장인"
            value={form.target}
            onChange={(e) => set("target", e.target.value)}
            required
          />
        </Field>
      </Section>

      {/* 섹션: 설정 */}
      <Section title="설정">
        <Field label="플랫폼">
          <select className={inputCls} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="톤">
          <select className={inputCls} value={form.tone} onChange={(e) => set("tone", e.target.value)}>
            {TONES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="영상 길이">
          <div className="grid grid-cols-3 gap-1.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set("duration", d)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  form.duration === d
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {d}초
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* 섹션: 추가 정보 */}
      <Section title="추가 정보" optional>
        <Field label="목표">
          <input className={inputCls} placeholder="예: 팔로워 증가, 제품 홍보"
            value={form.goal} onChange={(e) => set("goal", e.target.value)} />
        </Field>
        <Field label="관심사">
          <input className={inputCls} placeholder="예: 운동, 요리, 재테크"
            value={form.interests} onChange={(e) => set("interests", e.target.value)} />
        </Field>
        <Field label="최근 반응한 콘텐츠">
          <input className={inputCls} placeholder="예: 3분 만에 살 빠지는 법"
            value={form.liked_content} onChange={(e) => set("liked_content", e.target.value)} />
        </Field>
        <Field label="행동 패턴">
          <input className={inputCls} placeholder="예: 저녁 시간대 시청"
            value={form.engagement_data} onChange={(e) => set("engagement_data", e.target.value)} />
        </Field>
      </Section>

      {/* 제출 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl text-sm font-semibold bg-blue-600 text-white
          hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200
          disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
          transition-all duration-150"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            생성 중...
          </span>
        ) : "스크립트 생성"}
      </button>
    </form>
  );
}

/* ── 서브 컴포넌트 ── */

function Section({
  title,
  optional,
  children,
}: {
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        {optional && (
          <span className="text-[10px] text-slate-300 font-medium">선택</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-blue-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 " +
  "placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white " +
  "focus:ring-2 focus:ring-blue-100 transition-all duration-150";
