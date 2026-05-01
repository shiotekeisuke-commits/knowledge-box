"use client";
import { useState } from "react";
import { parseFeedback, FBCase, DialogueLine } from "@/lib/parseFeedback";

// 会話の吹き出し表示
function Dialogue({ lines }: { lines: DialogueLine[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.speaker === "staff") {
          return (
            <div key={i} className="flex items-start gap-2">
              <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                <span className="text-[10px] font-bold text-indigo-600">CA</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
                <p className="text-xs text-gray-800 leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        }
        if (line.speaker === "customer") {
          return (
            <div key={i} className="flex items-start gap-2 flex-row-reverse">
              <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                <span className="text-[10px] font-bold text-gray-500">客</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-sm px-3 py-2 flex-1">
                <p className="text-xs text-gray-800 leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        }
        return (
          <p key={i} className="text-xs text-gray-400 text-center py-0.5">{line.text}</p>
        );
      })}
    </div>
  );
}

// 1件の事例カード
function CaseCard({ c, type, index }: { c: FBCase; type: "good" | "bad"; index: number }) {
  const [open, setOpen] = useState(false);
  const isGood = type === "good";
  const num = ["①", "②", "③", "④", "⑤"][index] ?? `${index + 1}`;

  return (
    <div className={`rounded-2xl overflow-hidden border ${
      isGood ? "border-green-200" : "border-red-200"
    }`}>
      {/* タイトル行：常時表示 */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full text-left px-4 py-3.5 flex items-start gap-3 ${
          isGood
            ? "bg-green-50 active:bg-green-100"
            : "bg-red-50 active:bg-red-100"
        }`}
      >
        <span className={`shrink-0 text-xs font-black mt-0.5 ${
          isGood ? "text-green-500" : "text-red-400"
        }`}>{num}</span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold leading-snug ${
            isGood ? "text-green-800" : "text-red-700"
          }`}>
            {c.title || "（タイトルなし）"}
          </p>
          {c.scene && !open && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.scene}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs mt-1 ${
          isGood ? "text-green-400" : "text-red-300"
        }`}>{open ? "▲" : "▼"}</span>
      </button>

      {/* 詳細：開いたとき表示 */}
      {open && (
        <div className="bg-white divide-y divide-gray-100">
          {/* 発生場面 */}
          {c.scene && (
            <div className="px-4 py-3">
              <p className="text-xs font-bold text-gray-400 mb-1.5">📍 発生場面</p>
              <p className="text-sm text-gray-700 leading-relaxed">{c.scene}</p>
            </div>
          )}

          {/* 会話再現 */}
          {c.dialogue.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-bold text-gray-400 mb-2.5">💬 会話の再現</p>
              <Dialogue lines={c.dialogue} />
            </div>
          )}

          {/* なぜ良いのか / 何が問題だったか */}
          {c.reason && (
            <div className={`px-4 py-3 ${isGood ? "bg-green-50" : "bg-red-50"}`}>
              <p className={`text-xs font-bold mb-1.5 ${
                isGood ? "text-green-600" : "text-red-500"
              }`}>
                {isGood ? "✅ なぜ良いのか" : "⚠️ 何が問題だったか"}
              </p>
              <p className={`text-sm leading-relaxed ${
                isGood ? "text-green-900" : "text-red-900"
              }`}>{c.reason}</p>
            </div>
          )}

          {/* 活用ポイント / 改善後の理想トーク例 */}
          {c.point && (
            <div className={`px-4 py-3 ${isGood ? "bg-indigo-50" : "bg-amber-50"}`}>
              <p className={`text-xs font-bold mb-1.5 ${
                isGood ? "text-indigo-600" : "text-amber-700"
              }`}>
                {isGood ? "💡 活用ポイント" : "📝 改善後の理想トーク"}
              </p>
              {/* 改善トーク例内の会話も吹き出し表示 */}
              {!isGood && c.point.includes("スタッフ：") ? (
                <Dialogue lines={
                  c.point
                    .replace(/スタッフ[：:]/g, "\nスタッフ：")
                    .replace(/お客様[：:]/g, "\nお客様：")
                    .split("\n").filter(Boolean)
                    .map(line => {
                      if (line.startsWith("スタッフ：")) return { speaker: "staff" as const, text: line.replace(/^スタッフ[：:]/, "").trim() };
                      if (line.startsWith("お客様：")) return { speaker: "customer" as const, text: line.replace(/^お客様[：:]/, "").trim() };
                      return { speaker: "other" as const, text: line };
                    })
                } />
              ) : (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isGood ? "text-indigo-900" : "text-amber-900"
                }`}>{c.point}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackSection({ text }: { text: string }) {
  const [activeTab, setActiveTab] = useState<"good" | "bad">("good");

  if (!text || text.length < 30) return null;

  const { goodCases, badCases } = parseFeedback(text);

  // パース失敗時はそのまま表示
  if (goodCases.length === 0 && badCases.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-bold text-gray-600">📝 AIボイス精査</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-bold text-gray-600">📝 AIボイス精査</p>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("good")}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "good"
              ? "bg-green-50 text-green-700 border-b-2 border-green-500"
              : "text-gray-400 bg-white"
          }`}
        >
          👍 良い点
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === "good" ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-400"
          }`}>{goodCases.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("bad")}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "bad"
              ? "bg-red-50 text-red-600 border-b-2 border-red-400"
              : "text-gray-400 bg-white"
          }`}
        >
          👎 改善点
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeTab === "bad" ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"
          }`}>{badCases.length}</span>
        </button>
      </div>

      {/* 事例一覧 */}
      <div className="p-3 space-y-2 bg-gray-50">
        {activeTab === "good" && (
          goodCases.length > 0
            ? goodCases.map((c, i) => <CaseCard key={i} c={c} type="good" index={i} />)
            : <p className="text-sm text-gray-400 text-center py-4">良い点の記録はありません</p>
        )}
        {activeTab === "bad" && (
          badCases.length > 0
            ? badCases.map((c, i) => <CaseCard key={i} c={c} type="bad" index={i} />)
            : <p className="text-sm text-gray-400 text-center py-4">改善点の記録はありません</p>
        )}
      </div>
    </div>
  );
}
