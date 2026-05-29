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
      elements: activeElements
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
  }, [activeElements, apiBaseUrl, authToken, localVisual, visualRefreshKey]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new RealtimeCanvasRenderer(canvas);
    renderer.resize(canvas.clientWidth || 720, canvas.clientHeight || 420);
    renderer.start(visual);
    rendererRef.current = renderer;

    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
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
              <div className="flex flex-wrap gap-1 text-[11px] text-stone-300">
                {activeElements.map((element, index) => (
                  <span key={`${element.id}-${index}`} className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5">
                    {element.name}
                  </span>
                ))}
              </div>
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
          <Readout label="Element" value={activeElement.name} />
          <Readout label="Signature" value={visual.signature} />
          <Readout label="Color" value={visual.color} swatch={visual.color} />
          <Readout label="Accent" value={visual.secondaryColor} swatch={visual.secondaryColor} />
          <Readout label="Geometry" value={visual.geometry} />
          <Readout label="Animation" value={visual.animationState} />
          <Readout label="Glow" value={visual.glow.toFixed(2)} />
          <Readout label="Energy" value={visual.energy.toFixed(2)} />
          <Readout label="Complexity" value={visual.complexity.toFixed(2)} />
          <Readout label="Temperature" value={visual.temperature.toFixed(2)} />
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
