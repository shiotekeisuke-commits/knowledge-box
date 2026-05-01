"use client";
import { useEffect, useState, useCallback } from "react";
import FilterPanel from "@/components/FilterPanel";
import StatsSummary from "@/components/StatsSummary";
import CaseCard from "@/components/CaseCard";

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
};

export default function Home() {
  const [options, setOptions] = useState<Options>({ 脱毛経験: [], 年齢区分: [], 顧客タイプ: [], 婚姻: [], CP名: [], 職業: [] });
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
      if (filters.脱毛経験) sp.set("脱毛経験", filters.脱毛経験);
      if (filters.年齢区分) sp.set("年齢区分", filters.年齢区分);
      if (filters.顧客タイプ) sp.set("顧客タイプ", filters.顧客タイプ);
      if (filters.婚姻) sp.set("婚姻", filters.婚姻);
      if (filters.CP名) sp.set("CP名", filters.CP名);
      if (filters.職業) sp.set("職業", filters.職業);
      const res = await fetch(`/api/search?${sp}`);
      const data = await res.json();
      setStats(data.stats);
      // 契約成功事例を上部に表示
      const sorted = [...data.cases].sort((a: CaseRow, b: CaseRow) => {
        const aOk = a.契約状況 !== "未契約" ? 0 : 1;
        const bOk = b.契約状況 !== "未契約" ? 0 : 1;
        return aOk - bOk;
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
      {/* ヘッダー */}
      <div className="text-center pb-2">
        <h1 className="text-xl font-bold text-gray-900">ナレッジボックス</h1>
        <p className="text-sm text-gray-500 mt-1">未契約・アップセル事例の検索と学習</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* 検索フィルター */}
      <FilterPanel
        options={options}
        filters={filters}
        onChange={handleChange}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* 統計サマリー */}
      {searched && stats && <StatsSummary stats={stats} />}

      {/* 事例一覧 */}
      {searched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">
              該当事例 <span className="text-indigo-600">{cases.length}件</span>
            </h2>
          </div>

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
