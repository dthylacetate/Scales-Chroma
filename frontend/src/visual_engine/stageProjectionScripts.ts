import type { VisualParameters } from "../types/theory";
import { getStageSetpiece } from "./stageSetpieces";

export type StageProjectionScriptKind =
  | "aisle-lattice"
  | "velvet-bloom"
  | "ember-grid"
  | "prism-circuit"
  | "velocity-markers"
  | "eclipse-seal";

export interface StageProjectionScript {
  kind: StageProjectionScriptKind;
  label: string;
  pattern: string;
  drift: string;
  impact: string;
}

const PROJECTION_SCRIPT_MAP: Record<string, StageProjectionScript> = {
  "choir-vault": {
    kind: "aisle-lattice",
    label: "Aisle Lattice",
    pattern: "地面会长出合唱席一样的纵深 aisle 与圆形 choir mark。",
    drift: "线网会向中心慢慢收束，像礼堂把注意力一排排送向主位。",
    impact: "从空中往下压的秩序，会继续落到脚下，变成真正可走入的礼堂地面。 "
  },
  "aurora-dais": {
    kind: "aisle-lattice",
    label: "Aisle Lattice",
    pattern: "礼台地面会浮出纵深网格和开场圆标。",
    drift: "光格会沿透视往前推，像舞台在自己打开中轴线。",
    impact: "让亮场不只是悬浮，而是长出正式开场的地面秩序。 "
  },
  "blue-cloister": {
    kind: "aisle-lattice",
    label: "Aisle Lattice",
    pattern: "冷色回廊地面会出现更规整的窗格与步道网。",
    drift: "窗格会更克制地沿纵深缓慢推进。",
    impact: "把声部式秩序继续压到地面，让回廊更像可阅读的结构谱。 "
  },
  "silken-halo": {
    kind: "velvet-bloom",
    label: "Velvet Bloom",
    pattern: "地面会铺开柔性花瓣环和椭圆幕纱投影。",
    drift: "花瓣与光幕会贴着中心缓慢呼吸，边缘像织物一样起伏。",
    impact: "观感会更近、更柔，让舞台像被一层会流动的丝绒花冠包住。 "
  },
  "rose-arcade": {
    kind: "velvet-bloom",
    label: "Velvet Bloom",
    pattern: "回廊地面会浮出暖色花窗和贴地花瓣带。",
    drift: "脚下纹样会沿走廊轻轻摆移。",
    impact: "长廊会更像在慢舞，而不是只剩立柱和拱券。 "
  },
  "velvet-arcade": {
    kind: "velvet-bloom",
    label: "Velvet Bloom",
    pattern: "地面会形成柔性椭圆花窗和拖尾灯带。",
    drift: "图样会顺着走廊方向缓慢漂移。",
    impact: "空间会更像一条真的在滑行的表演路径。 "
  },
  "forge-throne": {
    kind: "ember-grid",
    label: "Ember Grid",
    pattern: "王座前方会压出锻炉格栅和发烫的菱形热区。",
    drift: "热区会沿格栅一段段点亮，像熔炉内部在持续翻涌。",
    impact: "重量感会从上方锤击继续落到脚下，变成真正带温度的压迫地面。 "
  },
  "eclipse-altar": {
    kind: "eclipse-seal",
    label: "Eclipse Seal",
    pattern: "祭坛脚下会展开圆形封印、暗环与辐条纹。",
    drift: "封印会一圈圈压暗，再沿边缘慢慢回亮。",
    impact: "让仪式感不只是漂在空中，而是像整个场子真的被法阵接管。 "
  },
  "phase-cloister": {
    kind: "prism-circuit",
    label: "Prism Circuit",
    pattern: "地面会铺出折返回路、斜向电路线和相位节点。",
    drift: "节点会沿不同回路交替闪动，像系统内部的信号重路由。",
    impact: "空间会更像正在运行的复杂结构，而不是一层静态的棱镜皮肤。 "
  },
  "prism-vortex": {
    kind: "prism-circuit",
    label: "Prism Circuit",
    pattern: "核心地面会拉出折射通路和棱镜电路纹。",
    drift: "扫描节点会沿对角线不断跳转。",
    impact: "把未来感从空中折射继续推到脚下。 "
  },
  "neon-causeway": {
    kind: "velocity-markers",
    label: "Velocity Markers",
    pattern: "地面会出现跑道编号、箭头切角和冲刺标线。",
    drift: "标线会沿远端持续追送，像节拍被整条赛道接力带走。",
    impact: "速度感会变成真正的道路感和冲刺感。 "
  },
  "tide-runway": {
    kind: "velocity-markers",
    label: "Velocity Markers",
    pattern: "跑道地面会长出纵深刻度和导流箭头。",
    drift: "刻度会按透视连续往远端递进。",
    impact: "让推进方向更明确，像整场都被一条前冲通道牵走。 "
  }
};

export function getStageProjectionScript(visual: VisualParameters): StageProjectionScript | null {
  const setpiece = getStageSetpiece(visual);

  if (!setpiece) {
    return null;
  }

  return PROJECTION_SCRIPT_MAP[setpiece.kind] ?? null;
}
