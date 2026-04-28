import { NextResponse } from "next/server";
import { fetchAllRows } from "@/lib/sheets";

export async function GET() {
  try {
    const rows = await fetchAllRows();
    return NextResponse.json({ totalRows: rows.length, sampleRow: rows[0] ?? null });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
