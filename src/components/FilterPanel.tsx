"use client";

export type Options = {
  脱毛経験: string[];
  年齢区分: string[];
  顧客タイプ: string[];
  婚姻: string[];
  CP名: string[];
  職業: string[];
  契約状況: string[];
  単価レンジ: string[];
  ツールレベル: string[];
};

export type Filters = {
  脱毛経験: string;
  年齢区分: string;
  顧客タイプ: string;
  婚姻: string;
  CP名: string;
  職業: string;
  契約状況: string;
  単価レンジ: string;
  ツールレベル: string;
};

type Props = {
  options: Options;
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onSearch: () => void;
  loading: boolean;
};

const FILTER_CONFIG: { key: keyof Filters; label: string; note?: string }[] = [
  { key: "契約状況",    label: "契約ステータス" },
  { key: "脱毛経験",   label: "A. 脱毛経験" },
  { key: "年齢区分",   label: "B. 年齢区分" },
  { key: "顧客タイプ", label: "C. 顧客タイプ" },
  { key: "婚姻",       label: "D. 婚姻状況" },
  { key: "CP名",       label: "E. 訴求（流入CP）" },
  { key: "職業",       label: "F. 職業" },
  { key: "単価レンジ", label: "G. 契約単価レンジ", note: "契約事例のみ" },
  { key: "ツールレベル", label: "H. ツールレベル" },
];

export default function FilterPanel({ options, filters, onChange, onSearch, loading }: Props) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">顧客条件を選択</h2>
        {activeCount > 0 && (
          <button
            onClick={() => FILTER_CONFIG.forEach(f => onChange(f.key, ""))}
            className="text-xs text-indigo-500 underline"
          >
            リセット
          </button>
        )}
      </div>

      {FILTER_CONFIG.map(({ key, label, note }) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            {note && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{note}</span>}
            {filters[key] && (
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {filters[key]}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange(key, "")}
              className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters[key] === ""
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              すべて
            </button>
            {(options[key] ?? []).map(opt => (
              <button
                key={opt}
                onClick={() => onChange(key, opt)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  filters[key] === opt
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onSearch}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 text-white text-base font-bold rounded-xl active:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "検索中..." : `事例を検索する${activeCount > 0 ? ` (${activeCount}条件)` : ""}`}
      </button>
    </div>
  );
}
