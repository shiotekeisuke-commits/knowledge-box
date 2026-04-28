import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
    const names = res.data.sheets?.map(s => s.properties?.title) ?? [];
    return NextResponse.json({ sheets: names });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
