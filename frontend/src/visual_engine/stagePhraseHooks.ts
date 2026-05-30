import type { VisualParameters } from "../types/theory";

export type StagePhraseHookKind =
  | "skyline-rise"
  | "cadence-sweep"
  | "velvet-link"
  | "runway-spark"
  | "collapse-gate"
  | "ritual-notch"
  | "prism-ladder";

export interface StagePhraseHook {
  kind: StagePhraseHookKind;
  label: string;
  bridge: string;
  impact: string;
}

const PHRASE_HOOK_MAP: Record<string, StagePhraseHook> = {
  "Skyline Rise": {
    kind: "skyline-rise",
    label: "Skyline Rise",
    bridge: "明亮开放的起点会先抬一小段，再把上升感接给后面的和声落点。",
    impact: "会让舞台前半句更像向上拉开的天际线。 "
  },
  "Cadence Sweep": {
    kind: "cadence-sweep",
    label: "Cadence Sweep",
    bridge: "柔亮和弦会顺着弧线扫向进行终点，把落点提前预告出来。",
    impact: "会让终止感不只出现在最后，而是沿路一路被送过去。 "
  },
  "Velvet Link": {
    kind: "velvet-link",
    label: "Velvet Link",
    bridge: "流动型模块之间会被一条柔性波带串起来，像身体重心在滑移。",
    impact: "会让顺序本身更像一句有身体感的连线。 "
  },
  "Runway Spark": {
    kind: "runway-spark",
    label: "Runway Spark",
    bridge: "推进型模块之间会出现向前飞的火花节点和导流刻线。",
    impact: "会把速度感从整体推力细化成连续的小冲刺。 "
  },
  "Collapse Gate": {
    kind: "collapse-gate",
    label: "Collapse Gate",
    bridge: "高压模块衔接时会先张开一扇门，再向内塌成重井。",
    impact: "会让压迫感更像一步步被关进去，而不是突然变黑。 "
  },
  "Ritual Notch": {
    kind: "ritual-notch",
    label: "Ritual Notch",
    bridge: "暗色张力会在衔接处刻出缺口和齿形落痕。",
    impact: "会让仪式感更像真的在每个节点留下一道切痕。 "
  },
  "Prism Ladder": {
    kind: "prism-ladder",
    label: "Prism Ladder",
    bridge: "现代张力会在衔接处长出一节节棱镜阶梯。",
    impact: "会让复杂组合更像逐级上爬，而不是一团同时闪烁。 "
  }
};

export function getStagePhraseHooks(visual: VisualParameters): StagePhraseHook[] {
  return visual.phraseHooks.map((hook) => PHRASE_HOOK_MAP[hook]).filter(Boolean);
}
