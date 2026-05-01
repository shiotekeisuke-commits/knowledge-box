import { google } from "googleapis";

export type CaseRow = {
  rowIndex: number;
  no: string;
  店舗名: string;
  CA担当者名: string;
  顧客名: string;
  来店日: string;
  脱毛経験: string;
  年齢区分: string;
  顧客タイプ: string;
  婚姻: string;
  きっかけ理由: string;
  競合状況: string;
  診断コード: string;
  迷っていたプラン: string;
  迷いの理由: string;
  未契約理由1: string;
  未契約理由2: string;
  ボイスURL: string;
  備考コメント: string;
  契約状況: string;
  着地プラン: string;
  着地アプローチ: string;
  契約金額: string;
  単価セグメント: string;
  AIボイス精査: string;   // X列
  CP名: string;           // Y列
  職業: string;           // Z列
  来店きっかけQ1: string; // AA列
  脱毛希望部位: string;   // AH列
  来店理由AT: string;     // AT列
};

// Y列CP名を代表カテゴリに変換
export function normalizeCPName(raw: string): string {
  if (!raw) return "";
  if (/全身/.test(raw) && /トライアル|試し/.test(raw)) return "全身脱毛トライアル";
  if (/キャッシュバック|現金/.test(raw)) return "現金キャッシュバック";
  if (/無料.*カウンセリング|カウンセリング.*無料/.test(raw)) return "無料カウンセリング";
  if (/6ヶ月|6か月|6カ月|6ケ月/.test(raw)) return "6ヶ月";
  if (/ヒゲ.*トライアル|トライアル.*ヒゲ/.test(raw)) return "ヒゲトライアル";
  if (/ヒゲ.*総額|総額.*ヒゲ|総額/.test(raw)) return "ヒゲ総額";
  return "その他";
}

let cachedRows: CaseRow[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("認証情報が未設定です");
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export async function fetchAllRows(): Promise<CaseRow[]> {
  const now = Date.now();
  if (cachedRows && now - cachedAt < CACHE_TTL_MS) return cachedRows;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetName = process.env.SHEET_NAME ?? "📋 未契約・アップセル分析";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `'${sheetName}'!A5:AT`,
  });

  const raw = res.data.values ?? [];
  const rows: CaseRow[] = raw.slice(1).map((r, i) => ({
    rowIndex: i + 6,
    no: r[0] ?? "",
    店舗名: r[1] ?? "",
    CA担当者名: r[2] ?? "",
    顧客名: r[3] ?? "",
    来店日: r[4] ?? "",
    脱毛経験: r[5] ?? "",
    年齢区分: r[6] ?? "",
    顧客タイプ: r[7] ?? "",
    婚姻: r[8] ?? "",
    きっかけ理由: r[9] ?? "",
    競合状況: r[10] ?? "",
    診断コード: r[11] ?? "",
    迷っていたプラン: r[12] ?? "",
    迷いの理由: r[13] ?? "",
    未契約理由1: r[14] ?? "",
    未契約理由2: r[15] ?? "",
    ボイスURL: r[16] ?? "",
    備考コメント: r[17] ?? "",
    契約状況: r[18] ?? "",
    着地プラン: r[19] ?? "",
    着地アプローチ: r[20] ?? "",
    契約金額: r[21] ?? "",
    単価セグメント: r[22] ?? "",
    AIボイス精査: r[23] ?? "",   // X列 (index 23)
    CP名: normalizeCPName(r[24] ?? ""), // Y列 (index 24)
    職業: r[25] ?? "",           // Z列 (index 25)
    来店きっかけQ1: r[26] ?? "", // AA列 (index 26)
    脱毛希望部位: r[33] ?? "",   // AH列 (index 33)
    来店理由AT: r[45] ?? "",     // AT列 (index 45)
  })).filter(r => r.no !== "");

  cachedRows = rows;
  cachedAt = now;
  return rows;
}

export function clearCache() {
  cachedRows = null;
  cachedAt = 0;
}
