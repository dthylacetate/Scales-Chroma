import type { VisualParameters } from "../types/theory";

export type StageVoiceprintKind =
  | "sun-ribbon"
  | "night-ribbon"
  | "neon-ticks"
  | "altar-teeth"
  | "chrome-flow"
  | "day-arch"
  | "tide-braid"
  | "ember-veil"
  | "sky-fan"
  | "brass-rails"
  | "velvet-halo"
  | "dusk-orbit"
  | "voltage-spear"
  | "fracture-crown"
  | "prism-spike"
  | "cadence-stairs"
  | "anthem-lane";

export interface StageVoiceprint {
  kind: StageVoiceprintKind;
  label: string;
  pattern: string;
  impact: string;
}

const VOICEPRINT_MAP: Record<string, StageVoiceprint> = {
  "Sun Ribbon": {
    kind: "sun-ribbon",
    label: "Sun Ribbon",
    pattern: "暖色长带会像晨光一样从舞台侧翼舒展开来。",
    impact: "会让明亮型模块的存在感更像一条正在铺开的日照带。 "
  },
  "Night Ribbon": {
    kind: "night-ribbon",
    label: "Night Ribbon",
    pattern: "冷色丝带会沿地平和前景慢慢压低重心。",
    impact: "会让小调类模块更像一段慢慢拽低舞台的夜带。 "
  },
  "Neon Ticks": {
    kind: "neon-ticks",
    label: "Neon Ticks",
    pattern: "霓虹刻线会沿着外圈和地面打出一连串节拍刻痕。",
    impact: "会把五声音阶的速度感拆成连续的小节点。 "
  },
  "Altar Teeth": {
    kind: "altar-teeth",
    label: "Altar Teeth",
    pattern: "锯齿状牙痕会围着内核向里收拢，像祭坛边缘在咬合。",
    impact: "会让和声小调的阴影张力更像有真实齿口。 "
  },
  "Chrome Flow": {
    kind: "chrome-flow",
    label: "Chrome Flow",
    pattern: "金属流线会在中心两侧滑动，像一层被抛光的液态回路。",
    impact: "会让旋律小调更像现代、顺滑、会折光的流体。 "
  },
  "Day Arch": {
    kind: "day-arch",
    label: "Day Arch",
    pattern: "高位拱线会在舞台上方撑出更开阔的白昼门框。",
    impact: "会让 Ionian 的明亮骨架被明确看见，而不只是变暖。 "
  },
  "Tide Braid": {
    kind: "tide-braid",
    label: "Tide Braid",
    pattern: "双股波带会彼此缠绕着向前推进，像潮汐在编织。",
    impact: "会让 Dorian 的律动感更像有编织纹路。 "
  },
  "Ember Veil": {
    kind: "ember-veil",
    label: "Ember Veil",
    pattern: "细碎热灰会像薄幕一样垂在中景前方。",
    impact: "会让 Phrygian 的炽热阴影更像空气里的帘幕。 "
  },
  "Sky Fan": {
    kind: "sky-fan",
    label: "Sky Fan",
    pattern: "扇面光束会从中心向上张开，像把天空一层层扇开。",
    impact: "会让 Lydian 的开放度被直接看见。 "
  },
  "Brass Rails": {
    kind: "brass-rails",
    label: "Brass Rails",
    pattern: "成对的铜色轨线会沿舞台前后方向铺开。",
    impact: "会让 Mixolydian 更像一条带推进性的铜轨。 "
  },
  "Velvet Halo": {
    kind: "velvet-halo",
    label: "Velvet Halo",
    pattern: "柔性光环会贴着主核外缘轻轻扩张。",
    impact: "会把 Maj7 的柔亮和包裹感直接抬到前景。 "
  },
  "Dusk Orbit": {
    kind: "dusk-orbit",
    label: "Dusk Orbit",
    pattern: "低位环轨会围着内核慢慢绕行，像黄昏的外环。",
    impact: "会让 Min7 更像一条围着舞台转的柔暗轨道。 "
  },
  "Voltage Spear": {
    kind: "voltage-spear",
    label: "Voltage Spear",
    pattern: "尖刺式直线会从中心向外猛刺，带着高压落点。",
    impact: "会让 Dominant7 的牵引和攻击性显得更直接。 "
  },
  "Fracture Crown": {
    kind: "fracture-crown",
    label: "Fracture Crown",
    pattern: "碎裂冠尖会围着中心一圈向外炸开。",
    impact: "会让 Dim7 的张力更像戴在舞台头顶的一圈裂冠。 "
  },
  "Prism Spike": {
    kind: "prism-spike",
    label: "Prism Spike",
    pattern: "棱镜刺束会从不同角度切进中心，像高亮折线在穿刺。",
    impact: "会把 Aug 的不稳定感变成更显眼的切入动作。 "
  },
  "Cadence Stairs": {
    kind: "cadence-stairs",
    label: "Cadence Stairs",
    pattern: "层层踏步会沿中心轴逐级递进，像结尾在搭台阶。",
    impact: "会把 II-V-I 的终止感直接做成可见的舞台阶梯。 "
  },
  "Anthem Lane": {
    kind: "anthem-lane",
    label: "Anthem Lane",
    pattern: "宽轨跑线会沿地平向远处推开，像一条能合唱的大路。",
    impact: "会让 I-V-vi-IV 更像一条整场都能一起唱过去的推进线。 "
  }
};

export function getStageVoiceprints(visual: VisualParameters): StageVoiceprint[] {
  return (visual.voiceprints ?? []).map((voiceprint) => VOICEPRINT_MAP[voiceprint]).filter(Boolean);
}
