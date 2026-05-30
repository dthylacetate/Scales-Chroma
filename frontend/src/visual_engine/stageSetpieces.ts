import type { VisualParameters } from "../types/theory";

export type StageSetpieceKind =
  | "choir-vault"
  | "silken-halo"
  | "rose-arcade"
  | "blue-cloister"
  | "forge-throne"
  | "phase-cloister"
  | "neon-causeway"
  | "aurora-dais"
  | "velvet-arcade"
  | "eclipse-altar"
  | "prism-vortex"
  | "tide-runway";

export interface StageSetpiece {
  kind: StageSetpieceKind;
  label: string;
  cue: string;
  rig: string;
  impact: string;
}

const ACTIVE_BONUS_SETPIECES: Array<{ needle: string; setpiece: StageSetpiece }> = [
  {
    needle: "Choir Vault",
    setpiece: {
      kind: "choir-vault",
      label: "Choir Vault",
      cue: "同一座 Aurora Dais 被 Jazz 路线继续推成和声窗格与悬挂穹顶。",
      rig: "顶部吊架、纵向窗格、拱形合唱廊。",
      impact: "更像一座被声部秩序接管的礼堂，而不是只有发光拱门。 "
    }
  },
  {
    needle: "Silken Halo",
    setpiece: {
      kind: "silken-halo",
      label: "Silken Halo",
      cue: "同一座 Aurora Dais 被 Neo Soul 路线继续软化成柔幕和环抱式灯纱。",
      rig: "双侧帘幕、贴身光环、柔性前景幕布。",
      impact: "舞台会更近、更圆、更像一层会呼吸的织物把空间包起来。 "
    }
  },
  {
    needle: "Rose Arcade",
    setpiece: {
      kind: "rose-arcade",
      label: "Rose Arcade",
      cue: "Velvet Arcade 又被 Neo Soul 路线改写成更浪漫的走廊和玫瑰色拱券。",
      rig: "拱廊窗、柔性立柱、贴地灯带。",
      impact: "同样是长廊结构，但这里更强调身体感和近距离包裹。 "
    }
  },
  {
    needle: "Blue Cloister",
    setpiece: {
      kind: "blue-cloister",
      label: "Blue Cloister",
      cue: "Velvet Arcade 被 Jazz 路线继续拉向更冷静、更讲究秩序的修道院回廊。",
      rig: "纵向窗格、冷色回廊、节制型灯带。",
      impact: "空间会更规整，像让声部行进路线直接可视化。 "
    }
  },
  {
    needle: "Forge Throne",
    setpiece: {
      kind: "forge-throne",
      label: "Forge Throne",
      cue: "Eclipse Altar 被 Metal 路线压成更硬、更像高台王座的熔炉结构。",
      rig: "中央王座、侧向锻柱、上压式火口。",
      impact: "暗色祭坛不再只是神秘，而会更像真正带重量的压迫现场。 "
    }
  },
  {
    needle: "Phase Cloister",
    setpiece: {
      kind: "phase-cloister",
      label: "Phase Cloister",
      cue: "Prism Vortex 被 Fusion 路线折成相位走廊，开始出现多层回返通道。",
      rig: "折射门框、回旋通道、相位环走廊。",
      impact: "同样的棱镜旋涡会更像一个在自我复写的系统内部。 "
    }
  },
  {
    needle: "Neon Causeway",
    setpiece: {
      kind: "neon-causeway",
      label: "Neon Causeway",
      cue: "Tide Runway 被 Pentatonic 路线拉成更明确的霓虹跑道和巡航车道。",
      rig: "跑道灯钉、护栏光带、远端冲刺线。",
      impact: "推进感会从‘有点快’升级成真正像在向前压过去。 "
    }
  }
];

const CASCADE_SETPIECES: Record<Exclude<VisualParameters["sceneCascade"], "neutral">, StageSetpiece> = {
  "aurora-dais": {
    kind: "aurora-dais",
    label: "Aurora Dais",
    cue: "明亮三元结构把舞台托成高台、穹顶和拱幕。",
    rig: "抬升台阶、穹顶拱幕、礼台光环。",
    impact: "像把单个光团升级成能容纳整场和声表演的礼台。 "
  },
  "velvet-arcade": {
    kind: "velvet-arcade",
    label: "Velvet Arcade",
    cue: "流动型三元结构会把舞台拉成柔性的长廊空间。",
    rig: "拱廊走道、垂直立柱、前景慢速灯带。",
    impact: "空间会更像可以穿过的一条演出路径。 "
  },
  "forge-ritual": {
    kind: "eclipse-altar",
    label: "Forge Ritual",
    cue: "高张力组合会把舞台压成锻造架和火口结构。",
    rig: "锻造横梁、碎片雨、熔口热区。",
    impact: "舞台会更像一套真正的重型装置，而不是单纯暗一点。 "
  },
  "prism-vortex": {
    kind: "prism-vortex",
    label: "Prism Vortex",
    cue: "现代张力三元结构会把舞台扭成棱镜通道和折射核心。",
    rig: "旋转门框、折射三角、相位回圈。",
    impact: "舞台会有更强的系统感和未来空间感。 "
  },
  "tide-runway": {
    kind: "tide-runway",
    label: "Tide Runway",
    cue: "推进型三元组合会把舞台拉成纵深很长的地平跑道。",
    rig: "前冲跑道、节拍护栏、远端灯点。",
    impact: "速度感会更像真的有方向，而不是只在中心打转。 "
  },
  "eclipse-altar": {
    kind: "eclipse-altar",
    label: "Eclipse Altar",
    cue: "暗色高摩擦结构会把舞台搭成祭坛和环形影纹。",
    rig: "祭坛圆环、辐条阴影、仪式化地面。",
    impact: "空间会从‘偏黑’变成真正有宗教感的仪式现场。 "
  }
};

export function getStageSetpiece(visual: VisualParameters): StageSetpiece | null {
  const activeText = visual.activeBonuses.join(" ");

  for (const item of ACTIVE_BONUS_SETPIECES) {
    if (activeText.includes(item.needle)) {
      return item.setpiece;
    }
  }

  if (visual.sceneCascade !== "neutral") {
    return CASCADE_SETPIECES[visual.sceneCascade];
  }

  return null;
}
