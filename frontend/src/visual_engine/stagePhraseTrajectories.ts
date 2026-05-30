import type { VisualParameters } from "../types/theory";

export type StagePhraseTrajectoryKind =
  | "lift-arc"
  | "velvet-drift"
  | "forge-drop"
  | "prism-climb"
  | "runway-drive"
  | "shadow-sink";

export interface StagePhraseTrajectory {
  kind: StagePhraseTrajectoryKind;
  label: string;
  path: string;
  impact: string;
}

const TRAJECTORY_COPY: Record<Exclude<VisualParameters["phraseTrajectory"], "neutral">, StagePhraseTrajectory> = {
  "lift-arc": {
    kind: "lift-arc",
    label: "Lift Arc",
    path: "模块从明亮开放的起点一路抬升，再在前景上方收成礼台式落点。",
    impact: "更像一条被高高托起的和声弧线，舞台会自己往上拱。 "
  },
  "velvet-drift": {
    kind: "velvet-drift",
    label: "Velvet Drift",
    path: "模块推进更像侧向漂移的 S 曲线，不是直冲，而是带着身体感绕过去。",
    impact: "会让同样的组合更像慢速滑行，而不是正面轰上来。 "
  },
  "forge-drop": {
    kind: "forge-drop",
    label: "Forge Drop",
    path: "模块会先拉高张力，再像锻锤一样往中心猛砸下来。",
    impact: "舞台会有明显的落砸感和重压感，像每个落点都有重量。 "
  },
  "prism-climb": {
    kind: "prism-climb",
    label: "Prism Climb",
    path: "模块会沿折线和门框一路上爬，像被棱镜阶梯不断重画。",
    impact: "会让复杂组合更像一套持续升阶的未来系统。 "
  },
  "runway-drive": {
    kind: "runway-drive",
    label: "Runway Drive",
    path: "模块会顺着地平跑道一路前冲，把节拍直接推向远端。",
    impact: "推进感会很直，像整个舞台都被拖进一条车道。 "
  },
  "shadow-sink": {
    kind: "shadow-sink",
    label: "Shadow Sink",
    path: "模块会把重心一步步往中心深井拖下去，像从前场慢慢塌入内核。",
    impact: "暗色组合会更像沉降，而不是只是更黑、更碎。 "
  }
};

export function getStagePhraseTrajectory(visual: VisualParameters): StagePhraseTrajectory | null {
  if (visual.phraseTrajectory === "neutral" || visual.phraseTrajectoryIntensity <= 0.05) {
    return null;
  }

  return TRAJECTORY_COPY[visual.phraseTrajectory];
}
