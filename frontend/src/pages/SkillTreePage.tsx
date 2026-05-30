import { Activity, GitBranch, Lock, Sparkles, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { getSkillTree, getUnlockedEffects, type SkillTree, type UnlockedEffect } from "../services/progressionApi";

interface SkillTreePageProps {
  apiBaseUrl?: string;
  authToken?: string;
}

const DEMO_SKILL_TREE: SkillTree = {
  userId: 0,
  branches: [
    {
      direction: "Metal",
      nodes: [
        { id: "palm-mute", label: "Palm Mute", level: 0, unlocked: false },
        { id: "sweep-picking", label: "Sweep Picking", level: 0, unlocked: false }
      ]
    },
    {
      direction: "Jazz",
      nodes: [
        { id: "ii-v-i", label: "II-V-I", level: 0, unlocked: false },
        { id: "altered-dominants", label: "Altered Dominants", level: 0, unlocked: false }
      ]
    },
    {
      direction: "Fusion",
      nodes: [
        { id: "legato", label: "Legato", level: 0, unlocked: false },
        { id: "hybrid-picking", label: "Hybrid Picking", level: 0, unlocked: false }
      ]
    },
    {
      direction: "Neo Soul",
      nodes: [
        { id: "maj7-voicings", label: "Maj7 Voicings", level: 0, unlocked: false },
        { id: "double-stops", label: "Double Stops", level: 0, unlocked: false }
      ]
    }
  ]
};

const BRANCH_GUIDES: Record<string, { summary: string; topics: string[]; unlocks: string[]; visual: string }> = {
  Metal: {
    summary: "偏向速度、下拨、riff、扫拨和高能张力。练习越多，舞台会更锋利、更爆裂。",
    topics: ["下拨", "金属 riff", "palm mute", "sweep picking", "速弹"],
    unlocks: ["碎裂爆发", "余烬频闪"],
    visual: "高对比碎片、噪点、短促光束和压迫感结构。"
  },
  Jazz: {
    summary: "偏向 II-V-I、七和弦、voice leading 和复杂但有秩序的和声移动。",
    topics: ["251", "II-V-I", "爵士", "shell voicing", "altered dominant"],
    unlocks: ["和声晶格", "终止绽放"],
    visual: "晶格、拱顶、城市天际线和更清晰的终止牵引。"
  },
  Fusion: {
    summary: "把摇滚、爵士、funk 的技术和外部音结合，强调流动、相位和棱镜感。",
    topics: ["融合", "连奏", "legato", "hybrid picking", "outside"],
    unlocks: ["棱镜运动", "相位环"],
    visual: "相位环、折射路径、速度轨道和多层色彩错位。"
  },
  "Neo Soul": {
    summary: "偏向 Maj7、Min7、双音、丝滑节奏和更柔软的和声色彩。",
    topics: ["neo soul", "新灵魂", "Maj7", "double stop", "双音"],
    unlocks: ["丝绒辉光", "绸缎流动"],
    visual: "柔光幕纱、丝绒波面、近距离包裹感和暖色扩散。"
  }
};

export function SkillTreePage({ apiBaseUrl, authToken }: SkillTreePageProps) {
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [effects, setEffects] = useState<UnlockedEffect[]>([]);
  const [loading, setLoading] = useState(Boolean(apiBaseUrl && authToken));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiBaseUrl || !authToken) {
      setSkillTree(DEMO_SKILL_TREE);
      setEffects([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getSkillTree({ apiBaseUrl, authToken }),
      getUnlockedEffects({ apiBaseUrl, authToken })
    ])
      .then(([nextTree, nextEffects]) => {
        if (!cancelled) {
          setSkillTree(nextTree);
          setEffects(nextEffects);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("技能树读取失败，请稍后重试。");
          setSkillTree(DEMO_SKILL_TREE);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken]);

  const tree = skillTree ?? DEMO_SKILL_TREE;
  const unlockedCount = useMemo(
    () => tree.branches.flatMap((branch) => branch.nodes).filter((node) => node.unlocked).length,
    [tree]
  );
  const totalNodes = tree.branches.flatMap((branch) => branch.nodes).length;

  return (
    <main className="min-h-screen bg-[#120f12] text-stone-100">
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6">
        <header className="grid gap-4 border-b border-[#5bd0c7]/15 pb-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5bd0c7]">
            <GitBranch aria-hidden="true" className="size-4" />
            技能树与成长路线
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-stone-50 md:text-5xl">练习会改变你的舞台能力</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300 md:text-base">
                技能树不是单纯等级列表。它记录你练习了哪类音乐语言，并把这些成长永久转化成沙盘视觉能力：Metal 会更爆裂，Jazz 会长出和声晶格，Fusion 会出现相位结构，Neo Soul 会变得更柔软。
              </p>
            </div>
            <div className="grid gap-2 rounded-md border border-[#3f3144] bg-[#18131b] p-4">
              <Metric label="已点亮节点" value={`${unlockedCount}/${totalNodes}`} />
              <Metric label="已解锁视觉" value={`${effects.length}`} />
              <Metric label="当前状态" value={loading ? "读取中" : error ? "离线展示" : "已同步"} />
            </div>
          </div>
          {error ? <div className="rounded-md border border-[#ff8fa3]/30 bg-[#2a171e] px-3 py-2 text-sm text-[#ffb8c5]">{error}</div> : null}
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {tree.branches.map((branch) => {
            const guide = BRANCH_GUIDES[branch.direction] ?? {
              summary: "持续练习会提升这一方向的等级，并逐步影响视觉舞台。",
              topics: [],
              unlocks: [],
              visual: "持续增加细节层。"
            };
            const branchProgress = branch.nodes.length === 0 ? 0 : branch.nodes.filter((node) => node.unlocked).length / branch.nodes.length;

            return (
              <article key={branch.direction} className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-normal text-stone-50">{branch.direction}</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-300">{guide.summary}</p>
                  </div>
                  <div className="grid size-14 place-items-center rounded-md border border-[#5bd0c7]/30 bg-[#142225] text-sm font-semibold text-[#b9fff7]">
                    {Math.round(branchProgress * 100)}%
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {branch.nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`grid gap-1 rounded-md border px-3 py-2 ${
                        node.unlocked ? "border-[#ffd166]/35 bg-[#25231a]" : "border-white/5 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-50">
                          {node.unlocked ? <Trophy aria-hidden="true" className="size-4 text-[#ffd166]" /> : <Lock aria-hidden="true" className="size-4 text-stone-500" />}
                          {node.label}
                        </div>
                        <span className="text-xs text-stone-300">Lv {node.level}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#120f12]">
                        <div className="h-full rounded-full bg-[#5bd0c7]" style={{ width: `${Math.min(100, node.level * 20)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 text-sm">
                  <InfoBlock icon={<Activity aria-hidden="true" className="size-4" />} title="推荐练习主题" items={guide.topics} />
                  <InfoBlock icon={<Sparkles aria-hidden="true" className="size-4" />} title="可解锁视觉能力" items={guide.unlocks} />
                  <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2 leading-6 text-stone-300">
                    <span className="font-semibold text-[#b9fff7]">舞台变化：</span>
                    {guide.visual}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
          <h2 className="text-lg font-semibold tracking-normal text-stone-50">怎么解锁？</h2>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-stone-300 md:grid-cols-3">
            <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">在沙盘右侧练习记录里填写主题，例如“下拨速度练习”或“融合连奏”。</div>
            <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">系统会按主题关键词归入对应路线，并根据练习分钟数提升节点等级。</div>
            <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">达到阈值后，视觉能力会永久解锁，并在中间舞台里改变粒子、波纹、几何和光场。</div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2">
      <span className="text-xs text-stone-400">{label}</span>
      <span className="text-sm font-semibold text-stone-50">{value}</span>
    </div>
  );
}

function InfoBlock({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2 font-semibold text-[#ffd166]">
        {icon}
        {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-sm border border-[#3f3144] bg-[#151217] px-2 py-1 text-xs text-stone-300">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
