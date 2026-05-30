import type { VisualParameters } from "../types/theory";

export type StageElementRoleKind =
  | "deck"
  | "lens"
  | "core"
  | "rail";

export interface StageElementRole {
  kind: StageElementRoleKind;
  label: string;
  placement: string;
  impact: string;
}

const ROLE_MAP: Record<string, StageElementRole> = {
  "Sun Deck": {
    kind: "deck",
    label: "Sun Deck",
    placement: "作为地基，偏暖的铺场会压在舞台下半部做底。",
    impact: "会让大调类模块像把一块发亮的地台先铺好。 "
  },
  "Night Deck": {
    kind: "deck",
    label: "Night Deck",
    placement: "作为地基，冷暗铺场会把底盘往夜色和阴影方向拉。",
    impact: "会让小调类模块像在舞台脚下放一层夜地板。 "
  },
  "Neon Deck": {
    kind: "deck",
    label: "Neon Deck",
    placement: "作为地基，霓虹刻线会先在下半区布出速度底盘。",
    impact: "会让五声音阶像给整场先打好节奏地网。 "
  },
  "Ritual Deck": {
    kind: "deck",
    label: "Ritual Deck",
    placement: "作为地基，祭坛式底盘会压低重心并增加咬合感。",
    impact: "会让和声小调先把场地变成可进行仪式的底座。 "
  },
  "Chrome Deck": {
    kind: "deck",
    label: "Chrome Deck",
    placement: "作为地基，平滑金属底盘会让整体更现代、更顺滑。",
    impact: "会让旋律小调像给舞台先铺上一块冷亮的合金地板。 "
  },
  "Day Lens": {
    kind: "lens",
    label: "Day Lens",
    placement: "作为透镜，会把高处空间往明亮、平衡、白昼方向拉开。",
    impact: "会让 Ionian 更像一层照着舞台的白昼镜片。 "
  },
  "Tide Lens": {
    kind: "lens",
    label: "Tide Lens",
    placement: "作为透镜，会把中层空间带向摆动、潮流和柔性偏移。",
    impact: "会让 Dorian 更像一层在舞台中段慢慢摆动的潮镜。 "
  },
  "Ember Lens": {
    kind: "lens",
    label: "Ember Lens",
    placement: "作为透镜，会把中层空气过滤成热灰和危险的张力色。",
    impact: "会让 Phrygian 更像一层带火星的热镜。 "
  },
  "Sky Lens": {
    kind: "lens",
    label: "Sky Lens",
    placement: "作为透镜，会把高位空间拉开，形成更强的上方开口。",
    impact: "会让 Lydian 更像一层真的把天空撑开的镜片。 "
  },
  "Brass Lens": {
    kind: "lens",
    label: "Brass Lens",
    placement: "作为透镜，会在中高层引入更硬、更亮的铜色推进感。",
    impact: "会让 Mixolydian 更像一层带铜轨反光的推进镜片。 "
  },
  "Halo Core": {
    kind: "core",
    label: "Halo Core",
    placement: "作为核心，会把主核外缘扩成更柔的环形亮晕。",
    impact: "会让 Maj7 真正站到舞台中心当柔亮核心。 "
  },
  "Orbit Core": {
    kind: "core",
    label: "Orbit Core",
    placement: "作为核心，会让内核像围着自己旋转，而不是只静止发光。",
    impact: "会让 Min7 更像一颗带外环的核心。 "
  },
  "Voltage Core": {
    kind: "core",
    label: "Voltage Core",
    placement: "作为核心，会把中心点拉成更像高压节点的强落点。",
    impact: "会让 Dominant7 的牵引直接压在舞台心脏位置。 "
  },
  "Fracture Core": {
    kind: "core",
    label: "Fracture Core",
    placement: "作为核心，会在中心长出更明显的裂冠和缺口。",
    impact: "会让 Dim7 的不稳定感集中到舞台正心。 "
  },
  "Prism Core": {
    kind: "core",
    label: "Prism Core",
    placement: "作为核心，会把中心切成带折射边的多角亮核。",
    impact: "会让 Aug 更像一颗会刺出棱角的主核。 "
  },
  "Cadence Rail": {
    kind: "rail",
    label: "Cadence Rail",
    placement: "作为轨道，会沿前后轴拉出终止导轨，把整句往落点送。",
    impact: "会让 II-V-I 像一条真正负责把舞台收束回来的轨道。 "
  },
  "Anthem Rail": {
    kind: "rail",
    label: "Anthem Rail",
    placement: "作为轨道，会沿地平线推开宽轨，像给整场开一条合唱大道。",
    impact: "会让 I-V-vi-IV 更像一条整场可持续推进的大路。 "
  }
};

export function getStageElementRoles(visual: VisualParameters): StageElementRole[] {
  return (visual.elementRoles ?? []).map((role) => ROLE_MAP[role]).filter(Boolean);
}
