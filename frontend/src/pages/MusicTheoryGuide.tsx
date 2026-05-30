import { BookOpen, Layers, Music2, Sparkles, Waves } from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  summary: string;
  points: string[];
  example: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "pitch",
    title: "音高、半音与音程",
    summary: "音高是声音的高低，半音是钢琴上相邻两个键之间的距离。乐理里的很多关系，本质上都是在数音与音之间隔了几个半音。",
    points: [
      "一个八度可以粗略理解为 12 个半音，C 到下一个 C 就跨过一整个八度。",
      "音程是两个音之间的距离，例如大三度是 4 个半音，小三度是 3 个半音。",
      "听感上，大三度通常更明亮，小三度通常更忧郁；这也是大小调情绪差异的核心来源。",
      "先能数清半音，再去看音阶、和弦、调式，会轻松很多。"
    ],
    example: "C 到 E 是大三度，C 到 Eb 是小三度；只差一个半音，情绪就会明显改变。"
  },
  {
    id: "tuning",
    title: "音律：为什么 12 个半音能组成一个八度",
    summary: "音律是把连续的声音高度切分成可使用音高的规则。现代钢琴、吉他和大多数流行音乐默认使用十二平均律，也就是把一个八度平均切成 12 份。",
    points: [
      "十二平均律的好处是方便转调：同一把吉他或钢琴可以在任意调上演奏同样的结构。",
      "纯律会让某些音程听起来更纯、更贴合泛音，但换到别的调时可能会不方便。",
      "乐理学习里常说的半音、全音、音阶公式，默认基本都建立在十二平均律上。",
      "吉他品格就是十二平均律的直观体现：每往高一品，音高上升一个半音。"
    ],
    example: "从 C 到高一个八度的 C，中间可以数出 12 个半音；C 到 D 隔 2 个半音，所以叫一个全音。"
  },
  {
    id: "scales",
    title: "音阶：音乐使用的材料表",
    summary: "音阶可以理解为一组可用音。它告诉你这段音乐主要从哪些音里取材，也决定了旋律最基础的颜色。",
    points: [
      "Major 大调音阶常见公式是 全-全-半-全-全-全-半，听感明亮、稳定。",
      "Natural Minor 自然小调常见公式是 全-半-全-全-半-全-全，听感更内敛、暗一些。",
      "Pentatonic 五声音阶只保留 5 个常用音，冲突少，很适合即兴和入门旋律。",
      "Harmonic Minor 和 Melodic Minor 会引入更强的张力，常见于金属、古典、爵士和融合语境。"
    ],
    example: "C Major 是 C D E F G A B；A Minor 是 A B C D E F G。它们用同一批白键，但主音不同，听感中心也不同。"
  },
  {
    id: "modes",
    title: "调式：同一批音的不同重心",
    summary: "调式不是另一套神秘系统，而是同一组音在不同主音上形成的不同性格。主音变了，稳定点和张力点也会变。",
    points: [
      "Ionian 基本等于大调，明亮、稳定、像回到家。",
      "Dorian 是小调骨架加明亮的 6 级，常用于 funk、jazz、fusion，暗但不沉。",
      "Phrygian 有很强的 b2 张力，听感神秘、危险、偏异域。",
      "Lydian 有升 4 级，听感漂浮、开阔、像被向上抬起。",
      "Mixolydian 是大调骨架加 b7，常见于 blues、rock、funk，有推进感但不太严肃。"
    ],
    example: "只用 C 大调的白键，如果从 D 当中心弹，就是 D Dorian；从 F 当中心弹，就是 F Lydian。"
  },
  {
    id: "chords",
    title: "和弦：把多个音堆成一个情绪块",
    summary: "和弦是多个音同时响起。最基础的三和弦由根音、三度、五度组成，七和弦再加一个七度，颜色会更丰富。",
    points: [
      "Major 三和弦 = 根音 + 大三度 + 纯五度，听感明亮稳定。",
      "Minor 三和弦 = 根音 + 小三度 + 纯五度，听感更暗、更柔。",
      "Maj7 在大三和弦上加大七度，常有温暖、梦幻、城市夜色的感觉。",
      "Min7 在小三和弦上加小七度，常见于 jazz、neo soul、funk。",
      "Dominant7 有强烈想解决到 I 的倾向，是很多 blues、jazz 终止感的核心。",
      "Dim7 和 Aug 张力更高，适合制造不稳定、悬疑、转场或戏剧感。"
    ],
    example: "Cmaj7 是 C E G B；Cm7 是 C Eb G Bb。E 和 Eb 只差一个半音，却会把情绪从明亮推向阴影。"
  },
  {
    id: "progressions",
    title: "和弦进行：情绪如何往前走",
    summary: "单个和弦像一个画面，和弦进行则像镜头运动。它决定音乐从哪里出发、如何制造期待、最后落在哪里。",
    points: [
      "I 通常是家，稳定、落地；V 通常有强烈回到 I 的倾向。",
      "ii-V-I 是爵士和很多流行音乐里的经典终止：准备、推动、回家。",
      "I-V-vi-IV 是非常常见的流行循环，稳定、易记、适合副歌。",
      "IV-V-iii-vi 在华语和日系流行里很常见，整体听感自然，但拆成两两连接时会有更细腻的转弯。",
      "看进行时不要只问某两个和弦是否合理，也要看它们是否处在一个常见整体句法里。"
    ],
    example: "输入 1251 时，可以理解为 I-ii-V-I。虽然 I 到 ii 单看像走出去，但后面接 V-I 后，就形成很清楚的回家路径。"
  },
  {
    id: "tension",
    title: "张力与解决：为什么音乐会有期待感",
    summary: "张力来自不稳定的音、和弦或运动方向；解决则是回到更稳定的位置。音乐的情绪通常就在张力和解决之间摆动。",
    points: [
      "离主音越远、包含越多不稳定音，通常张力越强。",
      "Dominant7、Dim7、半音移动、b2、#4 都常常带来明显张力。",
      "解决不一定必须回到 I，也可以故意延迟、绕开，形成更现代或更暧昧的听感。",
      "Scales & Chroma 的舞台会把张力映射成颜色对比、几何尖锐度、粒子密度和运动速度。"
    ],
    example: "V7 到 I 像一句话终于说完；V7 到 vi 则像本来要回家，却转进了另一个情绪房间。"
  }
];

const MODE_CARDS = [
  { name: "Ionian", color: "#ffd166", text: "大调中心，稳定、开阔、像日光。" },
  { name: "Dorian", color: "#5bd0c7", text: "小调底色里带一点亮，适合律动和融合。" },
  { name: "Phrygian", color: "#c56cf0", text: "b2 带来神秘和压迫，适合暗色张力。" },
  { name: "Lydian", color: "#9af0ff", text: "#4 让空间上浮，适合梦幻和悬浮感。" },
  { name: "Mixolydian", color: "#ff9f68", text: "b7 带来 blues/rock 的推进和松弛。" }
];

const PRACTICE_STEPS = [
  "先选一个主音，例如 C。",
  "弹出 C Major，感受大调的稳定中心。",
  "再只用同一批音，把 D 当成中心弹旋律，感受 Dorian 的变化。",
  "选一个和弦，例如 Maj7 或 Dominant7，听它如何改变同一条旋律的气质。",
  "最后加入 I-V-vi-IV 或 ii-V-I，观察音乐从静态颜色变成动态路径。"
];

export function MusicTheoryGuide() {
  return (
    <main className="min-h-screen bg-[#120f12] text-stone-100">
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6">
        <header className="grid gap-3 border-b border-[#5bd0c7]/15 pb-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#5bd0c7]">
            <BookOpen aria-hidden="true" className="size-4" />
            基础乐理学习
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-normal text-stone-50 md:text-5xl">从“会听见颜色”开始理解乐理</h1>
          <p className="max-w-3xl text-sm leading-7 text-stone-300 md:text-base">
            这页不是完整乐理百科，而是一条入门路线：先理解音高和音程，再理解音阶、调式、和弦、进行，最后明白张力为什么会推动音乐往前走。读完后，你应该能更顺利地看懂常见乐理教材。
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-5" aria-label="调式速览">
          {MODE_CARDS.map((mode) => (
            <article key={mode.name} className="rounded-md border border-[#3f3144] bg-[#18131b] p-3">
              <div className="mb-3 h-1.5 rounded-full" style={{ backgroundColor: mode.color }} />
              <h2 className="text-sm font-semibold text-stone-50">{mode.name}</h2>
              <p className="mt-2 text-xs leading-5 text-stone-300">{mode.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4">
            {GUIDE_SECTIONS.map((section, index) => (
              <article id={section.id} key={section.id} className="scroll-mt-24 rounded-md border border-[#3f3144] bg-[#18131b] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-md border border-[#5bd0c7]/30 bg-[#142225] text-sm font-semibold text-[#b9fff7]">
                    {index + 1}
                  </span>
                  <h2 className="text-xl font-semibold tracking-normal text-stone-50">{section.title}</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-300">{section.summary}</p>
                <div className="mt-3 grid gap-2">
                  {section.points.map((point) => (
                    <div key={point} className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-sm leading-6 text-stone-300">
                      {point}
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-[#ffd166]/25 bg-[#241f18] px-3 py-2 text-sm leading-6 text-[#ffe8a3]">
                  例子：{section.example}
                </div>
              </article>
            ))}
          </div>

          <aside className="grid content-start gap-4 lg:sticky lg:top-20">
            <section className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ffd166]">
                <Layers aria-hidden="true" className="size-4" />
                推荐学习顺序
              </div>
              <div className="mt-3 grid gap-2 text-sm text-stone-300">
                {GUIDE_SECTIONS.map((section, index) => (
                  <a key={section.id} className="rounded-md border border-white/5 bg-white/5 px-3 py-2 transition hover:border-[#5bd0c7]/40" href={`#${section.id}`}>
                    {index + 1}. {section.title}
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#5bd0c7]">
                <Music2 aria-hidden="true" className="size-4" />
                练习方法
              </div>
              <div className="mt-3 grid gap-2">
                {PRACTICE_STEPS.map((step) => (
                  <div key={step} className="rounded-md border border-white/5 bg-white/5 px-3 py-2 text-sm leading-6 text-stone-300">
                    {step}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ffb8c5]">
                <Waves aria-hidden="true" className="size-4" />
                和沙盘怎么对应
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                在沙盘里，音阶和调式决定底色，和弦决定局部情绪，进行决定运动方向，张力决定画面是柔和扩散还是尖锐爆裂。
              </p>
            </section>

            <section className="rounded-md border border-[#3f3144] bg-[#18131b] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#c2b8ff]">
                <Sparkles aria-hidden="true" className="size-4" />
                读教材前应掌握
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                你不需要先背完整调号表，但最好能理解半音、音程、大小三度、三和弦、七和弦、I/IV/V/vi/ii 这些级数的基本作用。
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
