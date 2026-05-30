import { Activity, CalendarDays, Flame, GitBranch, Grip, Layers, Save, Search, Send, Sparkles, Trash2, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { RealtimeCanvasRenderer } from "../canvas/RealtimeCanvasRenderer";
import { deleteComposition, getSavedCompositions, saveComposition, type SavedComposition, updateComposition } from "../services/compositionsApi";
import {
  createPracticeRecord,
  getPracticeRecords,
  type PracticeRecordHistoryItem,
  type PracticeRecordResult
} from "../services/practiceRecordsApi";
import {
  getSkillTree,
  getUnlockedEffects,
  getYearlyHeatmap,
  type SkillTree,
  type UnlockedEffect,
  type YearlyHeatmap
} from "../services/progressionApi";
import { renderSandboxVisual } from "../services/sandboxApi";
import type { TheoryElement, VisualParameters } from "../types/theory";
import { getStageSetpiece } from "../visual_engine/stageSetpieces";
import { mapTheoryToVisuals } from "../visual_engine/mapTheoryToVisuals";

const THEORY_LIBRARY: TheoryElement[] = [
  { id: "major", type: "scale", name: "Major" },
  { id: "minor", type: "scale", name: "Minor" },
  { id: "pentatonic", type: "scale", name: "Pentatonic" },
  { id: "harmonic-minor", type: "scale", name: "Harmonic Minor" },
  { id: "melodic-minor", type: "scale", name: "Melodic Minor" },
  { id: "ionian", type: "mode", name: "Ionian" },
  { id: "dorian", type: "mode", name: "Dorian" },
  { id: "phrygian", type: "mode", name: "Phrygian" },
  { id: "lydian", type: "mode", name: "Lydian" },
  { id: "mixolydian", type: "mode", name: "Mixolydian" },
  { id: "maj7", type: "chord", name: "Maj7" },
  { id: "min7", type: "chord", name: "Min7" },
  { id: "dominant7", type: "chord", name: "Dominant7" },
  { id: "dim7", type: "chord", name: "Dim7" },
  { id: "aug", type: "chord", name: "Aug" },
  { id: "ii-v-i", type: "progression", name: "II-V-I" },
  { id: "i-v-vi-iv", type: "progression", name: "I-V-vi-IV" }
];

const VISUAL_BONUS_COPY: Record<string, string> = {
  "Celestial Bloom": "Lydian 与 Maj7 叠出更明亮、更抬升的和声光晕。",
  "Sunwake Atlas": "大调明亮感被进一步推向开阔、日照式的舞台展开。",
  "Midnight Current": "Dorian 与 Min7 形成夜色流动感，波纹更深更宽。",
  "Blue Hour Run": "Dorian 与 II-V-I 让舞台同时拥有流线与和声晶格。",
  "Desert Voltage": "Phrygian 与 Dominant7 把紧张感拉向炽热、偏危险的边缘。",
  "Occult Fracture": "Harmonic Minor 与 Dim7 触发神秘、碎裂、阴影更重的舞台。",
  "Chrome Meridian": "Melodic Minor 与 Dominant7 带来更现代、更锋利的流体断层。",
  "Cadence Aurora": "II-V-I 与 Maj7 会抬高和声晶格与尾音扩散感。",
  "Anthem Lift": "常见流行进行与大调会让舞台更外放、更有抬升感。",
  "Daybreak Parade": "Ionian 与 I-V-vi-IV 形成更直接的日光式推进。",
  "Roadhouse Neon": "五声音阶与 Mixolydian 更偏街头霓虹和推进律动。",
  "Midnight Run": "Minor 与 Pentatonic 会得到更冷、更贴地的夜跑节奏。",
  "Brass Overdrive": "Mixolydian 与 Dominant7 会把晶格、铜色张力和驱动感推高。",
  "Prism Flare": "Aug 与 Lydian 会制造更闪、更炸裂的棱镜爆光。",
  "Skyline Halo": "Lydian 与 II-V-I 让舞台同时打开天空感和和声拱顶。",
  "Ashen Rite": "Phrygian 与 Dim7 会把场景压向更冷、更仪式化的阴影深处。",
  "Glass Current": "Dorian 与 Maj7 让流动感里带上一层玻璃般的柔亮反射。",
  "Neon Lantern": "五声音阶与 Maj7 会把街头霓虹和暖色灯笼感叠到一起。",
  "Liquid Aurora": "Melodic Minor 与 Maj7 会把流体、辉光和现代和声拉得更顺滑。",
  "Copper Skyline": "Mixolydian 与 II-V-I 会把铜色推进和都市晶格同时拉高。",
  "Neon Trail": "五声音阶成长路线会把粒子拖尾和霓虹对比拉高。",
  "Jazz Skyline": "Jazz 成长路线会让舞台更像层层展开的和声天际线。",
  "Metal Shrapnel": "Metal 成长路线会把碎裂、噪点和爆裂光束推到前台。",
  "Velvet Tide": "Neo Soul 成长路线会让舞台更柔、更丝滑、更贴近丝绒灯光。",
  "Fusion Prism": "Fusion 成长路线会让波相、晶格和色彩相位同时活跃。"
};

const EFFECT_COPY: Record<string, { title: string; description: string }> = {
  particle_trail: { title: "粒子拖尾", description: "拖尾粒子会延长动作残影，让速度感更明显。" },
  neon_glow: { title: "霓虹辉光", description: "整体对比和辅色亮度提升，舞台会更亮更跳。" },
  dynamic_ripple: { title: "动态波纹", description: "波纹层数和运动感上升，舞台更有扩散律动。" },
  harmonic_lattice: { title: "和声晶格", description: "Jazz 路线核心特效，舞台会长出更明显的网格骨架。" },
  cadence_bloom: { title: "终止绽放", description: "和声终止感会变得更柔亮、更有尾韵。" },
  fracture_burst: { title: "碎裂爆发", description: "Metal 路线核心特效，舞台会更锋利、更爆裂。" },
  ember_strobe: { title: "余烬频闪", description: "高能碎片和暖色脉冲被进一步放大。" },
  velvet_glow: { title: "丝绒辉光", description: "Neo Soul 路线核心特效，柔亮外层会更厚、更近人。" },
  silk_motion: { title: "绸缎流动", description: "舞台运动会更顺滑，波面更像连续织物。" },
  prismatic_motion: { title: "棱镜运动", description: "Fusion 路线会把色彩层次和相位流动拉开。" },
  phase_rings: { title: "相位环", description: "多层环形结构会更明显，形成更复杂的空间节奏。" }
};

const THEORY_SYNERGY_COPY: Record<string, string> = {
  "Radiant Voicing": "明亮调式和开放和弦彼此抬升，让空间更像被向外撑开。",
  "Cadential Lift": "进行与和弦对齐后，舞台会更有终止感和向中心收束的牵引。",
  "Groove Pocket": "摆动型调式与七和弦会把舞台推向更明显的律动口袋。",
  "Shadow Magnet": "暗色调式与高张力和弦互相吸引，会把舞台压向阴影与摩擦。",
  "Color Convergence": "当音阶、调式、和弦、进行同时出现，颜色和空间会更容易融合成完整结构。",
  "Silken Resolve": "柔和和弦与缓行波面会让舞台的终止更像贴近身体的呼吸。"
};

const GROWTH_PREVIEW_OPTIONS: Array<{
  id: "actual" | Exclude<VisualParameters["growthImprint"], "neutral">;
  label: string;
  hint: string;
}> = [
  { id: "actual", label: "真实成长", hint: "使用当前账号已经解锁的真实成长轨迹。" },
  { id: "jazz-lattice", label: "Jazz", hint: "预览和声窗格、教堂纵深和秩序感。" },
  { id: "neo-soul-veil", label: "Neo Soul", hint: "预览丝绒幕纱、柔波和包裹式光层。" },
  { id: "metal-forge", label: "Metal", hint: "预览熔炉切面、碎片雨和压顶结构。" },
  { id: "fusion-phase", label: "Fusion", hint: "预览相位环、折射回路和棱镜走廊。" },
  { id: "pentatonic-drive", label: "Pentatonic", hint: "预览霓虹推进线、巡航节点和速度场。" }
];

interface TheorySandboxProps {
  apiBaseUrl?: string;
  authToken?: string;
  currentUsername?: string;
  onLogout?: () => void;
}

export function TheorySandbox({ apiBaseUrl, authToken, currentUsername, onLogout }: TheorySandboxProps) {
  const [selected, setSelected] = useState<TheoryElement>(THEORY_LIBRARY[5]);
  const [composition, setComposition] = useState<TheoryElement[]>([]);
  const [invalidHint, setInvalidHint] = useState<string | null>(null);
  const [stageDropActive, setStageDropActive] = useState(false);
  const [laneDropActive, setLaneDropActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RealtimeCanvasRenderer | null>(null);
  const [practiceDate, setPracticeDate] = useState("2026-05-29");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [bpm, setBpm] = useState("120");
  const [practiceTopic, setPracticeTopic] = useState("Maj7 voicing");
  const [practiceNotes, setPracticeNotes] = useState("");
  const [practiceResult, setPracticeResult] = useState<PracticeRecordResult | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeRecordHistoryItem[]>([]);
  const [historyTopicFilter, setHistoryTopicFilter] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);
  const [skillTree, setSkillTree] = useState<SkillTree | null>(null);
  const [heatmap, setHeatmap] = useState<YearlyHeatmap | null>(null);
  const [unlockedEffects, setUnlockedEffects] = useState<UnlockedEffect[]>([]);
  const [savedCompositions, setSavedCompositions] = useState<SavedComposition[]>([]);
  const [compositionName, setCompositionName] = useState("");
  const [selectedCompositionId, setSelectedCompositionId] = useState<number | null>(null);
  const [compositionSaving, setCompositionSaving] = useState(false);
  const [compositionDeletingId, setCompositionDeletingId] = useState<number | null>(null);
  const [compositionError, setCompositionError] = useState<string | null>(null);
  const [visualRefreshKey, setVisualRefreshKey] = useState(0);
  const [previewGrowthImprint, setPreviewGrowthImprint] = useState<"actual" | Exclude<VisualParameters["growthImprint"], "neutral">>("actual");
  const activeElement = composition.at(-1) ?? selected;
  const activeElements = useMemo(() => (composition.length > 0 ? composition : [selected]), [composition, selected]);
  const localVisual = useMemo(() => mapTheoryToVisuals(activeElements), [activeElements]);
  const [visual, setVisual] = useState<VisualParameters>(localVisual);

  useEffect(() => {
    let cancelled = false;
    setVisual(localVisual);

    if (!apiBaseUrl || !authToken) {
      return () => {
        cancelled = true;
      };
    }

    renderSandboxVisual({
      apiBaseUrl,
      authToken,
      elements: activeElements,
      previewGrowthImprint: previewGrowthImprint === "actual" ? undefined : previewGrowthImprint
    })
      .then((enhancedVisual) => {
        if (!cancelled) {
          setVisual(enhancedVisual);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisual(localVisual);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeElements, apiBaseUrl, authToken, localVisual, previewGrowthImprint, visualRefreshKey]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new RealtimeCanvasRenderer(canvas);
    renderer.resize(canvas.clientWidth || 720, canvas.clientHeight || 420);
    rendererRef.current = renderer;

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.start(visual);
  }, [visual]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !authToken) {
      setSkillTree(null);
      return () => {
        cancelled = true;
      };
    }

    getSkillTree({ apiBaseUrl, authToken })
      .then((nextSkillTree) => {
        if (!cancelled && Array.isArray(nextSkillTree.branches)) {
          setSkillTree(nextSkillTree);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSkillTree(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !authToken) {
      setHeatmap(null);
      return () => {
        cancelled = true;
      };
    }

    getYearlyHeatmap({
      apiBaseUrl,
      authToken,
      year: new Date(practiceDate).getFullYear()
    })
      .then((nextHeatmap) => {
        if (!cancelled && Array.isArray(nextHeatmap.days)) {
          setHeatmap(nextHeatmap);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeatmap(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken, practiceDate, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !authToken) {
      setUnlockedEffects([]);
      return () => {
        cancelled = true;
      };
    }

    getUnlockedEffects({ apiBaseUrl, authToken })
      .then((effects) => {
        if (!cancelled) {
          setUnlockedEffects(effects);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUnlockedEffects([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !authToken) {
      setPracticeHistory([]);
      return () => {
        cancelled = true;
      };
    }

    getPracticeRecords({ apiBaseUrl, authToken, limit: 5 })
      .then((records) => {
        if (!cancelled) {
          setPracticeHistory(records);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPracticeHistory([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !authToken) {
      setSavedCompositions([]);
      return () => {
        cancelled = true;
      };
    }

    getSavedCompositions({ apiBaseUrl, authToken })
      .then((compositions) => {
        if (!cancelled) {
          setSavedCompositions(compositions);
          if (compositions.length > 0 && !selectedCompositionId) {
            setCompositionName((current) => current || compositions[0].name);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedCompositions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken]);

  return (
    <main className="min-h-screen bg-[#120f12] text-stone-100">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        <aside className="flex flex-col gap-3 rounded-lg border border-[#d8a657]/20 bg-[#18131b]/90 p-3 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-[#5bd0c7]/15 pb-3">
            <Sparkles aria-hidden="true" className="size-5 text-[#5bd0c7]" />
            <h1 className="text-xl font-semibold tracking-normal">Scales &amp; Chroma</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {THEORY_LIBRARY.map((element) => (
              <button
                key={element.id}
                draggable
                className={`flex min-h-11 items-center justify-between rounded-md border px-3 text-left text-sm transition ${
                  activeElement.id === element.id
                    ? "border-[#ffd166] bg-[#ffd166] text-[#16110f]"
                    : "border-[#3f3144] bg-[#201922] text-stone-100 hover:border-[#5bd0c7]"
                }`}
                type="button"
                onClick={() => setSelected(element)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", element.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <span className="flex items-center gap-2 font-medium">
                  <Grip aria-hidden="true" className="size-3.5 opacity-60" />
                  {element.name}
                </span>
                <span className="text-xs uppercase opacity-70">{element.type}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="grid min-h-[560px] gap-3 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:grid-rows-[minmax(0,1fr)_auto]">
          <div
            aria-label="视觉舞台拖放区"
            className={`relative min-h-[360px] overflow-hidden rounded-lg border bg-[#090809] transition ${
              stageDropActive ? "border-[#ffd166] shadow-[0_0_0_1px_rgba(255,209,102,0.35)]" : "border-[#5bd0c7]/20"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
              }
              setStageDropActive(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setStageDropActive(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setStageDropActive(false);
              addToComposition(event.dataTransfer.getData("text/plain"));
            }}
          >
            <canvas
              ref={canvasRef}
              aria-label="实时音乐视觉舞台"
              className="h-full min-h-[360px] w-full"
            />
            <div className="pointer-events-none absolute left-4 top-4 flex max-w-[min(80%,24rem)] flex-col gap-2 rounded-md border border-white/10 bg-[#120f12]/76 px-3 py-2 text-sm text-[#b9fff7] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Activity aria-hidden="true" className="size-4" />
                <span className="font-medium">{visual.signature}</span>
              </div>
              {previewGrowthImprint !== "actual" ? (
                <div className="text-xs text-[#ffe29a]">预览镜头：{growthImprintLabel(previewGrowthImprint)}</div>
              ) : null}
              <div className="flex flex-wrap gap-1 text-[11px] text-stone-300">
                {activeElements.map((element, index) => (
                  <span key={`${element.id}-${index}`} className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5">
                    {element.name}
                  </span>
                ))}
              </div>
              {getStageSetpiece(visual) ? (
                <div className="text-[11px] text-stone-200">Setpiece: {getStageSetpiece(visual)?.label}</div>
              ) : null}
            </div>
            {visual.activeBonuses.length > 0 ? (
              <div className="pointer-events-none absolute left-4 bottom-4 flex max-w-[min(84%,28rem)] flex-wrap gap-1.5">
                {visual.activeBonuses.map((bonus) => (
                  <span
                    key={bonus}
                    className="rounded-full border border-[#ffd166]/30 bg-[#2b2113]/88 px-2.5 py-1 text-[11px] font-medium text-[#ffe29a]"
                  >
                    {bonus}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="pointer-events-none absolute bottom-4 right-4 rounded-md border border-[#5bd0c7]/20 bg-[#120f12]/80 px-3 py-2 text-xs text-stone-300">
              拖到舞台任意位置即可加入轨道
            </div>
            {stageDropActive ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#0f0b10]/58">
                <div className="rounded-md border border-[#ffd166]/40 bg-[#18131b]/90 px-4 py-3 text-sm font-medium text-[#ffe29a]">
                  松开后加入 Composition Lane
                </div>
              </div>
            ) : null}
          </div>

          <div
            aria-label="乐理编排轨道"
            className={`min-h-36 rounded-lg border border-dashed bg-[#18131b]/90 p-3 transition ${
              laneDropActive ? "border-[#ffd166]/70 bg-[#201922]" : "border-[#5bd0c7]/40"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
              }
              setLaneDropActive(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setLaneDropActive(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setLaneDropActive(false);
              const elementId = event.dataTransfer.getData("text/plain");
              addToComposition(elementId);
            }}
          >
            <div className="mb-2 flex items-center justify-between text-xs uppercase text-stone-400">
              <span>Composition Lane</span>
              <span>{composition.length} blocks</span>
            </div>
            {composition.length === 0 ? (
              <div className="flex min-h-24 items-center justify-center rounded-md border border-[#3f3144] bg-[#201922] text-sm text-stone-400">
                把乐理积木拖到这里
              </div>
            ) : (
              <div className="flex min-h-24 flex-wrap items-center gap-2">
                {composition.map((element, index) => (
                  <div
                    key={`${element.id}-${index}`}
                    aria-label={`移动 ${element.name}`}
                    data-lane-index={index}
                    draggable
                    className="flex h-11 items-center gap-2 rounded-md border border-[#ffd166]/50 bg-[#2a2023] px-3 text-sm text-stone-100"
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", `lane:${index}`);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const dragPayload = event.dataTransfer.getData("text/plain");
                      if (dragPayload.startsWith("lane:")) {
                        moveCompositionBlock(dragPayload, index);
                      } else {
                        replaceCompositionBlock(dragPayload, index);
                      }
                    }}
                  >
                    <span className="font-medium">{element.name}</span>
                    <span className="text-xs uppercase text-stone-400">{element.type}</span>
                    <button
                      aria-label={`移除 ${element.name}`}
                      className="grid size-6 place-items-center rounded-sm text-stone-300 hover:bg-[#3a2b31] hover:text-white"
                      type="button"
                      onClick={() => removeFromComposition(index)}
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {invalidHint ? <div className="mt-2 text-sm text-[#ff8fa3]">{invalidHint}</div> : null}
          </div>
        </section>

        <aside className="flex flex-col gap-3 rounded-lg border border-[#d8a657]/20 bg-[#18131b]/90 p-3 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-[#5bd0c7]/15 pb-3">
            <Layers aria-hidden="true" className="size-5 text-[#d8a657]" />
            <h2 className="text-base font-semibold tracking-normal">Visual State</h2>
          </div>
          {currentUsername ? (
            <div className="flex items-center justify-between rounded-md border border-[#3f3144] bg-[#201922] px-3 py-2 text-sm">
              <span className="text-stone-300">{currentUsername}</span>
              {onLogout ? (
                <button className="text-[#ffd166] hover:text-[#ffe29a]" type="button" onClick={onLogout}>
                  退出
                </button>
              ) : null}
            </div>
          ) : null}
          {apiBaseUrl && authToken ? (
            <GrowthLensPreviewPanel previewGrowthImprint={previewGrowthImprint} onChange={setPreviewGrowthImprint} />
          ) : null}
          <Readout label="Element" value={activeElement.name} />
          <Readout label="Signature" value={visual.signature} />
          <Readout label="Scene" value={sceneFamilyLabel(visual.sceneFamily)} />
          <StageReadingPanel activeBonuses={visual.activeBonuses} elements={activeElements} visual={visual} />
          <GrowthImprintPanel visual={visual} />
          <HarmonicTraitsPanel visual={visual} />
          <TheorySynergyPanel visual={visual} />
          <SceneCascadePanel visual={visual} />
          <StageSetpiecePanel visual={visual} />
          <MoodAxesPanel visual={visual} />
          <Readout label="Color" value={visual.color} swatch={visual.color} />
          <Readout label="Accent" value={visual.secondaryColor} swatch={visual.secondaryColor} />
          <Readout label="Geometry" value={visual.geometry} />
          <Readout label="Animation" value={visual.animationState} />
          <Readout label="Glow" value={visual.glow.toFixed(2)} />
          <Readout label="Energy" value={visual.energy.toFixed(2)} />
          <Readout label="Complexity" value={visual.complexity.toFixed(2)} />
          <Readout label="Temperature" value={visual.temperature.toFixed(2)} />
          <Readout label="Valence" value={visual.valence.toFixed(2)} />
          <Readout label="Arousal" value={visual.arousal.toFixed(2)} />
          <Readout label="Luminosity" value={visual.luminosity.toFixed(2)} />
          <Readout label="Grit" value={visual.grit.toFixed(2)} />
          <Readout label="Symmetry" value={visual.symmetry.toFixed(2)} />
          <Readout label="Depth" value={visual.depth.toFixed(2)} />
          <Readout label="Pulse" value={visual.pulseDensity.toFixed(2)} />
          <Readout label="Trail" value={visual.particles.trail ? "On" : "Off"} />
          {visual.activeBonuses.length > 0 ? (
            <div className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
              <div className="text-xs uppercase text-stone-400">Active Bonuses</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visual.activeBonuses.map((bonus) => (
                  <span
                    key={bonus}
                    className="rounded-full border border-[#5bd0c7]/25 bg-[#182528] px-2 py-1 text-xs font-medium text-[#b9fff7]"
                  >
                    {bonus}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-2">
                {visual.activeBonuses.map((bonus) => (
                  <div key={`${bonus}-note`} className="rounded-md border border-white/5 bg-white/5 px-2 py-1.5 text-xs text-stone-300">
                    <span className="font-medium text-stone-100">{bonus}</span>
                    <span className="ml-2">{VISUAL_BONUS_COPY[bonus] ?? "这个加成会进一步放大当前舞台的风格重心。"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {apiBaseUrl && authToken ? (
            <section className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3">
              <PracticeInput
                label="组合名称"
                type="text"
                value={compositionName}
                onChange={setCompositionName}
              />
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#5bd0c7]/40 bg-[#182528] px-3 text-sm font-semibold text-[#b9fff7] transition hover:border-[#5bd0c7] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={compositionSaving}
                type="button"
                onClick={saveCurrentComposition}
              >
                <Save aria-hidden="true" className="size-4" />
                保存组合
              </button>
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#ffd166]/35 bg-[#2a2023] px-3 text-sm font-semibold text-[#ffd166] transition hover:border-[#ffd166] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={compositionSaving || selectedCompositionId === null}
                type="button"
                onClick={overwriteCurrentComposition}
              >
                <Save aria-hidden="true" className="size-4" />
                覆盖当前组合
              </button>
              {savedCompositions.length > 0 ? (
                <div className="grid gap-1">
                  {savedCompositions.map((savedComposition) => (
                    <div
                      key={savedComposition.id}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
                        selectedCompositionId === savedComposition.id
                          ? "border-[#ffd166] bg-[#2a2023]"
                          : "border-[#3f3144] bg-[#201922]"
                      }`}
                    >
                      <button
                        className="min-w-0 flex-1 text-left text-sm text-stone-100 hover:text-white"
                        type="button"
                        onClick={() => loadSavedComposition(savedComposition)}
                      >
                        <span className="block truncate">{savedComposition.name}</span>
                      </button>
                      <button
                        aria-label={`删除组合 ${savedComposition.name}`}
                        className="grid size-8 shrink-0 place-items-center rounded-sm text-stone-400 transition hover:bg-[#3a2b31] hover:text-[#ff8fa3] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={compositionDeletingId === savedComposition.id}
                        type="button"
                        onClick={() => removeSavedComposition(savedComposition)}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {compositionError ? <div className="text-sm text-[#ff8fa3]">{compositionError}</div> : null}
            </section>
          ) : null}

          <form
            aria-label="练习记录"
            className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3"
            onSubmit={submitPracticeRecord}
          >
            <div className="flex items-center gap-2 pb-1">
              <CalendarDays aria-hidden="true" className="size-4 text-[#5bd0c7]" />
              <h2 className="text-base font-semibold tracking-normal">Practice</h2>
            </div>
            <PracticeInput
              label="练习日期"
              type="date"
              value={practiceDate}
              onChange={setPracticeDate}
            />
            <div className="grid grid-cols-2 gap-2">
              <PracticeInput
                label="练习时长"
                min="1"
                type="number"
                value={durationMinutes}
                onChange={setDurationMinutes}
              />
              <PracticeInput
                label="BPM"
                min="1"
                type="number"
                value={bpm}
                onChange={setBpm}
              />
            </div>
            <PracticeInput
              label="练习主题"
              type="text"
              value={practiceTopic}
              onChange={setPracticeTopic}
            />
            <PracticeInput
              label="备注"
              type="text"
              value={practiceNotes}
              onChange={setPracticeNotes}
            />
            <button
              className="mt-1 flex h-10 items-center justify-center gap-2 rounded-md bg-[#5bd0c7] px-3 text-sm font-semibold text-[#091113] transition hover:bg-[#7ef3ea] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={practiceSubmitting}
              type="submit"
            >
              <Send aria-hidden="true" className="size-4" />
              记录练习
            </button>
            {practiceResult ? (
              <div className="grid gap-1 rounded-md border border-[#ffd166]/40 bg-[#2a2023] px-3 py-2 text-sm font-semibold text-[#ffd166]">
                <span>+{practiceResult.expEarned} EXP</span>
                <div className="flex flex-wrap gap-2 text-xs text-[#ffe8a7]">
                  <span>Total {practiceResult.totalExp} EXP</span>
                  <span>Level {practiceResult.level}</span>
                  <span>Streak {practiceResult.currentStreak} days</span>
                  <span>Best {practiceResult.longestStreak} days</span>
                </div>
                {practiceResult.unlockedEffects.length > 0 ? (
                  <div className="mt-1 grid gap-1 border-t border-[#ffd166]/20 pt-2 text-xs text-[#b9fff7]">
                    {practiceResult.unlockedEffects.map((effectName) => (
                      <span key={effectName}>Unlocked {effectName}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {practiceError ? <div className="text-sm text-[#ff8fa3]">{practiceError}</div> : null}
          </form>

          {practiceHistory.length > 0 ? (
            <section className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3">
              <h2 className="text-base font-semibold tracking-normal">Recent Practice</h2>
              <div className="grid gap-1">
                {practiceHistory.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-md border border-[#3f3144] bg-[#201922] px-2 py-1.5 text-sm text-stone-100"
                  >
                    <div className="font-medium">{record.topic}</div>
                    <div className="text-xs text-stone-400">
                      {record.practiceDate} · {record.durationMinutes} min · {record.bpm} BPM
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {apiBaseUrl && authToken ? (
            <form
              aria-label="练习历史筛选"
              className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3"
              onSubmit={filterPracticeHistory}
            >
              <PracticeInput
                label="历史主题"
                type="text"
                value={historyTopicFilter}
                onChange={setHistoryTopicFilter}
              />
              <div className="grid grid-cols-2 gap-2">
                <PracticeInput
                  label="开始日期"
                  type="date"
                  value={historyDateFrom}
                  onChange={setHistoryDateFrom}
                />
                <PracticeInput
                  label="结束日期"
                  type="date"
                  value={historyDateTo}
                  onChange={setHistoryDateTo}
                />
              </div>
              <button
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#5bd0c7]/40 bg-[#182528] px-3 text-sm font-semibold text-[#b9fff7] transition hover:border-[#5bd0c7]"
                type="submit"
              >
                <Search aria-hidden="true" className="size-4" />
                筛选历史
              </button>
            </form>
          ) : null}

          {unlockedEffects.length > 0 ? <UnlockedEffectsPanel effects={unlockedEffects} /> : null}
          {skillTree ? <SkillTreePanel skillTree={skillTree} /> : null}
          {heatmap ? <HeatmapPanel heatmap={heatmap} /> : null}
        </aside>
      </section>
    </main>
  );

  function addToComposition(elementId: string): void {
    const nextElement = THEORY_LIBRARY.find((element) => element.id === elementId);

    if (!nextElement) {
      return;
    }

    const lastElement = composition.at(-1);

    if (lastElement?.id === nextElement.id) {
      setInvalidHint("相邻位置不能重复同一个乐理积木");
      return;
    }

    setInvalidHint(null);
    setSelected(nextElement);
    setComposition((current) => [...current, nextElement]);
  }

  function removeFromComposition(indexToRemove: number): void {
    setInvalidHint(null);
    setComposition((current) => current.filter((_, index) => index !== indexToRemove));
  }

  function replaceCompositionBlock(elementId: string, targetIndex: number): void {
    const nextElement = THEORY_LIBRARY.find((element) => element.id === elementId);

    if (!nextElement || targetIndex < 0 || targetIndex >= composition.length) {
      return;
    }

    const previousElement = composition[targetIndex - 1];
    const followingElement = composition[targetIndex + 1];

    if (previousElement?.id === nextElement.id || followingElement?.id === nextElement.id) {
      setInvalidHint("相邻位置不能重复同一个乐理积木");
      return;
    }

    setInvalidHint(null);
    setSelected(nextElement);
    setComposition((current) => current.map((element, index) => (index === targetIndex ? nextElement : element)));
  }

  function moveCompositionBlock(dragPayload: string, targetIndex: number): void {
    if (!dragPayload.startsWith("lane:")) {
      return;
    }

    const sourceIndex = Number(dragPayload.replace("lane:", ""));

    if (!Number.isInteger(sourceIndex) || sourceIndex === targetIndex) {
      return;
    }

    setInvalidHint(null);
    setComposition((current) => {
      if (sourceIndex < 0 || sourceIndex >= current.length || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function submitPracticeRecord(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!apiBaseUrl || !authToken) {
      setPracticeError("需要连接后端后才能记录练习");
      return;
    }

    setPracticeSubmitting(true);
    setPracticeError(null);

    try {
      const result = await createPracticeRecord({
        apiBaseUrl,
        bpm: Number(bpm),
        durationMinutes: Number(durationMinutes),
        notes: practiceNotes.trim() ? practiceNotes.trim() : null,
        practiceDate,
        topic: practiceTopic.trim(),
        authToken
      });
      setPracticeResult(result);
      setPracticeHistory((current) => [
        practiceResultToHistoryItem(result),
        ...current.filter((record) => record.id !== result.id)
      ].slice(0, 5));
      setVisualRefreshKey((current) => current + 1);
    } catch {
      setPracticeError("练习记录提交失败");
    } finally {
      setPracticeSubmitting(false);
    }
  }

  async function filterPracticeHistory(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!apiBaseUrl || !authToken) {
      return;
    }

    try {
      const records = await getPracticeRecords({
        apiBaseUrl,
        authToken,
        limit: 5,
        topic: historyTopicFilter.trim() || undefined,
        dateFrom: historyDateFrom || undefined,
        dateTo: historyDateTo || undefined
      });
      setPracticeHistory(records);
    } catch {
      setPracticeHistory([]);
    }
  }

  async function saveCurrentComposition(): Promise<void> {
    if (!apiBaseUrl || !authToken) {
      return;
    }

    const elementsToSave = activeElements;
    const generatedName = elementsToSave.map((element) => element.name).join(" - ");
    const name = compositionName.trim() || generatedName;

    setCompositionSaving(true);
    setCompositionError(null);

    try {
      const savedComposition = await saveComposition({
        apiBaseUrl,
        authToken,
        elements: elementsToSave,
        name,
      });
      setCompositionName(savedComposition.name);
      setSelectedCompositionId(savedComposition.id);
      setSavedCompositions((current) => [
        savedComposition,
        ...current.filter((compositionItem) => compositionItem.id !== savedComposition.id)
      ]);
    } catch {
      setCompositionError("组合保存失败");
    } finally {
      setCompositionSaving(false);
    }
  }

  async function overwriteCurrentComposition(): Promise<void> {
    if (!apiBaseUrl || !authToken || selectedCompositionId === null) {
      return;
    }

    const elementsToSave = activeElements;
    const generatedName = elementsToSave.map((element) => element.name).join(" - ");
    const name = compositionName.trim() || generatedName;

    setCompositionSaving(true);
    setCompositionError(null);

    try {
      const savedComposition = await updateComposition({
        apiBaseUrl,
        authToken,
        compositionId: selectedCompositionId,
        elements: elementsToSave,
        name
      });
      setCompositionName(savedComposition.name);
      setSavedCompositions((current) =>
        current.map((compositionItem) => (compositionItem.id === savedComposition.id ? savedComposition : compositionItem))
      );
    } catch {
      setCompositionError("组合覆盖失败");
    } finally {
      setCompositionSaving(false);
    }
  }

  function loadSavedComposition(savedComposition: SavedComposition): void {
    if (savedComposition.elements.length === 0) {
      return;
    }

    setInvalidHint(null);
    setComposition(savedComposition.elements);
    setCompositionName(savedComposition.name);
    setSelectedCompositionId(savedComposition.id);
    setSelected(savedComposition.elements.at(-1) ?? selected);
  }

  async function removeSavedComposition(savedComposition: SavedComposition): Promise<void> {
    if (!apiBaseUrl || !authToken) {
      return;
    }

    setCompositionDeletingId(savedComposition.id);
    setCompositionError(null);

    try {
      await deleteComposition({
        apiBaseUrl,
        authToken,
        compositionId: savedComposition.id
      });
      setSavedCompositions((current) => current.filter((compositionItem) => compositionItem.id !== savedComposition.id));

      if (selectedCompositionId === savedComposition.id) {
        setSelectedCompositionId(null);
      }
    } catch {
      setCompositionError("组合删除失败");
    } finally {
      setCompositionDeletingId(null);
    }
  }
}

function practiceResultToHistoryItem(result: PracticeRecordResult): PracticeRecordHistoryItem {
  return {
    id: result.id,
    userId: result.userId,
    practiceDate: result.practiceDate,
    durationMinutes: result.durationMinutes,
    bpm: result.bpm,
    topic: result.topic,
    notes: result.notes,
    createdAt: new Date().toISOString()
  };
}

interface ReadoutProps {
  label: string;
  value: string;
  swatch?: string;
}

function Readout({ label, value, swatch }: ReadoutProps) {
  return (
    <div className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">{label}</div>
      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-stone-100">
        {swatch ? (
          <span className="size-4 rounded-sm border border-white/20" style={{ backgroundColor: swatch }} />
        ) : null}
        <span>{value}</span>
      </div>
    </div>
  );
}

function StageReadingPanel({
  visual,
  elements,
  activeBonuses
}: {
  visual: VisualParameters;
  elements: TheoryElement[];
  activeBonuses: string[];
}) {
  const reading = buildStageReading(visual, elements, activeBonuses);

  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Stage Reading</div>
      <div className="mt-2 text-sm font-medium text-stone-100">{reading.summary}</div>
      <div className="mt-3 grid gap-2">
        <ReadingLine label="情绪" value={reading.mood} />
        <ReadingLine label="空间" value={reading.space} />
        <ReadingLine label="运动" value={reading.motion} />
        <ReadingLine label="来源" value={reading.drivers} />
      </div>
    </section>
  );
}

function GrowthLensPreviewPanel({
  previewGrowthImprint,
  onChange
}: {
  previewGrowthImprint: "actual" | Exclude<VisualParameters["growthImprint"], "neutral">;
  onChange: (nextValue: "actual" | Exclude<VisualParameters["growthImprint"], "neutral">) => void;
}) {
  const activeOption = GROWTH_PREVIEW_OPTIONS.find((option) => option.id === previewGrowthImprint) ?? GROWTH_PREVIEW_OPTIONS[0];

  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Growth Lens Preview</div>
      <div className="mt-2 text-sm font-medium text-stone-100">{activeOption.label}</div>
      <div className="mt-1 text-xs text-stone-400">{activeOption.hint}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {GROWTH_PREVIEW_OPTIONS.map((option) => {
          const active = option.id === previewGrowthImprint;
          return (
            <button
              key={option.id}
              aria-pressed={active}
              className={`rounded-md border px-2 py-2 text-left text-xs transition ${
                active
                  ? "border-[#ffd166] bg-[#2a2023] text-[#ffe29a]"
                  : "border-[#3f3144] bg-[#151217] text-stone-300 hover:border-[#5bd0c7]"
              }`}
              type="button"
              onClick={() => onChange(option.id)}
            >
              <div className="font-medium">{option.label}</div>
              <div className="mt-1 text-[11px] opacity-80">{option.hint}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MoodAxesPanel({ visual }: { visual: VisualParameters }) {
  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Mood Axes</div>
      <div className="mt-3 grid gap-2">
        <MoodAxisRow
          accent="#ffd166"
          label="Valence"
          value={visual.valence}
          note={moodAxisLabel("valence", visual.valence)}
        />
        <MoodAxisRow
          accent="#ff8fa3"
          label="Arousal"
          value={visual.arousal}
          note={moodAxisLabel("arousal", visual.arousal)}
        />
        <MoodAxisRow
          accent="#8fdcff"
          label="Luminosity"
          value={visual.luminosity}
          note={moodAxisLabel("luminosity", visual.luminosity)}
        />
        <MoodAxisRow
          accent="#c7a6ff"
          label="Grit"
          value={visual.grit}
          note={moodAxisLabel("grit", visual.grit)}
        />
      </div>
    </section>
  );
}

function GrowthImprintPanel({ visual }: { visual: VisualParameters }) {
  const reading = buildGrowthImprintReading(visual);

  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Growth Imprint</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-stone-100">{reading.label}</div>
          <div className="mt-1 text-xs text-stone-400">{reading.summary}</div>
        </div>
        <div className="text-sm font-semibold text-[#ffd166]">{Math.round(visual.growthImprintIntensity * 100)}%</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#140f16]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(6, Math.round(visual.growthImprintIntensity * 100))}%`,
            background: `linear-gradient(90deg, ${reading.accent}55 0%, ${reading.accent} 100%)`
          }}
        />
      </div>
      <div className="mt-3 grid gap-2">
        <ReadingLine label="风格偏移" value={reading.shift} />
        <ReadingLine label="演出变化" value={reading.impact} />
      </div>
    </section>
  );
}

function HarmonicTraitsPanel({ visual }: { visual: VisualParameters }) {
  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Harmonic Traits</div>
      <div className="mt-3 grid gap-2">
        <MoodAxisRow accent="#9fd7ff" label="Openness" value={visual.openness} note={traitAxisLabel("openness", visual.openness)} />
        <MoodAxisRow accent="#ff9b7b" label="Attack" value={visual.attack} note={traitAxisLabel("attack", visual.attack)} />
        <MoodAxisRow accent="#9af0dd" label="Swing" value={visual.swing} note={traitAxisLabel("swing", visual.swing)} />
        <MoodAxisRow accent="#ffd166" label="Gravity" value={visual.gravity} note={traitAxisLabel("gravity", visual.gravity)} />
      </div>
    </section>
  );
}

function TheorySynergyPanel({ visual }: { visual: VisualParameters }) {
  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Theory Synergy</div>
      <div className="mt-3 grid gap-2">
        <MoodAxisRow accent="#8fdcff" label="Resonance" value={visual.synergyResonance} note={synergyAxisLabel("resonance", visual.synergyResonance)} />
        <MoodAxisRow accent="#ffd166" label="Cadence Pull" value={visual.cadencePull} note={synergyAxisLabel("cadence", visual.cadencePull)} />
        <MoodAxisRow accent="#ff8fa3" label="Modal Tension" value={visual.modalTension} note={synergyAxisLabel("tension", visual.modalTension)} />
        <MoodAxisRow accent="#9af0dd" label="Blend Cohesion" value={visual.blendCohesion} note={synergyAxisLabel("blend", visual.blendCohesion)} />
      </div>
      {visual.activeSynergies.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {visual.activeSynergies.map((synergy) => (
            <div key={synergy} className="rounded-md border border-white/5 bg-white/5 px-2 py-1.5 text-xs text-stone-300">
              <span className="font-medium text-stone-100">{synergy}</span>
              <span className="ml-2">{THEORY_SYNERGY_COPY[synergy] ?? "这组模块之间已经形成稳定的相互放大。 "}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SceneCascadePanel({ visual }: { visual: VisualParameters }) {
  const reading = buildSceneCascadeReading(visual);

  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Scene Cascade</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-stone-100">{reading.label}</div>
          <div className="mt-1 text-xs text-stone-400">{reading.summary}</div>
        </div>
        <div className="text-sm font-semibold text-[#ffd166]">{Math.round(visual.sceneCascadeIntensity * 100)}%</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#140f16]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(6, Math.round(visual.sceneCascadeIntensity * 100))}%`,
            background: `linear-gradient(90deg, ${reading.accent}55 0%, ${reading.accent} 100%)`
          }}
        />
      </div>
      <div className="mt-3 grid gap-2">
        <ReadingLine label="级联来源" value={reading.trigger} />
        <ReadingLine label="舞台变化" value={reading.impact} />
        <ReadingLine label="成长染色" value={reading.tint} />
      </div>
    </section>
  );
}

function StageSetpiecePanel({ visual }: { visual: VisualParameters }) {
  const setpiece = getStageSetpiece(visual);

  if (!setpiece) {
    return null;
  }

  return (
    <section className="rounded-md border border-[#3f3144] bg-[#201922] p-3">
      <div className="text-xs uppercase text-stone-400">Stage Setpiece</div>
      <div className="mt-2 text-sm font-medium text-stone-100">{setpiece.label}</div>
      <div className="mt-1 text-xs text-stone-400">{setpiece.cue}</div>
      <div className="mt-3 grid gap-2">
        <ReadingLine label="装置骨架" value={setpiece.rig} />
        <ReadingLine label="灯光调度" value={setpiece.lighting} />
        <ReadingLine label="体感变化" value={setpiece.impact} />
      </div>
    </section>
  );
}

function MoodAxisRow({
  label,
  value,
  note,
  accent
}: {
  label: string;
  value: number;
  note: string;
  accent: string;
}) {
  return (
    <div className="rounded-md border border-white/5 bg-white/5 px-2 py-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-stone-100">{label}</span>
        <span className="text-stone-300">{value.toFixed(2)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#140f16]">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(6, Math.round(value * 100))}%`,
            background: `linear-gradient(90deg, ${accent}66 0%, ${accent} 100%)`
          }}
        />
      </div>
      <div className="mt-2 text-[11px] text-stone-400">{note}</div>
    </div>
  );
}

function ReadingLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/5 px-2 py-1.5 text-xs text-stone-300">
      <span className="font-medium text-stone-100">{label}：</span>
      <span className="ml-2">{value}</span>
    </div>
  );
}

interface PracticeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: "date" | "number" | "text";
  min?: string;
}

function PracticeInput({ label, value, onChange, type, min }: PracticeInputProps) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase text-stone-400">
      {label}
      <input
        className="h-9 rounded-md border border-[#3f3144] bg-[#201922] px-2 text-sm normal-case text-stone-100 outline-none transition focus:border-[#5bd0c7]"
        min={min}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function UnlockedEffectsPanel({ effects }: { effects: UnlockedEffect[] }) {
  return (
    <section className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3">
      <div className="flex items-center gap-2 pb-1">
        <Sparkles aria-hidden="true" className="size-4 text-[#ffd166]" />
        <h2 className="text-base font-semibold tracking-normal">Unlocked Effects</h2>
      </div>
      <div className="grid gap-1">
        {effects.map((effect) => (
          <div
            key={effect.id}
            className="rounded-md border border-[#3f3144] bg-[#201922] px-2 py-1.5 text-sm text-stone-100"
          >
            <div className="font-medium text-[#b9fff7]">{EFFECT_COPY[effect.effectName]?.title ?? effect.effectName}</div>
            {EFFECT_COPY[effect.effectName]?.description ? (
              <div className="mt-1 text-xs text-stone-300">{EFFECT_COPY[effect.effectName].description}</div>
            ) : null}
            <div className="text-xs text-stone-400">{effect.triggerCondition}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillTreePanel({ skillTree }: { skillTree: SkillTree }) {
  return (
    <section className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3">
      <div className="flex items-center gap-2 pb-1">
        <GitBranch aria-hidden="true" className="size-4 text-[#ffd166]" />
        <h2 className="text-base font-semibold tracking-normal">Growth</h2>
      </div>
      <div className="flex flex-col gap-2">
        {skillTree.branches.map((branch) => (
          <div key={branch.direction} className="rounded-md border border-[#3f3144] bg-[#201922] p-2">
            <div className="mb-2 text-xs font-semibold uppercase text-[#ffd166]">{branch.direction}</div>
            <div className="flex flex-col gap-1.5">
              {branch.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-sm ${
                    node.unlocked ? "bg-[#2a2a24] text-stone-100" : "bg-[#151217] text-stone-500"
                  }`}
                >
                  <span>{node.label}</span>
                  <span className="text-xs text-stone-300">Lv {node.level}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeatmapPanel({ heatmap }: { heatmap: YearlyHeatmap }) {
  const activeDays = heatmap.days.filter((day) => day.durationMinutes > 0 || day.exp > 0).slice(-7);

  return (
    <section className="mt-1 flex flex-col gap-2 border-t border-[#5bd0c7]/15 pt-3">
      <div className="flex items-center gap-2 pb-1">
        <Flame aria-hidden="true" className="size-4 text-[#5bd0c7]" />
        <h2 className="text-base font-semibold tracking-normal">Heatmap</h2>
      </div>
      <div className="grid max-h-32 grid-cols-[repeat(31,minmax(0,1fr))] gap-0.5 overflow-hidden" aria-label="年度练习热力图">
        {heatmap.days.map((day) => (
          <div
            key={day.date}
            className={`aspect-square rounded-sm border ${heatmapCellClass(day.exp)}`}
            title={`${day.date}: ${day.durationMinutes} min, ${day.exp} EXP`}
          />
        ))}
      </div>
      {activeDays.slice(-3).map((day) => (
        <div
          key={`${day.date}-readout`}
          className="flex items-center justify-between rounded-md border border-[#3f3144] bg-[#201922] px-2 py-1.5 text-sm"
        >
          <span>{day.date}</span>
          <span className="text-[#ffd166]">{day.exp} EXP</span>
        </div>
      ))}
    </section>
  );
}

function heatmapCellClass(exp: number): string {
  if (exp >= 90) {
    return "border-[#5bd0c7]/50 bg-[#5bd0c7]";
  }

  if (exp >= 45) {
    return "border-[#5bd0c7]/40 bg-[#2b8f7f]";
  }

  if (exp > 0) {
    return "border-[#5bd0c7]/30 bg-[#2b4f48]";
  }

  return "border-[#3f3144] bg-[#151217]";
}

function buildStageReading(
  visual: VisualParameters,
  elements: TheoryElement[],
  activeBonuses: string[]
): {
  summary: string;
  mood: string;
  space: string;
  motion: string;
  drivers: string;
} {
  const warmth = visual.temperature >= 0.62 ? "偏暖" : visual.temperature <= 0.38 ? "偏冷" : "冷暖平衡";
  const valence = visual.valence >= 0.7 ? "情绪更明朗" : visual.valence <= 0.3 ? "情绪更阴影化" : "情绪保持暧昧";
  const intensity =
    visual.arousal >= 0.72
      ? "推进感很强"
      : visual.contrast >= 0.7
        ? "张力明显"
        : visual.glow >= 0.76
          ? "柔亮扩散"
          : "相对克制";
  const mood = `${warmth}，${valence}，${intensity}。`;

  const space =
    visual.depth >= 0.72 || visual.luminosity >= 0.74
      ? `层次很深，${visual.symmetry >= 0.68 ? "而且镜像感很强，像完整搭起一个舞台空间。" : "但保留了不完全对称的漂移感。"}`
      : visual.symmetry >= 0.72
        ? "更规整，对称骨架清晰，舞台会更像被设计过的礼堂或晶格场。"
        : "更贴近前景，结构没有完全锁死，会更像即兴生成的场域。";

  const motion =
    visual.pulseDensity >= 0.72 || visual.arousal >= 0.76
      ? `脉冲密度很高，配合 ${animationLabel(visual.animationState)} 会显得更推进、更有压迫感。`
      : visual.rippleStrength >= 0.7
        ? "波纹和相位更突出，整体更像连续流体在呼吸。"
        : `动作密度中等，重点更多落在 ${geometryLabel(visual.geometry)} 的形体变化上。`;
  const theoryTraits = `开放度${traitAxisLabel("openness", visual.openness)}，起音${traitAxisLabel("attack", visual.attack)}，摆动${traitAxisLabel("swing", visual.swing)}，牵引${traitAxisLabel("gravity", visual.gravity)}`;
  const synergyTraits = `共振${synergyAxisLabel("resonance", visual.synergyResonance)}，终止${synergyAxisLabel("cadence", visual.cadencePull)}，摩擦${synergyAxisLabel("tension", visual.modalTension)}，融合${synergyAxisLabel("blend", visual.blendCohesion)}`;

  const primaryDrivers = elements.map((element) => element.name).join(" + ");
  const bonusText =
    activeBonuses.length > 0 ? `；当前额外加成是 ${activeBonuses.join("、")}` : "；当前还没有触发额外组合加成";
  const growthText =
    visual.growthImprint !== "neutral"
      ? `；Growth 已经把当前舞台往${growthImprintLabel(visual.growthImprint)}推了 ${Math.round(visual.growthImprintIntensity * 100)}%`
      : "；当前 Growth 还没有形成独立印记";
  const cascadeText =
    visual.sceneCascade !== "neutral"
      ? `；当前还触发了 ${sceneCascadeLabel(visual.sceneCascade)}，强度 ${Math.round(visual.sceneCascadeIntensity * 100)}%`
      : "；当前还没有触发场景级联";

  return {
    summary: `当前舞台由 ${primaryDrivers} 主导，正在形成 ${sceneFamilyLabel(visual.sceneFamily)} 里的 ${signatureTone(visual)} 读感${visual.sceneCascade !== "neutral" ? `，并开始长出 ${sceneCascadeLabel(visual.sceneCascade)}` : ""}。`,
    mood,
    space,
    motion,
    drivers: `主导模块是 ${primaryDrivers}${bonusText}${growthText}${cascadeText}；当前情绪轴是 ${moodAxisLabel("valence", visual.valence)}、${moodAxisLabel("arousal", visual.arousal)}、${moodAxisLabel("luminosity", visual.luminosity)}、${moodAxisLabel("grit", visual.grit)}；乐理特征表现为 ${theoryTraits}；模块之间的协同则表现为 ${synergyTraits}。`
  };
}

function buildGrowthImprintReading(visual: VisualParameters): {
  label: string;
  accent: string;
  summary: string;
  shift: string;
  impact: string;
} {
  if (visual.growthImprint === "neutral" || visual.growthImprintIntensity <= 0.05) {
    return {
      label: "Neutral",
      accent: "#8fdcff",
      summary: "目前还是以乐理组合本身在主导舞台，成长风格还没有单独压上来。",
      shift: "当前没有明显的成长风格偏移。",
      impact: "舞台主要依靠和弦、调式和组合加成变化。 "
    };
  }

  const strength =
    visual.growthImprintIntensity >= 0.9
      ? "几乎已经主导第二层演出"
      : visual.growthImprintIntensity >= 0.72
        ? "已经明显改写舞台质地"
        : "正在温和地改变舞台重心";

  switch (visual.growthImprint) {
    case "pentatonic-drive":
      return {
        label: "Pentatonic Drive",
        accent: "#59fff5",
        summary: `成长轨迹正在把舞台推向霓虹速度场，${strength}。`,
        shift: "节奏线、霓虹条带和高速节点会更明显，画面更像夜路与巡航。",
        impact: "即便和声不复杂，舞台也会更强调冲刺感和横向推进。"
      };
    case "jazz-lattice":
      return {
        label: "Jazz Lattice",
        accent: "#c2b8ff",
        summary: `Growth 已经把当前舞台往和声教堂和悬挂晶格推过去了，${strength}。`,
        shift: "会更容易出现吊灯式线条、和声窗格、拱形层次和纵深秩序。",
        impact: "同样的和弦堆叠，在这里会显得更讲究声部和空间设计。"
      };
    case "metal-forge":
      return {
        label: "Metal Forge",
        accent: "#ff7b3d",
        summary: `成长风格正在把舞台拉向熔炉、切面和碎片风暴，${strength}。`,
        shift: "顶部落下的碎片、底部热口和更硬的线段骨架会更常见。",
        impact: "就算基础组合相同，舞台也会更像被高张力和速度压出火花。"
      };
    case "neo-soul-veil":
      return {
        label: "Neo Soul 幕纱",
        accent: "#ff9fc9",
        summary: `Growth 已经把当前舞台往丝绒、幕纱和柔性光层那边推过去了，${strength}。`,
        shift: "帘幕、柔波和包裹式光晕会更突出，空间也会更亲密、更圆润。",
        impact: "同一组和声在这里不再只是亮，而是更像在近距离呼吸。"
      };
    default:
      return {
        label: "Fusion Phase",
        accent: "#8db8ff",
        summary: `成长风格正在把舞台扭成相位环和棱镜走廊，${strength}。`,
        shift: "会更常出现转相、折射、三角通道和多层节拍回路。",
        impact: "同一套元素会更像复杂系统在折返，而不是单向铺开。"
      };
  }
}

function buildSceneCascadeReading(visual: VisualParameters): {
  label: string;
  accent: string;
  summary: string;
  trigger: string;
  impact: string;
  tint: string;
} {
  if (visual.sceneCascade === "neutral" || visual.sceneCascadeIntensity <= 0.05) {
    return {
      label: "Neutral",
      accent: "#8fdcff",
      summary: "当前还没有触发大型场景级联，舞台主要靠基础场景、Growth 和局部参数在变化。",
      trigger: "通常要出现更完整的三元组合，或者很强的协同与成长叠加。",
      impact: "目前看到的是主舞台本身，而不是额外搭起来的第二层大型结构。 ",
      tint: "当前还没有出现成长对场景级联的二次改写。 "
    };
  }

  const strength =
    visual.sceneCascadeIntensity >= 0.9
      ? "已经把大场景结构完全搭起来了"
      : visual.sceneCascadeIntensity >= 0.75
        ? "已经明显盖住了基础舞台"
        : "正在往更大的演出装置生长";

  switch (visual.sceneCascade) {
    case "aurora-dais":
      return {
        label: "Aurora Dais",
        accent: "#d7d0ff",
        summary: `高抬升的穹顶、台阶和拱形光幕已经被召出来了，${strength}。`,
        trigger: "更常见于明亮的 Lydian / Maj7 / II-V-I 这类三元组合。",
        impact: "舞台会更像一个被和声托举起来的礼台，而不是单纯一块发光区域。",
        tint: cascadeGrowthTint(visual)
      };
    case "velvet-arcade":
      return {
        label: "Velvet Arcade",
        accent: "#9cefe2",
        summary: `柔性拱廊和纵深走道已经开始接管空间，${strength}。`,
        trigger: "更常见于 Dorian / Min7 / II-V-I 或带 Neo Soul 印记的组合。",
        impact: "舞台会变得更像一条可穿行的演出廊道，层次会明显厚起来。",
        tint: cascadeGrowthTint(visual)
      };
    case "forge-ritual":
      return {
        label: "Forge Ritual",
        accent: "#ff7b3d",
        summary: `锻造架与下压的硬质结构已经落下来，${strength}。`,
        trigger: "常见于 Metal 印记与强摩擦组合一起出现的时候。",
        impact: "舞台会出现更明显的压顶感、坠落感和热区，不再只是碎一点。",
        tint: cascadeGrowthTint(visual)
      };
    case "prism-vortex":
      return {
        label: "Prism Vortex",
        accent: "#80dfff",
        summary: `旋转棱镜和相位通道已经成形，${strength}。`,
        trigger: "更常见于 Melodic Minor / Dominant7 / Aug 或 Fusion 风格组合。",
        impact: "画面会开始像一个在自我折射的系统，而不是单层的几何展示。",
        tint: cascadeGrowthTint(visual)
      };
    case "tide-runway":
      return {
        label: "Tide Runway",
        accent: "#ffd06b",
        summary: `长距离地平跑道和推进条带已经拉开，${strength}。`,
        trigger: "更常见于 Pentatonic / Mixolydian / Dominant7 这类带推进感的组合。",
        impact: "舞台会更像一条正在向前冲的赛道，速度感会比原来明显很多。",
        tint: cascadeGrowthTint(visual)
      };
    default:
      return {
        label: "Eclipse Altar",
        accent: "#c7a6ff",
        summary: `环形祭坛和阴影辐条已经立起来了，${strength}。`,
        trigger: "常见于 Harmonic Minor / Dim7 / Dominant7 或很强的暗色张力结构。",
        impact: "舞台会从‘黑暗一点’升级成真正的仪式空间，空间性会更强。",
        tint: cascadeGrowthTint(visual)
      };
  }
}

function cascadeGrowthTint(visual: VisualParameters): string {
  switch (visual.growthImprint) {
    case "jazz-lattice":
      return "当前级联又被 Jazz Lattice 染得更有和声窗格和纵深秩序。";
    case "neo-soul-veil":
      return "当前级联又被 Neo Soul 幕纱软化，边缘会更像帘幕和柔性包裹。";
    case "metal-forge":
      return "当前级联又被 Metal Forge 压硬，线条和重心会更像锻造结构。";
    case "fusion-phase":
      return "当前级联又被 Fusion Phase 扭出更多相位环和折射回路。";
    case "pentatonic-drive":
      return "当前级联又被 Pentatonic Drive 拉向更长的推进线和巡航速度感。";
    default:
      return "当前级联主要由组合结构本身驱动，成长印记还没有继续改写它。";
  }
}

function moodAxisLabel(axis: "valence" | "arousal" | "luminosity" | "grit", value: number): string {
  if (axis === "valence") {
    return value >= 0.72 ? "高明度情绪" : value <= 0.3 ? "低明度情绪" : "中性情绪";
  }

  if (axis === "arousal") {
    return value >= 0.72 ? "高唤醒" : value <= 0.32 ? "低唤醒" : "中段唤醒";
  }

  if (axis === "luminosity") {
    return value >= 0.72 ? "高发光空间" : value <= 0.32 ? "低照度空间" : "中照度空间";
  }

  return value >= 0.68 ? "高颗粒粗粝度" : value <= 0.24 ? "低颗粒粗粝度" : "中颗粒粗粝度";
}

function traitAxisLabel(axis: "openness" | "attack" | "swing" | "gravity", value: number): string {
  if (axis === "openness") {
    return value >= 0.72 ? "高开放度" : value <= 0.32 ? "低开放度" : "中开放度";
  }

  if (axis === "attack") {
    return value >= 0.72 ? "高攻击性" : value <= 0.28 ? "低攻击性" : "中攻击性";
  }

  if (axis === "swing") {
    return value >= 0.68 ? "高摆动感" : value <= 0.28 ? "低摆动感" : "中摆动感";
  }

  return value >= 0.72 ? "高终止牵引力" : value <= 0.32 ? "低终止牵引力" : "中终止牵引力";
}

function synergyAxisLabel(axis: "resonance" | "cadence" | "tension" | "blend", value: number): string {
  if (axis === "resonance") {
    return value >= 0.72 ? "高共振" : value <= 0.32 ? "低共振" : "中共振";
  }

  if (axis === "cadence") {
    return value >= 0.72 ? "高终止牵引" : value <= 0.32 ? "低终止牵引" : "中终止牵引";
  }

  if (axis === "tension") {
    return value >= 0.72 ? "高调式摩擦" : value <= 0.32 ? "低调式摩擦" : "中调式摩擦";
  }

  return value >= 0.72 ? "高颜色融合" : value <= 0.32 ? "低颜色融合" : "中颜色融合";
}

function animationLabel(animationState: VisualParameters["animationState"]): string {
  switch (animationState) {
    case "explosive":
      return "爆发式动画";
    case "tense":
      return "紧张动画";
    case "calm":
      return "平静动画";
    default:
      return "流动动画";
  }
}

function sceneFamilyLabel(sceneFamily: VisualParameters["sceneFamily"]): string {
  switch (sceneFamily) {
    case "solar-garden":
      return "日光穹庭";
    case "velvet-chamber":
      return "丝绒厅堂";
    case "metal-foundry":
      return "金属熔炉";
    case "jazz-cathedral":
      return "和声教堂";
    case "prism-array":
      return "棱镜阵列";
    case "nocturne-tide":
      return "夜潮剧场";
    case "shadow-sanctum":
      return "影纹祭坛";
    default:
      return "霓虹网格";
  }
}

function geometryLabel(geometry: VisualParameters["geometry"]): string {
  switch (geometry) {
    case "fracture":
      return "碎裂几何";
    case "wave":
      return "波形几何";
    case "lattice":
      return "晶格几何";
    default:
      return "软球体几何";
  }
}

function signatureTone(visual: VisualParameters): string {
  if (visual.activeBonuses.some((bonus) => bonus.includes("Velvet") || bonus.includes("Silk"))) {
    return "柔滑丝绒型";
  }

  if (visual.activeBonuses.some((bonus) => bonus.includes("Metal") || bonus.includes("Fracture") || bonus.includes("Voltage"))) {
    return "高张力碎裂型";
  }

  if (visual.activeBonuses.some((bonus) => bonus.includes("Jazz") || bonus.includes("Aurora") || bonus.includes("Lattice"))) {
    return "和声晶格型";
  }

  if (visual.activeBonuses.some((bonus) => bonus.includes("Prism") || bonus.includes("Chrome") || bonus.includes("Fusion"))) {
    return "棱镜流变型";
  }

  return visual.glow >= visual.contrast ? "扩散发光型" : "紧凑对比型";
}

function growthImprintLabel(imprint: VisualParameters["growthImprint"]): string {
  switch (imprint) {
    case "pentatonic-drive":
      return "Pentatonic Drive";
    case "jazz-lattice":
      return "Jazz Lattice";
    case "metal-forge":
      return "Metal Forge";
    case "neo-soul-veil":
      return "Neo Soul 幕纱";
    case "fusion-phase":
      return "Fusion Phase";
    default:
      return "Neutral";
  }
}

function sceneCascadeLabel(cascade: VisualParameters["sceneCascade"]): string {
  switch (cascade) {
    case "aurora-dais":
      return "Aurora Dais";
    case "velvet-arcade":
      return "Velvet Arcade";
    case "forge-ritual":
      return "Forge Ritual";
    case "prism-vortex":
      return "Prism Vortex";
    case "tide-runway":
      return "Tide Runway";
    case "eclipse-altar":
      return "Eclipse Altar";
    default:
      return "Neutral";
  }
}
