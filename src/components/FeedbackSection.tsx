"use client";
import { useState } from "react";
import { parseFeedback, FBCase } from "@/lib/parseFeedback";

function DialogueBlock({ text }: { text: string }) {
  if (!text) return null;
  // 「スタッフ：」「お客様：」で改行して見やすく
  const lines = text
    .replace(/スタッフ[：:]/g, "\nスタッフ：")
    .replace(/お客様[：:]/g, "\nお客様：")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isStaff = line.startsWith("スタッフ：");
        const isCustomer = line.startsWith("お客様：");
        if (isStaff) {
          const content = line.replace("スタッフ：", "").trim();
          return (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-bold text-indigo-600 shrink-0 mt-0.5">CA</span>
              <p className="text-xs text-gray-700 leading-relaxed bg-indigo-50 rounded-lg px-2.5 py-1.5 flex-1">{content}</p>
            </div>
          );
        }
        if (isCustomer) {
          const content = line.replace("お客様：", "").trim();
          return (
            <div key={i} className="flex gap-2 justify-end">
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-100 rounded-lg px-2.5 py-1.5 flex-1">{content}</p>
              <span className="text-xs font-bold text-gray-500 shrink-0 mt-0.5">客</span>
            </div>
          );
        }
        return <p key={i} className="text-xs text-gray-500 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function CaseBlock({ c, type, index }: { c: FBCase; type: "good" | "bad"; index: number }) {
  const [open, setOpen] = useState(false);
  const isGood = type === "good";

  return (
    <div className={`rounded-xl border overflow-hidden ${isGood ? "border-green-200" : "border-red-200"}`}>
      {/* タイトル行（常時表示） */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full text-left px-3.5 py-3 flex items-start justify-between gap-2 ${isGood ? "bg-green-50 active:bg-green-100" : "bg-red-50 active:bg-red-100"}`}
      >
        <div className="flex items-start gap-2 flex-1">
          <span className={`text-xs font-bold shrink-0 mt-0.5 ${isGood ? "text-green-600" : "text-red-500"}`}>
            事例{["①","②","③","④","⑤"][index]}
          </span>
          <p className={`text-sm font-semibold leading-snug ${isGood ? "text-green-800" : "text-red-700"}`}>
            {c.title || "（タイトルなし）"}
          </p>
        </div>
        <span className={`text-xs shrink-0 mt-1 ${isGood ? "text-green-500" : "text-red-400"}`}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 pt-2 space-y-3 bg-white">
          {c.scene && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">📍 発生場面</p>
              <p className="text-xs text-gray-600 leading-relaxed">{c.scene}</p>
            </div>
          )}
          {c.dialogue && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1.5">💬 会話再現</p>
              <DialogueBlock text={c.dialogue} />
            </div>
          )}
          {c.reason && (
            <div className={`rounded-lg p-3 ${isGood ? "bg-green-50" : "bg-red-50"}`}>
              <p className={`text-xs font-bold mb-1 ${isGood ? "text-green-600" : "text-red-500"}`}>
                {isGood ? "✅ なぜ良いのか" : "⚠️ 何が問題だったか"}
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">{c.reason}</p>
            </div>
          )}
          {c.point && (
            <div className={`rounded-lg p-3 ${isGood ? "bg-indigo-50" : "bg-amber-50"}`}>
              <p className={`text-xs font-bold mb-1 ${isGood ? "text-indigo-600" : "text-amber-600"}`}>
                {isGood ? "💡 活用ポイント" : "📝 改善後の理想トーク例"}
              </p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{c.point}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackSection({ text }: { text: string }) {
  const [showGood, setShowGood] = useState(true);
  const [showBad, setShowBad] = useState(true);

  if (!text || text.length < 30) return null;

  const { goodCases, badCases } = parseFeedback(text);
  if (goodCases.length === 0 && badCases.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 p-3.5">
        <p className="text-xs font-bold text-gray-500 mb-1.5">📝 AIボイス精査（FB）</p>
        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-bold text-gray-500">📝 AIボイス精査（FB）</p>

      {/* Goodポイント */}
      {goodCases.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowGood(o => !o)}
            className="flex items-center gap-2 w-full"
          >
            <span className="text-sm font-bold text-green-700">👍 良い点</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{goodCases.length}件</span>
            <span className="ml-auto text-green-500 text-xs">{showGood ? "▲" : "▼"}</span>
          </button>
          {showGood && (
            <div className="space-y-2">
              {goodCases.map((c, i) => <CaseBlock key={i} c={c} type="good" index={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Badポイント */}
      {badCases.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowBad(o => !o)}
            className="flex items-center gap-2 w-full"
          >
            <span className="text-sm font-bold text-red-600">👎 悪い点・改善点</span>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{badCases.length}件</span>
            <span className="ml-auto text-red-400 text-xs">{showBad ? "▲" : "▼"}</span>
          </button>
          {showBad && (
            <div className="space-y-2">
              {badCases.map((c, i) => <CaseBlock key={i} c={c} type="bad" index={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
