import { NextRequest, NextResponse } from "next/server";
import { fetchAllRows } from "@/lib/sheets";
import { filterRows, calcStats, FilterParams } from "@/lib/analyze";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const params: FilterParams = {
      脱毛経験:    sp.get("脱毛経験")    || undefined,
      年齢区分:    sp.get("年齢区分")    || undefined,
      顧客タイプ:  sp.get("顧客タイプ")  || undefined,
      婚姻:        sp.get("婚姻")        || undefined,
      CP名:        sp.get("CP名")        || undefined,
      職業:        sp.get("職業")        || undefined,
      契約状況:    sp.get("契約状況")    || undefined,
      単価レンジ:  sp.get("単価レンジ")  || undefined,
      ツールレベル: sp.get("ツールレベル") || undefined,
    };
    const all = await fetchAllRows();
    const filtered = filterRows(all, params);
    const stats = calcStats(all, filtered);
    return NextResponse.json({ stats, cases: filtered });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
