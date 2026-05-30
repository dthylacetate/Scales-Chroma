import type { VisualParameters } from "../types/theory";

export type StagePhraseVariationKind =
  | "choir-step"
  | "silk-orbit"
  | "hammer-fall"
  | "phase-spiral"
  | "spark-chase";

export interface StagePhraseVariation {
  kind: StagePhraseVariationKind;
  label: string;
  rewrite: string;
  impact: string;
}

const PHRASE_VARIATION_MAP: Record<Exclude<VisualParameters["phraseVariation"], "neutral">, StagePhraseVariation> = {
  "choir-step": {
    kind: "choir-step",
    label: "Choir Step",
    rewrite: "Jazz 的晶格成长会把上扬弧线切成一阶阶礼堂踏步，让每个落点都像被合唱席托起。",
    impact: "同样是 Lift Arc，现在会更像礼台逐级抬升，而不是一条完整拱线。 "
  },
  "silk-orbit": {
    kind: "silk-orbit",
    label: "Silk Orbit",
    rewrite: "Neo Soul 的幕纱会把漂移路径改写成贴身绕圈的柔性轨道，像呼吸带着轨迹环抱过去。",
    impact: "会让 Velvet Drift 从侧滑变成包裹式绕行，身体感会明显更强。 "
  },
  "hammer-fall": {
    kind: "hammer-fall",
    label: "Hammer Fall",
    rewrite: "Metal 的熔炉人格会把下坠路径打成一记记重击，像整句都在往中心砸落。",
    impact: "会让 Forge Drop 或 Shadow Sink 更像连续重击，而不是单纯沉下去。 "
  },
  "phase-spiral": {
    kind: "phase-spiral",
    label: "Phase Spiral",
    rewrite: "Fusion 的相位人格会把上爬折线扭成螺旋回路，让路径边走边折射、边抬升。",
    impact: "会让 Prism Climb 更像一座会自旋的相位楼梯。 "
  },
  "spark-chase": {
    kind: "spark-chase",
    label: "Spark Chase",
    rewrite: "Pentatonic 的速度人格会把跑道推进拆成一串追逐火花，像每个节点都在往前抢拍。",
    impact: "会让 Runway Drive 从整段直推变成连续追赶式冲刺。 "
  }
};

export function getStagePhraseVariation(visual: VisualParameters): StagePhraseVariation | null {
  if (visual.phraseVariation === "neutral" || visual.phraseVariationIntensity <= 0.05) {
    return null;
  }

  return PHRASE_VARIATION_MAP[visual.phraseVariation];
}
