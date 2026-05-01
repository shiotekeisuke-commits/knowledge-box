export type FBCase = {
  title: string;
  scene: string;
  dialogue: string;
  reason: string;   // なぜ良いのか / 何が問題だったか
  point: string;    // 活用ポイント / 改善後の理想トーク例
};

export type FeedbackData = {
  goodCases: FBCase[];
  badCases: FBCase[];
};

// 音声認識の誤変換を修正するクリーニング
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/（中略）/g, "…（中略）…")
    .trim();
}

// 【ラベル 事例①】〜【ラベル 事例②】 のブロックを抽出
function splitCases(text: string, label: string): string[] {
  const pattern = new RegExp(`【${label}\\s*事例[①②③④⑤]】`, "g");
  const parts = text.split(pattern);
  return parts.slice(1).filter(p => p.trim());
}

// 各事例の各フィールドを抽出
function parseCase(block: string, isGood: boolean): FBCase {
  const get = (keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(`${key}[：:](.*?)(?=${FIELD_KEYS.join("|")}|$)`, "s");
      const m = block.match(re);
      if (m) return cleanText(m[1]);
    }
    return "";
  };

  const FIELD_KEYS = [
    "タイトル[：:]",
    "発生場面[：:]",
    "会話再現[：:]",
    "なぜ良いのか[：:]",
    "活用ポイント[：:]",
    "何が問題だったか[：:]",
    "改善後の理想トーク例[：:]",
  ];

  return {
    title: get(["タイトル"]),
    scene: get(["発生場面"]),
    dialogue: get(["会話再現"]),
    reason: isGood ? get(["なぜ良いのか"]) : get(["何が問題だったか"]),
    point: isGood ? get(["活用ポイント"]) : get(["改善後の理想トーク例"]),
  };
}

export function parseFeedback(raw: string): FeedbackData {
  if (!raw || raw.length < 20) return { goodCases: [], badCases: [] };

  // 良い点セクションと悪い点セクションに分割
  const goodSplit = raw.split(/■\s*共有推奨の[「『]良い点[」』]/);
  const goodSection = goodSplit[1]?.split(/■\s*共有推奨の[「『]悪い点/)[0] ?? "";
  const badSection = raw.split(/■\s*共有推奨の[「『]悪い点[・・]改善点[」』]/)[1] ?? "";

  const goodBlocks = splitCases(goodSection, "良い点");
  const badBlocks = splitCases(badSection, "悪い点");

  return {
    goodCases: goodBlocks.map(b => parseCase(b, true)),
    badCases: badBlocks.map(b => parseCase(b, false)),
  };
}
