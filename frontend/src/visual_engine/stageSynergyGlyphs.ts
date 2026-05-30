import type { VisualParameters } from "../types/theory";

export type StageSynergyGlyphKind =
  | "horizon-bloom"
  | "abyss-pressure"
  | "slipstream-pocket"
  | "prism-surge"
  | "cadence-spine"
  | "radiant-fan";

export interface StageSynergyGlyph {
  kind: StageSynergyGlyphKind;
  label: string;
  pattern: string;
  impact: string;
}

const SYNERGY_GLYPH_PRIORITY = [
  "Horizon Bloom",
  "Abyss Pressure",
  "Slipstream Pocket",
  "Prism Surge",
  "Cadential Lift",
  "Radiant Voicing"
] as const;

const SYNERGY_GLYPH_MAP: Record<string, StageSynergyGlyph> = {
  "Horizon Bloom": {
    kind: "horizon-bloom",
    label: "Horizon Bloom",
    pattern: "会在中轴和地平线之间长出放射式日冕与拱形开叶。",
    impact: "让明亮终止感不只存在于参数里，而像整条天际线真的被点开。 "
  },
  "Abyss Pressure": {
    kind: "abyss-pressure",
    label: "Abyss Pressure",
    pattern: "会在中心外侧长出压缩环、下坠裂口和暗压楔形。",
    impact: "让暗色张力像一层正在往内坍缩的压力井。 "
  },
  "Slipstream Pocket": {
    kind: "slipstream-pocket",
    label: "Slipstream Pocket",
    pattern: "会在侧边和中轴之间长出追风轨迹、切线箭头和口袋形 sweep。",
    impact: "让速度感不只是快，而是像整股气流被舞台收编。 "
  },
  "Prism Surge": {
    kind: "prism-surge",
    label: "Prism Surge",
    pattern: "会在中心外围长出折线门框、三棱折返和 burst 扫描骨架。",
    impact: "让高复杂棱镜人格更像一套在持续扩容的系统。 "
  },
  "Cadential Lift": {
    kind: "cadence-spine",
    label: "Cadence Spine",
    pattern: "会在中心前方长出收束脊线和落点导轨。",
    impact: "让终止牵引感更像真的在把全场往同一个落点拽。 "
  },
  "Radiant Voicing": {
    kind: "radiant-fan",
    label: "Radiant Fan",
    pattern: "会在中心外侧长出扇面光脊和向上打开的发声瓣。",
    impact: "让开放和声的明亮感更像一把被撑开的音色扇。 "
  }
};

export function getStageSynergyGlyph(visual: VisualParameters): StageSynergyGlyph | null {
  for (const synergy of SYNERGY_GLYPH_PRIORITY) {
    if (visual.activeSynergies.includes(synergy)) {
      return SYNERGY_GLYPH_MAP[synergy];
    }
  }

  return null;
}
