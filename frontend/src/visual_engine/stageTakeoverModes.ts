import type { VisualParameters } from "../types/theory";
import { getStageSetpiece } from "./stageSetpieces";

export type StageTakeoverKind =
  | "cathedral-iris"
  | "velvet-drape"
  | "forge-slam"
  | "prism-scanline"
  | "runway-rush"
  | "eclipse-veil";

export interface StageTakeoverMode {
  kind: StageTakeoverKind;
  label: string;
  trigger: string;
  gesture: string;
  impact: string;
}

const TAKEOVER_MODE_MAP: Record<string, StageTakeoverMode> = {
  "choir-vault": {
    kind: "cathedral-iris",
    label: "Cathedral Iris",
    trigger: "当礼堂系人格接管时，舞台会像穹顶开闸一样往中心收束再打开。",
    gesture: "拱形开闸和圆形礼堂波会一层层盖下来，再把中心重新点亮。",
    impact: "换场会更像一整座礼堂在接管舞台，而不是单纯亮一下。 "
  },
  "aurora-dais": {
    kind: "cathedral-iris",
    label: "Cathedral Iris",
    trigger: "明亮礼台接管时，会先形成开场拱闸。",
    gesture: "圆形开闸和礼台波会往中心收束再回放。",
    impact: "亮场切换会更像正式开场 cue。 "
  },
  "blue-cloister": {
    kind: "cathedral-iris",
    label: "Cathedral Iris",
    trigger: "修道院式秩序接管时，会先压下一层冷色窗闸。",
    gesture: "窗格波会按秩序向内收束。",
    impact: "换场会更像声部秩序在把画面重新编队。 "
  },
  "silken-halo": {
    kind: "velvet-drape",
    label: "Velvet Drape",
    trigger: "丝绒路线接管时，画面会先被近景幕纱温柔包一下。",
    gesture: "双侧幕光和柔幕会先合上，再慢慢让出中心。",
    impact: "换场会更像整场被布料包住，而不是一个生硬 cut。 "
  },
  "rose-arcade": {
    kind: "velvet-drape",
    label: "Velvet Drape",
    trigger: "暖色回廊接管时，会先铺一层贴身柔幕。",
    gesture: "幕纱会顺着走廊轻轻扫过视口。",
    impact: "切换会更像慢舞换场。 "
  },
  "velvet-arcade": {
    kind: "velvet-drape",
    label: "Velvet Drape",
    trigger: "丝绒长廊接管时，会先用柔幕把空间抚平。",
    gesture: "侧幕会一层层包过来再退开。",
    impact: "让换场更顺滑、更像被空间亲手接住。 "
  },
  "forge-throne": {
    kind: "forge-slam",
    label: "Forge Slam",
    trigger: "熔炉路线接管时，会先给一记重击式压顶和热口闪爆。",
    gesture: "上压闸门、重击线和热口闪区会同时砸下来。",
    impact: "换场会更像重型现场突然夺走控制权。 "
  },
  "eclipse-altar": {
    kind: "eclipse-veil",
    label: "Eclipse Veil",
    trigger: "祭坛路线接管时，会先压暗一层阴影帘幕。",
    gesture: "暗环和帘幕会沿边缘收拢，再一点点回亮。",
    impact: "切换会更像仪式开始，而不是普通转场。 "
  },
  "phase-cloister": {
    kind: "prism-scanline",
    label: "Prism Scanline",
    trigger: "相位路线接管时，会先用扫描框把空间重新寻址。",
    gesture: "斜向扫描线和折返边框会切走旧舞台，再点亮新结构。",
    impact: "换场会更像系统重路由。 "
  },
  "prism-vortex": {
    kind: "prism-scanline",
    label: "Prism Scanline",
    trigger: "棱镜旋涡接管时，会先用扫描条重画空间。",
    gesture: "扫描线会沿斜向快速刷过视口。",
    impact: "切换会更像光学系统重建。 "
  },
  "neon-causeway": {
    kind: "runway-rush",
    label: "Runway Rush",
    trigger: "跑道路线接管时，会先用近景追光把节拍往远端猛送。",
    gesture: "冲刺箭头、边灯和前冲 sweep 会把旧舞台直接带走。",
    impact: "换场会更像整条赛道突然起跑。 "
  },
  "tide-runway": {
    kind: "runway-rush",
    label: "Runway Rush",
    trigger: "纵深跑道接管时，会先用导流 sweep 重排方向。",
    gesture: "跑道线会快速冲向远端再展开。",
    impact: "方向感会在切换瞬间就立住。 "
  }
};

export function getStageTakeoverMode(visual: VisualParameters): StageTakeoverMode | null {
  const setpiece = getStageSetpiece(visual);

  if (!setpiece) {
    return null;
  }

  return TAKEOVER_MODE_MAP[setpiece.kind] ?? null;
}
