import { Activity, CalendarDays, Flame, GitBranch, Grip, Layers, Save, Search, Send, Sparkles, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { RealtimeCanvasRenderer } from "../canvas/RealtimeCanvasRenderer";
import { getSavedCompositions, saveComposition, type SavedComposition, updateComposition } from "../services/compositionsApi";
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

interface TheorySandboxProps {
  apiBaseUrl?: string;
  userId?: number;
}

export function TheorySandbox({ apiBaseUrl, userId }: TheorySandboxProps) {
  const [selected, setSelected] = useState<TheoryElement>(THEORY_LIBRARY[5]);
  const [composition, setComposition] = useState<TheoryElement[]>([]);
  const [invalidHint, setInvalidHint] = useState<string | null>(null);
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
  const [compositionError, setCompositionError] = useState<string | null>(null);
  const [visualRefreshKey, setVisualRefreshKey] = useState(0);
  const activeElement = composition.at(-1) ?? selected;
  const activeElements = useMemo(() => (composition.length > 0 ? composition : [selected]), [composition, selected]);
  const localVisual = useMemo(() => mapTheoryToVisuals([activeElement]), [activeElement]);
  const [visual, setVisual] = useState<VisualParameters>(localVisual);

  useEffect(() => {
    let cancelled = false;
    setVisual(localVisual);

    if (!apiBaseUrl) {
      return () => {
        cancelled = true;
      };
    }

    renderSandboxVisual({
      apiBaseUrl,
      elements: activeElements,
      userId
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
  }, [activeElements, apiBaseUrl, localVisual, userId, visualRefreshKey]);

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

    if (!apiBaseUrl || !userId) {
      setSkillTree(null);
      return () => {
        cancelled = true;
      };
    }

    getSkillTree({ apiBaseUrl, userId })
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
  }, [apiBaseUrl, userId, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !userId) {
      setHeatmap(null);
      return () => {
        cancelled = true;
      };
    }

    getYearlyHeatmap({
      apiBaseUrl,
      userId,
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
  }, [apiBaseUrl, practiceDate, userId, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !userId) {
      setUnlockedEffects([]);
      return () => {
        cancelled = true;
      };
    }

    getUnlockedEffects({ apiBaseUrl, userId })
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
  }, [apiBaseUrl, userId, visualRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !userId) {
      setPracticeHistory([]);
      return () => {
        cancelled = true;
      };
    }

    getPracticeRecords({ apiBaseUrl, userId, limit: 5 })
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
  }, [apiBaseUrl, userId]);

  useEffect(() => {
    let cancelled = false;

    if (!apiBaseUrl || !userId) {
      setSavedCompositions([]);
      return () => {
        cancelled = true;
      };
    }

    getSavedCompositions({ apiBaseUrl, userId })
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
  }, [apiBaseUrl, userId]);

  return (
    <main className="min-h-screen bg-[#120f12] text-stone-100">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        <aside className="flex flex-col gap-3 rounded-lg border border-[#d8a657]/20 bg-[#18131b]/90 p-3">
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

        <section className="flex min-h-[560px] flex-col gap-3">
          <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg border border-[#5bd0c7]/20 bg-[#090809]">
            <canvas
              ref={canvasRef}
              aria-label="实时音乐视觉舞台"
              className="h-full min-h-[420px] w-full"
            />
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md bg-[#120f12]/75 px-3 py-2 text-sm text-[#b9fff7]">
              <Activity aria-hidden="true" className="size-4" />
              <span>{activeElement.name}</span>
            </div>
          </div>

          <div
            aria-label="乐理编排轨道"
            className="min-h-28 rounded-lg border border-dashed border-[#5bd0c7]/40 bg-[#18131b]/90 p-3"
            onDragOver={(event) => {
              event.preventDefault();
              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const elementId = event.dataTransfer.getData("text/plain");
              addToComposition(elementId);
            }}
          >
            <div className="mb-2 flex items-center justify-between text-xs uppercase text-stone-400">
              <span>Composition Lane</span>
              <span>{composition.length} blocks</span>
            </div>
            {composition.length === 0 ? (
              <div className="flex min-h-14 items-center justify-center rounded-md border border-[#3f3144] bg-[#201922] text-sm text-stone-400">
                把乐理积木拖到这里
              </div>
            ) : (
              <div className="flex min-h-14 flex-wrap items-center gap-2">
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

        <aside className="flex flex-col gap-3 rounded-lg border border-[#d8a657]/20 bg-[#18131b]/90 p-3">
          <div className="flex items-center gap-2 border-b border-[#5bd0c7]/15 pb-3">
            <Layers aria-hidden="true" className="size-5 text-[#d8a657]" />
            <h2 className="text-base font-semibold tracking-normal">Visual State</h2>
          </div>
          <Readout label="Element" value={activeElement.name} />
          <Readout label="Color" value={visual.color} swatch={visual.color} />
          <Readout label="Geometry" value={visual.geometry} />
          <Readout label="Animation" value={visual.animationState} />
          <Readout label="Glow" value={visual.glow.toFixed(2)} />
          <Readout label="Trail" value={visual.particles.trail ? "On" : "Off"} />

          {apiBaseUrl && userId ? (
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
                    <button
                      key={savedComposition.id}
                      className={`rounded-md border px-2 py-1.5 text-left text-sm text-stone-100 hover:border-[#ffd166] ${
                        selectedCompositionId === savedComposition.id
                          ? "border-[#ffd166] bg-[#2a2023]"
                          : "border-[#3f3144] bg-[#201922]"
                      }`}
                      type="button"
                      onClick={() => loadSavedComposition(savedComposition)}
                    >
                      {savedComposition.name}
                    </button>
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

          {apiBaseUrl && userId ? (
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

    if (!apiBaseUrl || !userId) {
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
        userId
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

    if (!apiBaseUrl || !userId) {
      return;
    }

    try {
      const records = await getPracticeRecords({
        apiBaseUrl,
        userId,
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
    if (!apiBaseUrl || !userId) {
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
        elements: elementsToSave,
        name,
        userId
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
    if (!apiBaseUrl || !userId || selectedCompositionId === null) {
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
        compositionId: selectedCompositionId,
        elements: elementsToSave,
        name,
        userId
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
            <div className="font-medium text-[#b9fff7]">{effect.effectName}</div>
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
