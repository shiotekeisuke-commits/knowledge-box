import { NextResponse } from "next/server";
import { fetchAllRows } from "@/lib/sheets";
import { getUniqueValues, CP_OPTIONS, PRICE_RANGES, LEVEL_OPTIONS } from "@/lib/analyze";

export async function GET() {
  try {
    const rows = await fetchAllRows();
    return NextResponse.json({
      脱毛経験:   getUniqueValues(rows, "脱毛経験"),
      年齢区分:   getUniqueValues(rows, "年齢区分"),
      顧客タイプ: getUniqueValues(rows, "顧客タイプ"),
      婚姻:       getUniqueValues(rows, "婚姻"),
      CP名:       CP_OPTIONS,
      職業:       getUniqueValues(rows, "職業"),
      契約状況:   ["契約", "未契約"],
      単価レンジ: PRICE_RANGES.map(p => p.label),
      ツールレベル: LEVEL_OPTIONS,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
