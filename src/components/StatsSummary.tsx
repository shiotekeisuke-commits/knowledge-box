"use client";

type Stats = {
  totalMatched: number;
  contractRate: number;
  topReasons: { label: string; count: number; pct: number }[];
  topApproaches: { label: string; count: number; pct: number }[];
  suggestion: string;
};

export default function StatsSummary({ stats }: { stats: Stats }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <h2 className="text-base font-bold text-indigo-800">データに基づく傾向・提案</h2>
      </div>

      {/* 提案文 */}
      <div className="bg-white rounded-xl p-4 border border-indigo-100">
        {stats.suggestion.split("\n").map((line, i) => (
          <p key={i} className="text-sm text-gray-800 leading-relaxed">{line}</p>
        ))}
      </div>

      {/* 件数・成功率 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 text-center border border-indigo-100">
          <p className="text-3xl font-bold text-indigo-600">{stats.totalMatched}</p>
          <p className="text-xs text-gray-500 mt-1">該当事例数</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-indigo-100">
          <p className="text-3xl font-bold text-green-600">{stats.contractRate}%</p>
          <p className="text-xs text-gray-500 mt-1">契約成功率</p>
        </div>
      </div>

      {/* 未契約理由TOP */}
      {stats.topReasons.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-indigo-100">
          <p className="text-xs font-bold text-gray-500 mb-3">未契約理由TOP</p>
          {stats.topReasons.map((r, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{r.label}</span>
                <span className="text-gray-500 font-medium">{r.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full"
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 成功アプローチTOP */}
      {stats.topApproaches.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-indigo-100">
          <p className="text-xs font-bold text-gray-500 mb-3">契約成功アプローチTOP</p>
          {stats.topApproaches.map((a, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 line-clamp-2">{a.label}</span>
                <span className="text-gray-500 font-medium ml-2 shrink-0">{a.count}件</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
