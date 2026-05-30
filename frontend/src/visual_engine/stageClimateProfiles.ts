import type { VisualParameters } from "../types/theory";
import { getStageSynergyGlyph } from "./stageSynergyGlyphs";

export type StageClimateKind =
  | "solar-haze"
  | "velvet-mist"
  | "ember-ash"
  | "choir-dust"
  | "prism-fog"
  | "tide-vapor"
  | "neon-smog"
  | "sanctum-smoke";

export interface StageClimateProfile {
  kind: StageClimateKind;
  label: string;
  medium: string;
  motion: string;
  impact: string;
}

const BASE_CLIMATE_BY_SCENE: Record<VisualParameters["sceneFamily"], StageClimateProfile> = {
  "solar-garden": {
    kind: "solar-haze",
    label: "Solar Haze",
    medium: "空气里会漂一层偏金色的暖雾和薄光粉尘。",
    motion: "雾会向上抬，像开场热浪和天光一起慢慢铺开。",
    impact: "让明亮场景更像真正被天光灌满，而不是只有亮颜色。 "
  },
  "velvet-chamber": {
    kind: "velvet-mist",
    label: "Velvet Mist",
    medium: "空气会带一点丝绒粉雾和贴脸柔光颗粒。",
    motion: "雾面会近距离漂移，像布料在呼吸。",
    impact: "让 Neo Soul / Velvet 路线更近、更软，也更有人体温度。 "
  },
  "metal-foundry": {
    kind: "ember-ash",
    label: "Ember Ash",
    medium: "空气里会悬一层热灰、余烬和切碎的亮点。",
    motion: "灰烬会往斜上方冲，像熔炉风口一直在吐气。",
    impact: "让高张力场景更像真的有热量和粉尘在压人。 "
  },
  "jazz-cathedral": {
    kind: "choir-dust",
    label: "Choir Dust",
    medium: "空气里会有更冷一点的礼堂微尘和悬浮粒雾。",
    motion: "微尘会沿中轴和拱顶缓慢上升。",
    impact: "让和声教堂不只是骨架规整，而是真的像有空气深度。 "
  },
  "prism-array": {
    kind: "prism-fog",
    label: "Prism Fog",
    medium: "空气会带一层折色薄雾和扫描粒屑。",
    motion: "雾会按斜向切线被不断刷过。",
    impact: "让棱镜路线更像一套正在运行的光学系统。 "
  },
  "nocturne-tide": {
    kind: "tide-vapor",
    label: "Tide Vapor",
    medium: "空气里会有潮汽、低位水雾和冷色呼气层。",
    motion: "潮汽会贴着地平线和波面慢慢回涌。",
    impact: "让夜潮路线更像真的在水汽里发生，而不是只有蓝色。 "
  },
  "neon-grid": {
    kind: "neon-smog",
    label: "Neon Smog",
    medium: "空气会被一层霓虹烟尘和电性颗粒占满。",
    motion: "烟尘会顺着前冲方向被持续带走。",
    impact: "让速度型场景更像夜路、街区和赛道一起发亮。 "
  },
  "shadow-sanctum": {
    kind: "sanctum-smoke",
    label: "Sanctum Smoke",
    medium: "空气里会积一层冷烟、暗灰和慢速阴雾。",
    motion: "烟会绕着中心缓慢打转，再往内坍。",
    impact: "让阴影型场景更像被真正的仪式烟雾占领。 "
  }
};

export function getStageClimateProfile(visual: VisualParameters): StageClimateProfile {
  const base = BASE_CLIMATE_BY_SCENE[visual.sceneFamily];
  const glyph = getStageSynergyGlyph(visual);

  if (!glyph) {
    return base;
  }

  if (glyph.label === "Horizon Bloom") {
    return {
      ...base,
      label: "Bloom Haze",
      medium: "空气里会额外带一层被日冕点亮的暖雾和亮粉。",
      motion: "雾会沿中轴向上抬，再顺着拱形缓慢散开。",
      impact: "让高开放度与终止牵引的绽放感真正漫进空气里。 "
    };
  }

  if (glyph.label === "Abyss Pressure") {
    return {
      ...base,
      label: "Abyss Smoke",
      medium: "空气里会被更重的暗烟和压缩雾井占住。",
      motion: "烟层会向内收、向下压，像在持续坍缩。",
      impact: "让深井式张力不只存在于形状里，而是连空气都在收紧。 "
    };
  }

  if (glyph.label === "Slipstream Pocket") {
    return {
      ...base,
      label: "Slipstream Air",
      medium: "空气会带一层被速度切开的导流雾和细碎拖尾。",
      motion: "雾会顺着 sweep 被整股送走。",
      impact: "让推进感更像真的有风压扑脸。 "
    };
  }

  if (glyph.label === "Prism Surge") {
    return {
      ...base,
      label: "Prism Charge",
      medium: "空气会被折色电雾和扫描粒光进一步充满。",
      motion: "电雾会被斜向切线不断重画。",
      impact: "让 surge 不只是结构复杂，而像整层空气都在带电。 "
    };
  }

  return base;
}
