import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'📋 未契約・アップセル分析'!A5:AV6`,
    });
    const rows = res.data.values ?? [];
    const headers = rows[0] ?? [];
    const sample = rows[1] ?? [];
    const result: Record<string, string> = {};
    headers.forEach((h: string, i: number) => {
      const col = i < 26 ? String.fromCharCode(65 + i) : "A" + String.fromCharCode(65 + i - 26);
      result[`${col}列(${h})`] = sample[i] ?? "";
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
