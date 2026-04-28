import { NextResponse } from "next/server";
import { fetchAllRows } from "@/lib/sheets";
import { getUniqueValues } from "@/lib/analyze";

export async function GET() {
  try {
    const rows = await fetchAllRows();
    return NextResponse.json({
      脱毛経験: getUniqueValues(rows, "脱毛経験"),
      年齢区分: getUniqueValues(rows, "年齢区分"),
      顧客タイプ: getUniqueValues(rows, "顧客タイプ"),
      婚姻: getUniqueValues(rows, "婚姻"),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
