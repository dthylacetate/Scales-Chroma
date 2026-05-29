import { Activity, Layers, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { RealtimeCanvasRenderer } from "../canvas/RealtimeCanvasRenderer";
import type { TheoryElement } from "../types/theory";
import { mapTheoryToVisuals } from "../visual_engine/mapTheoryToVisuals";

const THEORY_LIBRARY: TheoryElement[] = [
  { id: "major", type: "scale", name: "Major" },
  { id: "minor", type: "scale", name: "Minor" },
  { id: "pentatonic", type: "scale", name: "Pentatonic" },
  { id: "dorian", type: "mode", name: "Dorian" },
  { id: "phrygian", type: "mode", name: "Phrygian" },
  { id: "maj7", type: "chord", name: "Maj7" },
  { id: "min7", type: "chord", name: "Min7" },
  { id: "dim7", type: "chord", name: "Dim7" },
  { id: "ii-v-i", type: "progression", name: "II-V-I" }
];

export function TheorySandbox() {
  const [selected, setSelected] = useState<TheoryElement>(THEORY_LIBRARY[5]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RealtimeCanvasRenderer | null>(null);
  const visual = useMemo(() => mapTheoryToVisuals([selected]), [selected]);

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
                className={`flex min-h-11 items-center justify-between rounded-md border px-3 text-left text-sm transition ${
                  selected.id === element.id
                    ? "border-[#ffd166] bg-[#ffd166] text-[#16110f]"
                    : "border-[#3f3144] bg-[#201922] text-stone-100 hover:border-[#5bd0c7]"
                }`}
                type="button"
                onClick={() => setSelected(element)}
              >
                <span className="font-medium">{element.name}</span>
                <span className="text-xs uppercase opacity-70">{element.type}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#5bd0c7]/20 bg-[#090809]">
          <canvas
            ref={canvasRef}
            aria-label="实时音乐视觉舞台"
            className="h-full min-h-[420px] w-full"
          />
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md bg-[#120f12]/75 px-3 py-2 text-sm text-[#b9fff7]">
            <Activity aria-hidden="true" className="size-4" />
            <span>{selected.name}</span>
          </div>
        </section>

        <aside className="flex flex-col gap-3 rounded-lg border border-[#d8a657]/20 bg-[#18131b]/90 p-3">
          <div className="flex items-center gap-2 border-b border-[#5bd0c7]/15 pb-3">
            <Layers aria-hidden="true" className="size-5 text-[#d8a657]" />
            <h2 className="text-base font-semibold tracking-normal">Visual State</h2>
          </div>
          <Readout label="Element" value={selected.name} />
          <Readout label="Color" value={visual.color} swatch={visual.color} />
          <Readout label="Geometry" value={visual.geometry} />
          <Readout label="Animation" value={visual.animationState} />
          <Readout label="Glow" value={visual.glow.toFixed(2)} />
        </aside>
      </section>
    </main>
  );
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
