import type { VisualParameters } from "../types/theory";
import { getStageSetpiece } from "./stageSetpieces";

export type StageMotionRigKind =
  | "choir-crowns"
  | "ribbon-veils"
  | "piston-frames"
  | "prism-gates"
  | "runway-drones"
  | "eclipse-curtains";

export interface StageMotionRig {
  kind: StageMotionRigKind;
  label: string;
  mechanism: string;
  cadence: string;
  impact: string;
}

const MOTION_RIG_MAP: Record<string, StageMotionRig> = {
  "choir-vault": {
    kind: "choir-crowns",
    label: "Choir Crowns",
    mechanism: "前景会出现成组的拱冠、吊环和合唱席式悬挂边框。",
    cadence: "拱冠按层次慢慢下压，再把视线托回中心。",
    impact: "让礼堂感不只在远处，而是连靠近镜头的位置都像被声部秩序接管。 "
  },
  "aurora-dais": {
    kind: "choir-crowns",
    label: "Choir Crowns",
    mechanism: "前景会长出开场拱冠和礼台吊环。",
    cadence: "光环与拱冠会按开场节奏依次压下来。",
    impact: "把亮场从‘有光’推进成‘真的在开场’。 "
  },
  "blue-cloister": {
    kind: "choir-crowns",
    label: "Choir Crowns",
    mechanism: "前景会出现更冷静的窗格拱冠和细长吊架。",
    cadence: "拱架会按更克制的频率轮流让位。",
    impact: "让修道院式秩序从背景走到近处。 "
  },
  "silken-halo": {
    kind: "ribbon-veils",
    label: "Ribbon Veils",
    mechanism: "前景会长出贴身丝带、半透明幕纱和柔性边框。",
    cadence: "幕纱会像呼吸一样缓慢张合，丝带会顺着节拍漂移。",
    impact: "让 Neo Soul 的包裹感不只是色彩柔和，而是连镜头前都像有织物在流动。 "
  },
  "rose-arcade": {
    kind: "ribbon-veils",
    label: "Ribbon Veils",
    mechanism: "前景会出现暖色丝带、玫瑰弧线和贴地柔幕。",
    cadence: "弧线会顺着走廊慢慢摆过去。",
    impact: "让长廊更像近距离慢舞场。 "
  },
  "velvet-arcade": {
    kind: "ribbon-veils",
    label: "Ribbon Veils",
    mechanism: "前景会出现轻薄幕纱和贴边柔性导光。",
    cadence: "幕纱会跟着横向律动一起摆动。",
    impact: "让走廊不再只是远处空间，而是近景也在漂。 "
  },
  "forge-throne": {
    kind: "piston-frames",
    label: "Piston Frames",
    mechanism: "前景会长出压下来的锻柱、活塞框和热口挡板。",
    cadence: "活塞会断续下砸，挡板会随重击一起闪一下。",
    impact: "让重型路线真正像有机械压力在往观众脸上推。 "
  },
  "eclipse-altar": {
    kind: "eclipse-curtains",
    label: "Eclipse Curtains",
    mechanism: "前景会落下阴影帘幕、弧形遮挡和仪式边框。",
    cadence: "阴影会一层层压下来，再慢慢让出中间视口。",
    impact: "把祭坛的仪式感推进到镜头前方。 "
  },
  "phase-cloister": {
    kind: "prism-gates",
    label: "Prism Gates",
    mechanism: "前景会出现折返门框、相位门和斜向扫描框。",
    cadence: "门框会交替错位，像不同回路在切换控制权。",
    impact: "让 Fusion / Prism 路线更像一个真的在运算和换路由的系统。 "
  },
  "prism-vortex": {
    kind: "prism-gates",
    label: "Prism Gates",
    mechanism: "前景会出现半透明棱镜门和旋转边框。",
    cadence: "门框会轮流错位，形成扫描穿堂感。",
    impact: "把未来感从背景继续推到前景。 "
  },
  "neon-causeway": {
    kind: "runway-drones",
    label: "Runway Drones",
    mechanism: "前景会飞出巡航灯点、边栏护标和冲刺 drone 轨迹。",
    cadence: "灯点会一批批往远端追送，护标会像路障一样掠过近景。",
    impact: "让速度感变成近景也在冲刺，而不是只有远处在快。 "
  },
  "tide-runway": {
    kind: "runway-drones",
    label: "Runway Drones",
    mechanism: "前景会出现导流灯点和纵深 marker。",
    cadence: "marker 会沿跑道连续递进。",
    impact: "让推进方向连近景都在往前拉。 "
  }
};

export function getStageMotionRig(visual: VisualParameters): StageMotionRig | null {
  const setpiece = getStageSetpiece(visual);

  if (!setpiece) {
    return null;
  }

  return MOTION_RIG_MAP[setpiece.kind] ?? null;
}
