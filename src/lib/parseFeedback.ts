export type DialogueLine = {
  speaker: "staff" | "customer" | "other";
  text: string;
};

export type FBCase = {
  title: string;
  scene: string;
  dialogue: DialogueLine[];
  reason: string;
  point: string;
};

export type FeedbackData = {
  goodCases: FBCase[];
  badCases: FBCase[];
};

// ===== テキスト正規化 =====
function normalize(text: string): string {
  return text
    .replace(/\r/g, "")           // Windows改行除去
    .replace(/\u3000/g, " ")      // 全角スペース→半角
    .replace(/^\s*[・•]\s*/gm, "") // 行頭の箇条書き記号除去
    .replace(/[ \t]+/g, " ")      // 連続スペースを1つに
    .trim();
}

// ===== 会話行のパース =====
function parseDialogue(raw: string): DialogueLine[] {
  if (!raw) return [];
  const lines = raw
    .replace(/スタッフ\s*[：:]/g, "\nスタッフ：")
    .replace(/お客様\s*[：:]/g, "\nお客様：")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return lines.map(line => {
    if (/^スタッフ[：:]/.test(line))
      return { speaker: "staff" as const, text: line.replace(/^スタッフ[：:]\s*/, "").trim() };
    if (/^お客様[：:]/.test(line))
      return { speaker: "customer" as const, text: line.replace(/^お客様[：:]\s*/, "").trim() };
    return { speaker: "other" as const, text: line };
  });
}

// ===== フィールドキー一覧 =====
const FIELD_KEYS = [
  "タイトル",
  "発生場面",
  "会話再現",
  "なぜ良いのか",
  "活用ポイント",
  "何が問題だったか",
  "改善後の理想トーク例",
  "改善後の理想トーク",
];

// フィールド名の正規表現（全角スペースや空白を柔軟に許容）
function fieldRegex(key: string) {
  return new RegExp(`(?:^|\\n)\\s*${key}\\s*[：:]\\s*`, "m");
}

function extractField(text: string, key: string): string {
  const re = fieldRegex(key);
  const m = text.match(re);
  if (!m || m.index === undefined) return "";

  const after = text.slice(m.index + m[0].length);
  // 次のフィールドキーが出るまでを取得
  let end = after.length;
  for (const k of FIELD_KEYS) {
    if (k === key) continue;
    const nm = after.match(fieldRegex(k));
    if (nm && nm.index !== undefined && nm.index < end) end = nm.index;
  }
  return after.slice(0, end).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

// ===== 1件の事例をパース =====
function parseCase(block: string, isGood: boolean): FBCase {
  const text = normalize(block);

  const title = extractField(text, "タイトル");
  const scene = extractField(text, "発生場面");
  const dialogueRaw = extractField(text, "会話再現");
  const reason = isGood
    ? extractField(text, "なぜ良いのか")
    : extractField(text, "何が問題だったか");
  const point = isGood
    ? extractField(text, "活用ポイント")
    : (extractField(text, "改善後の理想トーク例") || extractField(text, "改善後の理想トーク"));

  // 会話フィールドが取れなかった場合はブロック内の会話を直接抽出
  const dialogueSource = dialogueRaw ||
    ((/スタッフ\s*[：:]/.test(text) || /お客様\s*[：:]/.test(text)) ? text : "");

  return {
    title,
    scene,
    dialogue: parseDialogue(dialogueSource),
    reason,
    point,
  };
}

// ===== セクションを事例ごとに分割 =====
function splitCases(section: string, labelPattern: string): string[] {
  const re = new RegExp(`【\\s*${labelPattern}\\s*事例[①②③④⑤1-5]\\s*】`, "g");
  const markers = [...section.matchAll(re)];
  if (markers.length === 0) {
    // フォールバック: 【事例①】 形式（ラベルなし）
    const re2 = /【\s*事例[①②③④⑤1-5]\s*】/g;
    const m2 = [...section.matchAll(re2)];
    if (m2.length > 0) {
      return m2.map((m, i) => {
        const start = (m.index ?? 0) + m[0].length;
        const end = m2[i + 1]?.index ?? section.length;
        return section.slice(start, end).trim();
      });
    }
    return [];
  }
  return markers.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = markers[i + 1]?.index ?? section.length;
    return section.slice(start, end).trim();
  });
}

// ===== メインパース関数 =====
export function parseFeedback(rawText: string): FeedbackData {
  if (!rawText || rawText.length < 20) return { goodCases: [], badCases: [] };

  const text = rawText.replace(/\r/g, "").replace(/\u3000/g, " ");

  // セクション分割（複数パターンに対応）
  const goodStart = text.search(/■\s*(?:共有推奨の)?[「『]?良い点[」』]?/);
  const badStart  = text.search(/■\s*(?:共有推奨の)?[「『]?悪い点/);

  let goodSection = "";
  let badSection  = "";

  if (goodStart !== -1 && badStart !== -1) {
    goodSection = text.slice(goodStart, badStart);
    badSection  = text.slice(badStart);
  } else if (goodStart !== -1) {
    goodSection = text.slice(goodStart);
  } else if (badStart !== -1) {
    badSection  = text.slice(badStart);
  } else {
    // セクション区切りなし → 【良い点/悪い点 事例】マーカーで分ける
    const allGood = [...text.matchAll(/【\s*良い点\s*事例[①②③④⑤]\s*】/g)];
    const allBad  = [...text.matchAll(/【\s*悪い点\s*事例[①②③④⑤]\s*】/g)];
    if (allGood.length > 0 || allBad.length > 0) {
      const firstBad = allBad[0]?.index ?? text.length;
      goodSection = text.slice(0, firstBad);
      badSection  = text.slice(firstBad);
    }
  }

  const goodBlocks = splitCases(goodSection, "良い点");
  const badBlocks  = splitCases(badSection,  "悪い点");

  // 簡易フォーマット（【事例①】形式）フォールバック
  const fallbackBlocks = splitCases(text, "");

  return {
    goodCases: goodBlocks.length > 0
      ? goodBlocks.map(b => parseCase(b, true))
      : fallbackBlocks.map(b => parseCase(b, true)),
    badCases: badBlocks.map(b => parseCase(b, false)),
  };
}
