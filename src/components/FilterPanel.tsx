"use client";

type Options = {
  脱毛経験: string[];
  年齢区分: string[];
  顧客タイプ: string[];
  婚姻: string[];
  CP名: string[];
  職業: string[];
};

type Filters = {
  脱毛経験: string;
  年齢区分: string;
  顧客タイプ: string;
  婚姻: string;
  CP名: string;
  職業: string;
};

type Props = {
  options: Options;
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onSearch: () => void;
  loading: boolean;
};

const FILTER_CONFIG: { key: keyof Filters; label: string }[] = [
  { key: "脱毛経験", label: "A. 脱毛経験" },
  { key: "年齢区分", label: "B. 年齢区分" },
  { key: "顧客タイプ", label: "C. 顧客タイプ" },
  { key: "婚姻", label: "D. 婚姻状況" },
  { key: "CP名", label: "E. 訴求（流入CP）" },
  { key: "職業", label: "F. 職業" },
];

export default function FilterPanel({ options, filters, onChange, onSearch, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
      <h2 className="text-lg font-bold text-gray-800">顧客条件を選択</h2>

      {FILTER_CONFIG.map(({ key, label }) => (
        <div key={key}>
          <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange(key, "")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters[key] === ""
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              すべて
            </button>
            {(options[key] ?? []).map(opt => (
              <button
                key={opt}
                onClick={() => onChange(key, opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  filters[key] === opt
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300"
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
        {loading ? "検索中..." : "事例を検索する"}
      </button>
    </div>
  );
}
