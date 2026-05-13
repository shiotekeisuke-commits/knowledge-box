"use client";
import { useEffect, useState, useCallback } from "react";
import FilterPanel, { Options, Filters } from "@/components/FilterPanel";
import StatsSummary from "@/components/StatsSummary";
import CaseCard from "@/components/CaseCard";

type Stats = {
  totalMatched: number;
  contractRate: number;
  topReasons: { label: string; count: number; pct: number }[];
  topApproaches: { label: string; count: number; pct: number }[];
  suggestion: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CaseRow = any;

const DEFAULT_FILTERS: Filters = {
  脱毛経験: "",
  年齢区分: "",
  顧客タイプ: "",
  婚姻: "",
  CP名: "",
  職業: "",
  契約状況: "",
  単価レンジ: "",
  ツールレベル: "",
};

const EMPTY_OPTIONS: Options = {
  脱毛経験: [], 年齢区分: [], 顧客タイプ: [], 婚姻: [],
  CP名: [], 職業: [], 契約状況: [], 単価レンジ: [], ツールレベル: [],
};

export default function Home() {
  const [options, setOptions] = useState<Options>(EMPTY_OPTIONS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/options")
      .then(r => r.json())
      .then(setOptions)
      .catch(() => setError("選択肢の取得に失敗しました"));
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams();
      (Object.keys(filters) as (keyof Filters)[]).forEach(key => {
        if (filters[key]) sp.set(key, filters[key]);
      });
      const res = await fetch(`/api/search?${sp}`);
      const data = await res.json();
      setStats(data.stats);
      // FB記載あり → 契約成功 → それ以外 の順に表示
      const sorted = [...data.cases].sort((a: CaseRow, b: CaseRow) => {
        const score = (c: CaseRow) => {
          if (c.AIボイス精査 && c.AIボイス精査.length > 30) return 0;
          if (c.契約状況 !== "未契約") return 1;
          return 2;
        };
        return score(a) - score(b);
      });
      setCases(sorted);
      setSearched(true);
    } catch {
      setError("検索に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="text-center pb-2">
        <h1 className="text-xl font-bold text-gray-900">ナレッジボックス</h1>
        <p className="text-sm text-gray-500 mt-1">未契約・アップセル事例の検索と学習</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      <FilterPanel
        options={options}
        filters={filters}
        onChange={handleChange}
        onSearch={handleSearch}
        loading={loading}
      />

      {searched && stats && <StatsSummary stats={stats} />}

      {searched && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800">
            該当事例 <span className="text-indigo-600">{cases.length}件</span>
          </h2>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
              条件に合致する事例が見つかりませんでした
            </div>
          ) : (
            cases.map((c: CaseRow) => <CaseCard key={c.rowIndex} c={c} />)
          )}
        </div>
      )}
    </div>
  );
}
