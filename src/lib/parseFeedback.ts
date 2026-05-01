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

// 会話テキストを行ごとに分割
function parseDialogue(raw: string): DialogueLine[] {
  if (!raw) return [];

  // 「スタッフ：」「お客様：」の前に改行を挿入して分割
  const normalized = raw
    .replace(/スタッフ[：:]/g, "\nスタッフ：")
    .replace(/お客様[：:]/g, "\nお客様：")
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return normalized.map(line => {
    if (line.startsWith("スタッフ：")) {
      return { speaker: "staff" as const, text: line.replace(/^スタッフ[：:]/, "").trim() };
    }
    if (line.startsWith("お客様：")) {
      return { speaker: "customer" as const, text: line.replace(/^お客様[：:]/, "").trim() };
    }
    return { speaker: "other" as const, text: line };
  });
}

// フィールドをキーワードで分割して抽出
function extractField(text: string, startKey: string, endKeys: string[]): string {
  const startPattern = new RegExp(`${startKey}[：:]\\s*`);
  const startIdx = text.search(startPattern);
  if (startIdx === -1) return "";

  const afterStart = text.slice(startIdx).replace(startPattern, "");

  // 次のフィールドキーが来るまでを取得
  let endIdx = afterStart.length;
  for (const key of endKeys) {
    const m = afterStart.search(new RegExp(`\\s*${key}[：:]`));
    if (m !== -1 && m < endIdx) endIdx = m;
  }

  return afterStart.slice(0, endIdx).replace(/\r/g, "").trim();
}

const ALL_FIELD_KEYS = [
  "タイトル", "発生場面", "会話再現",
  "なぜ良いのか", "活用ポイント",
  "何が問題だったか", "改善後の理想トーク例",
];

function parseCase(block: string, isGood: boolean): FBCase {
  const title = extractField(block, "タイトル", ALL_FIELD_KEYS.filter(k => k !== "タイトル"));
  const scene = extractField(block, "発生場面", ALL_FIELD_KEYS.filter(k => k !== "発生場面"));
  const dialogueRaw = extractField(block, "会話再現", ALL_FIELD_KEYS.filter(k => k !== "会話再現"));
  const reason = isGood
    ? extractField(block, "なぜ良いのか", ALL_FIELD_KEYS.filter(k => k !== "なぜ良いのか"))
    : extractField(block, "何が問題だったか", ALL_FIELD_KEYS.filter(k => k !== "何が問題だったか"));
  const point = isGood
    ? extractField(block, "活用ポイント", ALL_FIELD_KEYS.filter(k => k !== "活用ポイント"))
    : extractField(block, "改善後の理想トーク例", ALL_FIELD_KEYS.filter(k => k !== "改善後の理想トーク例"));

  return {
    title,
    scene,
    dialogue: parseDialogue(dialogueRaw),
    reason,
    point,
  };
}

export function parseFeedback(raw: string): FeedbackData {
  if (!raw || raw.length < 30) return { goodCases: [], badCases: [] };

  // \r を除去してから処理
  const text = raw.replace(/\r/g, "");

  // 良い点セクションと悪い点セクションを分割
  const goodSectionStart = text.search(/■\s*共有推奨の[「『]良い点[」』]/);
  const badSectionStart = text.search(/■\s*共有推奨の[「『]悪い点/);

  const goodSection = goodSectionStart !== -1
    ? text.slice(goodSectionStart, badSectionStart !== -1 ? badSectionStart : undefined)
    : "";
  const badSection = badSectionStart !== -1
    ? text.slice(badSectionStart)
    : "";

  // 各セクションを事例ごとに分割
  function splitCases(section: string, label: string): string[] {
    const markers = [...section.matchAll(new RegExp(`【${label}\\s*事例[①②③④⑤]】`, "g"))];
    if (markers.length === 0) return [];
    return markers.map((m, i) => {
      const start = (m.index ?? 0) + m[0].length;
      const end = markers[i + 1]?.index ?? section.length;
      return section.slice(start, end).trim();
    });
  }

  const goodBlocks = splitCases(goodSection, "良い点");
  const badBlocks = splitCases(badSection, "悪い点");

  return {
    goodCases: goodBlocks.map(b => parseCase(b, true)),
    badCases: badBlocks.map(b => parseCase(b, false)),
  };
}
