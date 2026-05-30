import type { VisualParameters } from "../types/theory";
import { getStageSetpiece } from "./stageSetpieces";

export type StageDirectorCueKind =
  | "cathedral-descent"
  | "silk-breath"
  | "arcade-sway"
  | "forge-hammer"
  | "prism-scan"
  | "runway-chase"
  | "altar-eclipse";

export interface StageDirectorCue {
  kind: StageDirectorCueKind;
  label: string;
  rhythm: string;
  motion: string;
  impact: string;
}

const DIRECTOR_CUE_MAP: Record<string, StageDirectorCue> = {
  "choir-vault": {
    kind: "cathedral-descent",
    label: "Cathedral Descent",
    rhythm: "成组下压，像礼堂灯柱一层层往中心落。",
    motion: "顶部吊灯和纵向光柱按层次收束。",
    impact: "舞台会更像一场被礼堂秩序慢慢托起的合唱表演。 "
  },
  "aurora-dais": {
    kind: "cathedral-descent",
    label: "Cathedral Descent",
    rhythm: "成组下压，像礼堂灯柱一层层往中心落。",
    motion: "顶部礼台光柱按层次打开并向中心收束。",
    impact: "亮场会更像正式开场，而不是只有一团辉光。 "
  },
  "silken-halo": {
    kind: "silk-breath",
    label: "Silk Breath",
    rhythm: "缓慢呼吸，明暗像贴着幕纱一起起伏。",
    motion: "双侧侧洗和柔性光环会一起缓慢张合。",
    impact: "整场会更近、更像一层会呼吸的织物包着人。 "
  },
  "rose-arcade": {
    kind: "arcade-sway",
    label: "Arcade Sway",
    rhythm: "低速摇摆，像暖色脚灯顺着回廊来回送。",
    motion: "脚灯和拱券侧光会沿走廊轻轻摆过去。",
    impact: "让长廊更像人在里面慢慢移动，而不是死的结构。 "
  },
  "velvet-arcade": {
    kind: "arcade-sway",
    label: "Arcade Sway",
    rhythm: "低速摇摆，像暖色脚灯顺着回廊来回送。",
    motion: "脚灯和侧洗会顺着拱廊轻轻推进。",
    impact: "空间会更像在滑行，不只是有一条长廊。 "
  },
  "blue-cloister": {
    kind: "cathedral-descent",
    label: "Cathedral Descent",
    rhythm: "成组下压，像冷色窗格按顺序轮流落下。",
    motion: "纵向窗格灯会分段下扫，节奏更克制。",
    impact: "会更明显听到一种‘声部按秩序排开’的感觉。 "
  },
  "forge-throne": {
    kind: "forge-hammer",
    label: "Forge Hammer",
    rhythm: "断续重击，像锻炉上方的锤头一下一下砸下来。",
    motion: "上压硬光和下打热口会轮番爆一下。",
    impact: "暗场会更有重量，更像真正的重型现场。 "
  },
  "eclipse-altar": {
    kind: "altar-eclipse",
    label: "Altar Eclipse",
    rhythm: "缓慢压暗，再沿圆环边缘一点点回亮。",
    motion: "祭坛边缘和低位描边会像月蚀一样一圈圈推进。",
    impact: "仪式感会更强，像场子在慢慢被阴影接管。 "
  },
  "phase-cloister": {
    kind: "prism-scan",
    label: "Prism Scan",
    rhythm: "交替扫描，像不同相位的信号轮流穿过去。",
    motion: "折返扫描光会在门框和回路之间来回跳转。",
    impact: "会更像一个复杂系统内部的信号交通。 "
  },
  "prism-vortex": {
    kind: "prism-scan",
    label: "Prism Scan",
    rhythm: "交替扫描，像不同相位的信号轮流穿过去。",
    motion: "折射光条会沿不同角度轮流扫过核心。",
    impact: "棱镜空间会更像真的在自我运算。 "
  },
  "neon-causeway": {
    kind: "runway-chase",
    label: "Runway Chase",
    rhythm: "连续追光，像边灯一路把节拍送向远端。",
    motion: "边灯、护栏和远端灯钉会按方向连续追过去。",
    impact: "速度感会从快，变成真的有路感。 "
  },
  "tide-runway": {
    kind: "runway-chase",
    label: "Runway Chase",
    rhythm: "连续追光，像边灯一路把节拍送向远端。",
    motion: "跑道边灯会按纵深连续递进。",
    impact: "让推进方向更明确，不只是中心扩散。 "
  }
};

export function getStageDirectorCue(visual: VisualParameters): StageDirectorCue | null {
  const setpiece = getStageSetpiece(visual);

  if (!setpiece) {
    return null;
  }

  return DIRECTOR_CUE_MAP[setpiece.kind] ?? null;
}
