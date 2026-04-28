"use client";
import { useState } from "react";

type Case = {
  rowIndex: number;
  no: string;
  店舗名: string;
  CA担当者名: string;
  来店日: string;
  脱毛経験: string;
  年齢区分: string;
  顧客タイプ: string;
  婚姻: string;
  きっかけ理由: string;
  競合状況: string;
  診断コード: string;
  迷っていたプラン: string;
  迷いの理由: string;
  未契約理由1: string;
  未契約理由2: string;
  ボイスURL: string;
  備考コメント: string;
  契約状況: string;
  着地プラン: string;
  着地アプローチ: string;
  契約金額: string;
  単価セグメント: string;
};

function isContracted(status: string) {
  return status && status !== "未契約";
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

export default function CaseCard({ c }: { c: Case }) {
  const [open, setOpen] = useState(false);
  const contracted = isContracted(c.契約状況);

  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden border ${contracted ? "border-green-200 bg-white" : "border-gray-100 bg-white"}`}>
      {/* 契約成功バナー（契約事例のみ） */}
      {contracted && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-green-600 font-bold text-xs">✅ 契約成功事例</span>
            {c.契約金額 && (
              <span className="ml-auto text-green-700 font-bold text-sm">
                ¥{Number(c.契約金額.replace(/[^0-9]/g, "")).toLocaleString()}
              </span>
            )}
          </div>
          {c.着地プラン && (
            <p className="text-sm font-medium text-green-800">{c.着地プラン}</p>
          )}
        </div>
      )}

      {/* カードヘッダー（タップで開閉） */}
      <button
        className="w-full text-left p-4 active:bg-gray-50"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${contracted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {contracted ? "契約" : "未契約"}
              </span>
              <span className="text-xs text-gray-400">{c.来店日}</span>
              <span className="text-xs text-gray-400">{c.店舗名}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[c.脱毛経験, c.年齢区分, c.顧客タイプ, c.婚姻].filter(Boolean).map((v, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{v}</span>
              ))}
            </div>
            {!contracted && c.未契約理由1 && (
              <p className="text-xs text-red-500 mt-1.5">
                未契約理由: {c.未契約理由1}{c.未契約理由2 && c.未契約理由2 !== c.未契約理由1 ? ` / ${c.未契約理由2}` : ""}
              </p>
            )}
          </div>
          <span className="text-gray-400 text-sm mt-1 shrink-0">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* 詳細展開 */}
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* 契約成功事例：着地アプローチを最上部に強調表示 */}
          {contracted && c.着地アプローチ && (
            <div className="bg-green-50 rounded-xl p-3.5 mt-3 mb-1 border border-green-200">
              <p className="text-xs font-bold text-green-600 mb-1.5">💡 着地アプローチ（成功の決め手）</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">{c.着地アプローチ}</p>
            </div>
          )}

          <Row label="きっかけ・理由" value={c.きっかけ理由} />
          <Row label="競合状況" value={c.競合状況} />
          <Row label="診断コード" value={c.診断コード} />
          <Row label="迷っていたプラン" value={c.迷っていたプラン} />
          <Row label="迷いの理由" value={c.迷いの理由} />

          {!contracted && (
            <>
              <Row label="未契約理由①" value={c.未契約理由1} />
              <Row label="未契約理由②" value={c.未契約理由2} />
            </>
          )}

          <Row label="備考・コメント" value={c.備考コメント} />

          {c.ボイスURL && (
            <div className="py-2.5 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">ボイスメモ</p>
              <a
                href={c.ボイスURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 underline"
              >
                🎙 録音を聴く
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
