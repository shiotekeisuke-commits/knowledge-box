import { CaseRow } from "./sheets";

export type FilterParams = {
  脱毛経験?: string;
  年齢区分?: string;
  顧客タイプ?: string;
  婚姻?: string;
};

export type Stats = {
  totalMatched: number;
  contractRate: number;
  topReasons: { label: string; count: number; pct: number }[];
  topApproaches: { label: string; count: number; pct: number }[];
  suggestion: string;
};

export function filterRows(rows: CaseRow[], params: FilterParams): CaseRow[] {
  return rows.filter(r => {
    if (params.脱毛経験 && r.脱毛経験 !== params.脱毛経験) return false;
    if (params.年齢区分 && r.年齢区分 !== params.年齢区分) return false;
    if (params.顧客タイプ && r.顧客タイプ !== params.顧客タイプ) return false;
    if (params.婚姻 && r.婚姻 !== params.婚姻) return false;
    return true;
  });
}

const EXCLUDE_REASONS = new Set(["なし", "", "契約", "アップセル"]);

function topN(arr: string[], n = 3): { label: string; count: number; pct: number }[] {
  const map: Record<string, number> = {};
  for (const v of arr) {
    if (!v || EXCLUDE_REASONS.has(v)) continue;
    map[v] = (map[v] ?? 0) + 1;
  }
  const total = arr.length || 1;
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
}

export function calcStats(allRows: CaseRow[], filtered: CaseRow[]): Stats {
  const total = filtered.length;
  const contracted = filtered.filter(r => r.契約状況 && r.契約状況 !== "未契約").length;
  const contractRate = total > 0 ? Math.round((contracted / total) * 100) : 0;

  const nonContracted = filtered.filter(r => r.契約状況 !== "契約");
  const reasons = topN(nonContracted.map(r => r.未契約理由1));
  const contractedRows = filtered.filter(r => r.契約状況 === "契約");
  const approaches = topN(contractedRows.map(r => r.着地アプローチ));

  let suggestion = "";
  if (total === 0) {
    suggestion = "条件に合致する事例がありません。条件を変えて検索してください。";
  } else if (reasons.length > 0) {
    const top = reasons[0];
    suggestion = `この条件の顧客では「${top.label}」が最多の未契約理由（${top.pct}%）です。`;
    if (approaches.length > 0) {
      suggestion += `\n契約成功事例では「${approaches[0].label}」のアプローチが有効でした。`;
    }
    suggestion += `\nアップセル・契約成功率は ${contractRate}% です。`;
  } else {
    suggestion = `この条件の顧客のアップセル・契約成功率は ${contractRate}% です。`;
  }

  return { totalMatched: total, contractRate, topReasons: reasons, topApproaches: approaches, suggestion };
}

export function getUniqueValues(rows: CaseRow[], key: keyof CaseRow): string[] {
  const s = new Set<string>();
  for (const r of rows) {
    const v = String(r[key]);
    if (v) s.add(v);
  }
  return Array.from(s).sort();
}
