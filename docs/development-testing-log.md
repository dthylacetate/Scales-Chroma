# 开发测试思路与历程

本文档记录 Scales & Chroma 当前阶段的 TDD 开发过程、测试设计思路和验证结果。这里会尽量用中文说明真实开发过程；路径、函数名、API 名称、commit 原文会保留英文或代码格式，方便和仓库内容对照。

项目目标不是普通 CRUD 应用，而是“乐理视觉化沙盘 + 游戏化成长系统”，所以测试重点始终围绕核心体验闭环展开：

```text
乐理元素组合 -> 视觉映射 -> Canvas 实时反馈 -> 练习成长 -> 解锁更强视觉能力
```

## 当前范围决定

为了保证项目能更稳定地走到“可正式运行”的阶段，当前范围做了下面这些收敛：

- 成长系统保留核心闭环，但复杂优化优先级下调。
- 认证系统只做最基础版本，核心目标是用户隔离，不追求复杂安全方案。
- 注册不需要验证码，密码阶段性不做加密存储。
- 部署阶段默认按 `IP + 端口` 访问，不以域名为目标。
- 数据库继续采用轻量化路线，以 SQLite 为最终方案。
- 错误监控只做基础日志和健康检查能力。
- API 边界与越权访问测试会继续补到测试设计里，作为答辩展示的一部分。

## 测试原则

1. 先写红灯测试，再实现功能，再重构。
2. 核心领域逻辑必须可独立测试，例如 EXP、视觉映射、张力分析。
3. UI 测试验证用户能感知到的行为，不只检查组件是否渲染。
4. Canvas 测试优先覆盖生命周期和资源清理，避免后续实时渲染内存泄漏。
5. API 测试先锁定契约形状，再逐步接数据库和更复杂的服务逻辑。

## 最新一轮：Scene Cascade 三元组合级联

这一轮的核心不是再加几个小 bonus，而是把“满足合理三元组合时，舞台要明显长出第二层大型结构”正式做出来。

新增设计重点：

- 后端 `/sandbox/render` 新增 `scene_cascade` 与 `scene_cascade_intensity`。
- 前端本地映射也同步支持同一套级联逻辑，避免离线和在线两套世界观不一致。
- Canvas 新增独立 `Scene Cascade` 渲染层。
- 右侧新增 `Scene Cascade` 面板，用中文解释“为什么这次不是普通换色，而是舞台整体升级”。

当前重点覆盖的三元组合：

- `Lydian + Maj7 + II-V-I` -> `Aurora Choir` / `Aurora Dais`
- `Dorian + Min7 + II-V-I` -> `Blue Velvet Arcade` / `Velvet Arcade`
- `Harmonic Minor + Dim7 + Dominant7` -> `Ritual Crucible` / `Eclipse Altar`
- `Melodic Minor + Dominant7 + Aug` -> `Prism Engine` / `Prism Vortex`
- `Pentatonic + Mixolydian + Dominant7` -> `Voltage Causeway` / `Tide Runway`

对应测试补充：

- 后端单元测试：
  - 验证三元组合会触发新的签名、级联名称和更高的 `depth / beam_strength`。
- 后端 API 测试：
  - 验证 `/sandbox/render` 会返回 `scene_cascade` 和 `scene_cascade_intensity`。
- 前端 visual engine 测试：
  - 验证本地映射同样会把三元组合提升为 `Scene Cascade`。
- 前端 Canvas 测试：
  - 验证有级联时会调用额外的旋转/线段/描边逻辑，而不是仍然停留在旧层级。
- 前端 UI 测试：
  - 验证带认证的真实响应下会把 `Scene Cascade` 文本渲染出来。

这一轮继续往前补了一层“切场体感”：

- `RealtimeCanvasRenderer` 不再随着每次 `visual` 变化而销毁重建。
- 现在同一实例会维护 `currentVisual -> targetVisual` 的过渡。
- 当签名、场景家族、Growth 印记、Scene Cascade 发生切换时，会计算一段 `transition impact`，并画出额外的切场冲击波。

新增前端测试点：

- 同一渲染器在运行中接收第二次 `start()` 时，不会额外重建 render loop，而是会在现有循环里向新目标视觉形态 morph。

本轮验证结果：

- 后端：`86 passed, 1 warning`
- 前端：`58 passed`
- 前端 build：通过

后续补测后最新结果：

- 前端：`59 passed`
- 前端 build：通过

下一轮继续补的是“Growth 改写 Scene Cascade”：

- 目标：同一个三元组合在不同成长轨迹下，不只是多一层纹理，而是让级联本身继续分化。
- 实现方式：
  - 后端新增 `GROWTH_CASCADE_RULES`
  - 当 `scene_cascade` 与 `growth_imprint` 命中特定组合时，会追加新的 `active_bonuses`
  - 并进一步改写几何主导、色彩落点、深度或秩序感
- 当前已落地的例子：
  - `aurora-dais + jazz-lattice` -> `Choir Vault`
  - `aurora-dais + neo-soul-veil` -> `Silken Halo`
  - `velvet-arcade + neo-soul-veil` -> `Rose Arcade`
  - `eclipse-altar + metal-forge` -> `Forge Throne`
  - `prism-vortex + fusion-phase` -> `Phase Cloister`
  - `tide-runway + pentatonic-drive` -> `Neon Causeway`

对应验证：

- 后端新增单元测试，确认同一 `Lydian + Maj7 + II-V-I` 在 Jazz Growth 解锁后：
  - 仍然保持 `aurora-dais`
  - 但会新增 `Choir Vault`
  - 并把主导几何从 `soft-orb` 推向 `lattice`
- 前端右侧 `Scene Cascade` 面板新增“成长染色”说明
- 前端 Canvas 在不同 `growthImprint` 下会为同一个级联额外长出不同结构线和氛围层

补测结果：

- 后端：`87 passed, 1 warning`

## 最新一轮：Growth Lens Preview 不落库成长预览

这一轮补的不是新的持久化成长规则，而是一个更适合演示和调参的“预览镜头”。

目标：

- 不必真的练满某一路线，也能直接比较同一组乐理积木在不同 Growth 轨迹下会怎样改写舞台。
- 预览必须是临时的，不能污染真实用户解锁数据。

实现方式：

- 后端 `SandboxRenderRequest` 新增 `preview_growth_imprint`。
- `/sandbox/render` 会把这个字段作为临时成长镜头，只参与本次渲染，不写入数据库。
- `render_visual_parameters(...)` 会先把对应路线的 Growth 特效临时加入，再强制把本次渲染推到目标成长印记上。
- 这样 `Scene Cascade`、`Growth Imprint`、右侧解释面板和 Canvas 渲染层都会一起跟着变，不只是改一个标签。

这一轮重点测试：

- 后端单元测试：
  - `test_renderer_can_preview_a_growth_imprint_without_real_unlocks`
  - 验证没有真实解锁时，`preview_growth_imprint="neo-soul-veil"` 仍然能把同一个 `Lydian + Maj7 + II-V-I` 推向 `Silken Halo`
- 后端 API 测试：
  - `test_sandbox_render_supports_non_persistent_growth_preview`
  - 验证 `/sandbox/render` 能接收 `preview_growth_imprint`
  - 验证响应中的 `growth_imprint` 与 `active_bonuses` 正确变化
  - 验证数据库里的 `unlocked_effects` 条数保持不变，确保没有把预览写成真实成长
- 前端 service 测试：
  - 验证 `renderSandboxVisual(...)` 会把 `preview_growth_imprint` 正确写进请求体
- 前端 UI 测试：
  - 验证点击 `Growth Lens Preview` 的不同按钮后，页面会重新请求 `/sandbox/render`
  - 验证舞台左上角会出现新的“预览镜头”提示

本轮验证结果：

- 后端：`89 passed, 1 warning`
- 前端：`60 passed`
- 前端 build：通过

额外说明：

- 这轮尝试过用 in-app browser 和本地 Playwright 再补一层真实页面烟测。
- 当前环境对本地地址和浏览器进程都有运行限制，所以这轮没有新增可复现的浏览器自动化截图。
- 不过接口、渲染、UI 交互和不落库约束已经被自动化测试完整锁住，这轮功能风险是可控的。

## 最新一轮：Stage Setpiece 大型舞台装置层

这一轮继续处理“同一个场景家族里，为什么用户还会觉得不够大、不够像换了一整套 show rig”这个问题。

目标：

- 让 `Choir Vault / Silken Halo / Forge Throne / Phase Cloister / Neon Causeway` 这些成长分叉结果不再只是 bonus 文本。
- 让它们成为真正接管中间舞台的大型装置层。

实现方式：

- 前端新增 `frontend/src/visual_engine/stageSetpieces.ts`
- 先把成长分叉型 setpiece 和基础 `Scene Cascade` setpiece 统一整理成一个纯映射层
- `RealtimeCanvasRenderer` 新增 `drawStageSetpieceLayer(...)`
- 在 `Scene Cascade` 之后、主 beam/ring/geometry 之前插入 setpiece 层
- `TheorySandbox` 右侧新增 `Stage Setpiece` 面板，舞台左上角也会显示当前 setpiece 名称

这轮的设计重点：

- `Choir Vault`：纵向窗格、合唱穹顶、悬挂礼堂骨架
- `Silken Halo`：双侧幕纱、柔性光环、贴身包裹空间
- `Rose Arcade`：更浪漫、更靠近身体的拱廊走道
- `Blue Cloister`：更冷静、更规整的修道院回廊
- `Forge Throne`：中央王座、锻柱、压顶式熔炉骨架
- `Phase Cloister`：相位门框、棱镜回返通道
- `Neon Causeway`：更明确的护栏、跑道、远端冲刺线

对应测试：

- 新增 `frontend/src/tests/canvas/stageSetpieces.test.ts`
  - 验证分叉型 setpiece 优先于基础级联 setpiece
  - 验证没有级联时返回 `null`
- 更新 `frontend/src/tests/ui/TheorySandbox.test.tsx`
  - 验证 `Stage Setpiece` 面板真实渲染
  - 验证 `Choir Vault` 会同时出现在舞台角标和右侧说明中

本轮验证结果：

- 前端：`64 passed`
- 前端 build：通过

说明：

- 这轮没有改后端协议，所以没有重跑后端整套测试。
- 当前 1 个 React `act(...)` 提示仍然来自旧的组合保存测试，不是这轮 setpiece 变更引入的。

## 最新一轮：Stage Setpiece 灯光 Cue 层

上一轮把大型 setpiece 的骨架立起来之后，这一轮继续处理“为什么它们还不够像一整套 show cue”。

目标：

- 让 `Choir Vault / Silken Halo / Forge Throne / Phase Cloister / Neon Causeway` 这些大型装置，不只是有不同线框，而是连灯光行为都不同。

实现方式：

- `stageSetpieces.ts` 的 `StageSetpiece` 结构新增 `lighting`
- `TheorySandbox` 的 `Stage Setpiece` 面板新增“灯光调度”
- `RealtimeCanvasRenderer` 新增 `drawStageLightingCueLayer(...)`

当前已接入的灯光家族：

- `Choir Vault / Aurora Dais / Blue Cloister`
  - 顶部下压式礼堂光柱
- `Silken Halo / Rose Arcade / Velvet Arcade`
  - 侧洗幕光 + 脚灯
- `Forge Throne / Eclipse Altar`
  - 下打热口 + 斜向硬光
- `Phase Cloister / Prism Vortex`
  - 折返扫描光
- `Neon Causeway / Tide Runway`
  - 跑道边灯 + 远端冲刺灯点

对应验证：

- `stageSetpieces.test.ts`
  - 新增对 `lighting` 文案的断言
- `TheorySandbox.test.tsx`
  - 新增对 `Stage Setpiece` 面板“灯光调度”文案的断言
- 前端整模块测试
  - `64 passed`
- 前端 build
  - 通过

这一轮的价值不在于多一个面板，而在于：

- 同样叫“大型舞台”，现在它们不只是不同结构，还会像不同灯光导演在接管现场。
- 这让 Growth 分叉和三元组合级联的差异，从“场景名字不同”继续推进到“整场演出的控制方式不同”。

烟测补充说明：

- 本地浏览器链路已经真实跑到注册、练习记录、连续 `/sandbox/render` 请求和截图落盘。
- 当前 `/tmp/scales-stage-default.png` 与 `/tmp/scales-stage-growth.png` 已成功生成，可直接对照默认舞台与 Neo Soul 成长舞台的差异。
- 更激进的三元组合无头浏览器自动化在当前环境下仍然会遇到浏览器进程权限限制，但代码级与接口级验证已经完整覆盖了这轮改动的核心约束。

## 最新一轮：Stage Director Cue 导演调度层

上一轮把大型 setpiece 的骨架和灯光 cue 都接起来之后，这一轮继续处理“为什么它们还像是同一个 show 只是换灯了”。

目标：

- 让大型舞台分叉再多一层“导演式节奏语言”，把不同 Growth 轨迹的运动方式继续拉开。

实现方式：

- 新增 `frontend/src/visual_engine/stageDirectorCues.ts`
- 用 `setpiece / scene family / growth imprint` 推导导演式调度人格
- `RealtimeCanvasRenderer` 新增 `drawStageDirectorCueLayer(...)`
- `TheorySandbox` 右侧新增 `Stage Director Cue` 面板，舞台左上角新增 `Cue: ...`

当前已接入的导演调度：

- `Cathedral Descent`
- `Silk Breath`
- `Arcade Sway`
- `Forge Hammer`
- `Prism Scan`
- `Runway Chase`
- `Altar Eclipse`

对应验证：

- 前端测试：`67 passed`
- 前端 build：通过

这一层的价值在于：

- 现在不同路线不只是“长得不同、灯光不同”，连演出节奏和运动重心都不同。
- 舞台开始更像“不同导演在控同一个场地”，而不是同一套画法换一组配色。

## 最新一轮：Stage Projection Script 地面投影层

上一轮把导演调度加上之后，这一轮继续补“脚下空间的语法”。

目标：

- 让不同路线连地面都说不同的话，而不是所有舞台都共享一套默认地板。

实现方式：

- 新增 `frontend/src/visual_engine/stageProjectionScripts.ts`
- `RealtimeCanvasRenderer` 新增 `drawStageProjectionLayer(...)`
- `TheorySandbox` 右侧新增 `Stage Projection Script` 面板，舞台左上角新增 `Projection: ...`

当前已接入的地面投影家族：

- `Aisle Lattice`
- `Velvet Bloom`
- `Ember Grid`
- `Prism Circuit`
- `Velocity Markers`
- `Eclipse Seal`

对应验证：

- 前端测试：`71 passed`
- 前端 build：通过

这一层的价值在于：

- 不同 Growth / cascade 分叉不只是天上和中景不同，连脚下的导向、节奏和仪式感也不同。
- 用户对“我现在站在什么空间里”的感知会明显更强。

## 最新一轮：Stage Motion Rig 前景动势层

上一轮把脚下空间分开之后，这一轮继续补“观众面前那层会动的机构”。

目标：

- 让不同路线在前景也有独立的舞台机构，而不是所有变化都发生在远景和中景。

实现方式：

- 新增 `frontend/src/visual_engine/stageMotionRigs.ts`
- `RealtimeCanvasRenderer` 新增 `drawStageMotionRigLayer(...)`
- `TheorySandbox` 右侧新增 `Stage Motion Rig` 面板，舞台左上角新增 `Motion: ...`

当前已接入的前景动势机构：

- `Choir Crowns`
- `Ribbon Veils`
- `Piston Frames`
- `Prism Gates`
- `Runway Drones`
- `Eclipse Curtains`

对应验证：

- 前端测试：`75 passed`
- 前端 build：通过

这一层的价值在于：

- 舞台终于不只是“背景在变”，而是会有近景机构压到观众面前。
- 观感上更接近 live show，而不是中心发光体加几层背景粒子。

## 最新一轮：Stage Takeover 换场接管层

上一轮把前景机构也分出来之后，这一轮继续补“换场手势”。

目标：

- 让不同路线不只是切换结果不同，连“怎么接管旧舞台、怎么抢占新舞台”也不同。

实现方式：

- 新增 `frontend/src/visual_engine/stageTakeoverModes.ts`
- 把 `setpiece / motion rig / projection / takeover` 一起纳入 `transition impact` 计算
- `RealtimeCanvasRenderer` 在 `drawTransitionImpact(...)` 中按 takeover 模式绘制不同换场手势
- `TheorySandbox` 右侧新增 `Stage Takeover` 面板，舞台左上角新增 `Takeover: ...`

当前已接入的接管模式：

- `Cathedral Iris`
- `Velvet Drape`
- `Forge Slam`
- `Prism Scanline`
- `Runway Rush`
- `Eclipse Veil`

对应验证：

- 前端测试：`79 passed`
- 前端 build：通过

这一层的价值在于：

- 现在换场本身更像演出的一部分，而不是统一的冲击波过渡。
- 不同 Growth / cascade 分叉会带来不同的接管体感。

## 最新一轮：后端 Emergent Synergy 参数人格增强

前端演出层越做越厚之后，这一轮把后端视觉引擎本身也往更“二次生长”的方向推。

目标：

- 不只识别预设组合规则，而是让后端根据参数聚合后的整体人格继续触发二次加成。

实现方式：

- `backend/app/visual_engine/renderer.py` 新增 `emergent synergy` 判断层
- 至少双元素以上时，基于聚合后的开放度、重力、摆动、复杂度、beam 等条件再触发额外人格

当前已接入的参数人格：

- `Horizon Bloom`
- `Abyss Pressure`
- `Slipstream Pocket`
- `Prism Surge`

对应验证：

- 后端整套：`92 passed, 1 warning`

这一层的价值在于：

- 后端不再只是“命中表就给 bonus”，而开始像一个会从整体参数结构里长出第二层性格的视觉引擎。

## 最新一轮：Synergy Glyph 协同徽记层

后端开始长出参数人格之后，这一轮把这层人格真正做成可见舞台结构。

目标：

- 让 `Horizon Bloom / Abyss Pressure / Slipstream Pocket / Prism Surge` 不再只是列表项，而是真正进入舞台画面。

实现方式：

- 新增 `frontend/src/visual_engine/stageSynergyGlyphs.ts`
- `RealtimeCanvasRenderer` 新增 `drawStageSynergyGlyphLayer(...)`
- `TheorySandbox` 右侧新增 `Synergy Glyph` 面板，舞台左上角新增 `Glyph: ...`

当前已接入的协同徽记：

- `Horizon Bloom`
- `Abyss Pressure`
- `Slipstream Pocket`
- `Prism Surge`
- 回退 glyph：`Cadence Spine`、`Radiant Fan`

对应验证：

- 前端测试：`83 passed`
- 前端 build：通过

这一层的价值在于：

- 后端“更聪明”的部分终于能被用户肉眼看见。
- 参数人格开始拥有自己的结构语言，而不是只留在数值和面板文字里。

## 最新一轮：Stage Climate 场景气候层

这一轮继续处理一个很关键但容易被忽略的问题：不同路线虽然已经有不同骨架、灯光、前景和换场，但“空气本身”还不够像不同世界。

目标：

- 让不同场景家族和协同人格拥有不同的空气介质、漂浮物和环境流动方式。
- 让用户不仅看见舞台“长得不一样”，还会感觉“这里的空气也不是同一种空气”。

实现方式：

- 新增 `frontend/src/visual_engine/stageClimateProfiles.ts`
- 先基于 `sceneFamily` 给出基础 `Stage Climate`
- 再结合 `Synergy Glyph` 把气候进一步推向更明确的二级人格
- `RealtimeCanvasRenderer` 新增 `drawStageClimateLayer(...)`
- `TheorySandbox` 右侧新增 `Stage Climate` 面板，舞台左上角新增 `Climate: ...`

当前基础气候家族：

- `Solar Haze`
- `Velvet Mist`
- `Ember Ash`
- `Choir Dust`
- `Prism Fog`
- `Tide Vapor`
- `Neon Smog`
- `Sanctum Smoke`

当前基于协同人格的二级改写：

- `Horizon Bloom` -> `Bloom Haze`
- `Abyss Pressure` -> `Abyss Smoke`
- `Slipstream Pocket` -> `Slipstream Air`
- `Prism Surge` -> `Prism Charge`

对应验证：

- 新增 `frontend/src/tests/canvas/stageClimateProfiles.test.ts`
  - 验证基础气候与协同改写都会返回正确 profile
- 更新 `frontend/src/tests/canvas/realtimeCanvasRenderer.test.ts`
  - 验证渲染器会真的画出 climate layer，而不是只有说明文字
- 更新 `frontend/src/tests/ui/TheorySandbox.test.tsx`
  - 验证右侧 `Stage Climate` 面板和舞台角标都会显示正确的气候名称
- 前端整套：`87 passed`
- 前端 build：通过

这一层的价值在于：

- 现在不同路线不只是舞台装置、灯光和换场不同，连空气介质和体感都不同。
- 整个中间舞台开始更像一个真正被不同物理/情绪环境占领的演出空间，而不是只有图层数量在增加。

## 最新一轮：Phrase Trajectory 顺序推进层

这一轮继续处理一个很贴近交互手感的问题：之前很多组合虽然参数已经很丰富，但“同一组模块换个顺序”带来的差异还不够直接。

目标：

- 让拖拽顺序本身也变成正式的视觉语言。
- 让用户重新排列模块时，不只是看到数值轻微浮动，而是能看到舞台主弧线和推进路径明显变化。

实现方式：

- 后端 `VisualParameters` 新增 `phrase_trajectory` 与 `phrase_trajectory_intensity`
- `renderer.py` 新增 `_resolve_phrase_trajectory(...)`
- 这层不再只看“有哪些模块”，还会看“谁在前面、谁在后面、这条路径是怎么走到落点的”
- 前端新增 `frontend/src/visual_engine/stagePhraseTrajectories.ts`
- `RealtimeCanvasRenderer` 新增 `drawStagePhraseTrajectoryLayer(...)`
- `TheorySandbox` 右侧新增 `Phrase Trajectory` 面板，舞台左上角新增 `Trajectory: ...`

当前已接入的顺序轨迹：

- `Lift Arc`
- `Velvet Drift`
- `Forge Drop`
- `Prism Climb`
- `Runway Drive`
- `Shadow Sink`

当前规则示例：

- `Lydian -> Maj7 -> II-V-I` 更容易被推成 `Lift Arc`
- `Pentatonic -> Mixolydian -> Dominant7` 更容易被推成 `Runway Drive`
- `Dominant7 -> Dim7 -> Harmonic Minor` 会更容易沉成 `Shadow Sink`

对应测试：

- 后端单元测试：
  - 验证不同顺序会得到不同的 `phrase_trajectory`
  - 验证 `lift-arc` 与 `shadow-sink` 会同时抬高不同参数
- 后端 API 测试：
  - 验证 `/sandbox/render` 会返回 `phrase_trajectory` 和 `phrase_trajectory_intensity`
- 前端 canvas/profile 测试：
  - 新增 `stagePhraseTrajectories.test.ts`
  - `realtimeCanvasRenderer.test.ts` 新增对主弧线路径绘制的断言
- 前端 UI 测试：
  - 验证右侧 `Phrase Trajectory` 面板与左上角 `Trajectory: ...` 会同时出现

本轮验证结果：

- 后端：`94 passed, 1 warning`
- 前端：`91 passed`
- 前端 build：通过

这一层的价值在于：

- 它把“拖拽顺序”从弱影响变成了能被用户直接感知的主导因素。
- 这会让乐理沙盘更像真正可以编排的舞台，而不是把几个模块丢进去之后只能看它们静态叠加。

## 最新一轮：Phrase Hooks 相邻桥接层

上一轮把“整句轨迹”做出来之后，这一轮继续处理一个更细的层级：同一组模块不只是整句往哪走不同，**相邻两个模块是怎么接过去的**也应该不同。

目标：

- 让拖拽顺序不只体现在一句大轨迹上，也体现在局部桥接动作上。
- 让用户重新排列模块时，不只是舞台主弧线改变，连局部节点之间的过桥手势都能变。

实现方式：

- 后端 `VisualParameters` 新增 `phrase_hooks` 与 `phrase_hook_energy`
- `renderer.py` 新增 `PHRASE_HOOK_RULES` 与 `_apply_phrase_hooks(...)`
- 这层会检查相邻模块对，比如：
  - `Lydian -> Maj7`
  - `Maj7 -> II-V-I`
  - `Pentatonic -> Mixolydian`
  - `Dominant7 -> Harmonic Minor`
- 前端新增 `frontend/src/visual_engine/stagePhraseHooks.ts`
- `RealtimeCanvasRenderer` 新增 `drawStagePhraseHooksLayer(...)`
- `TheorySandbox` 右侧新增 `Phrase Hooks` 面板，舞台左上角新增 `Hooks: ...`

当前已接入的桥接动作：

- `Skyline Rise`
- `Cadence Sweep`
- `Velvet Link`
- `Runway Spark`
- `Collapse Gate`
- `Ritual Notch`
- `Prism Ladder`

对应测试：

- 后端单元测试：
  - 验证 `Lydian -> Maj7 -> II-V-I` 会同时长出 `Skyline Rise` 与 `Cadence Sweep`
- 后端 API 测试：
  - 验证 `/sandbox/render` 会返回 `phrase_hooks` 与 `phrase_hook_energy`
- 前端 helper 测试：
  - 新增 `stagePhraseHooks.test.ts`
- 前端 Canvas 测试：
  - 验证桥接层会真的触发曲线或桥接节点绘制
- 前端 UI 测试：
  - 验证右侧 `Phrase Hooks` 面板和左上角 `Hooks: ...` 会同时出现

本轮验证结果：

- 后端：`95 passed, 1 warning`
- 前端：`94 passed`
- 前端 build：通过
- 真实浏览器烟测：通过
  - `Lydian -> Maj7 -> II-V-I` 在真实页面里确认出现 `Aurora Dais / Lift Arc / Skyline Rise / Cadence Sweep`
  - `Dominant7 -> Harmonic Minor -> Dim7` 在真实页面里确认出现 `Eclipse Altar / Shadow Sink`
  - 同一轮烟测里 `Valence` 从 `1.00` 到 `0.25`

这一层的价值在于：

- 现在拖拽顺序的反馈不再只靠一句总走势，而是连局部连接处都有可感知变化。
- 这会让用户在拖、换、重排模块时，更像真的在“编排一句舞台动作”，而不是只换一条曲线。

- 新增 `frontend/src/visual_engine/stageDirectorCues.ts`
- 用 `getStageSetpiece(...)` 作为入口，把 setpiece 继续映射到不同的 director cue
- `TheorySandbox` 新增 `Stage Director Cue` 面板
- 舞台左上角角标新增 `Cue: ...`
- `RealtimeCanvasRenderer` 新增 `drawStageDirectorCueLayer(...)`

当前已接入的导演 cue 家族：

- `Cathedral Descent`
  - 适用于 `Choir Vault / Aurora Dais / Blue Cloister`
  - 体现成组下压的礼堂式调度
- `Silk Breath`
  - 适用于 `Silken Halo`
  - 体现双侧幕纱与光环一起呼吸
- `Arcade Sway`
  - 适用于 `Rose Arcade / Velvet Arcade`
  - 体现脚灯与回廊侧洗缓慢摆移
- `Forge Hammer`
  - 适用于 `Forge Throne`
  - 体现重击式下压和热口爆闪
- `Prism Scan`
  - 适用于 `Phase Cloister / Prism Vortex`
  - 体现折返扫描与相位交通
- `Runway Chase`
  - 适用于 `Neon Causeway / Tide Runway`
  - 体现边灯追光与纵深冲刺
- `Altar Eclipse`
  - 适用于 `Eclipse Altar`
  - 体现压暗后沿圆环回亮的仪式性推进

对应验证：

- 新增 `frontend/src/tests/canvas/stageDirectorCues.test.ts`
  - 验证 `Choir Vault` 会映射到 `Cathedral Descent`
  - 验证 `Neon Causeway` 会映射到 `Runway Chase`
  - 验证无 setpiece 时返回 `null`
- 更新 `TheorySandbox.test.tsx`
  - 验证右侧出现 `Stage Director Cue`
  - 验证舞台角标出现 `Cue: Cathedral Descent`
  - 验证 cue 文案真实渲染
- 前端整模块测试
  - `67 passed`
- 前端 build
  - 通过

这一轮的价值：

- 现在不同 Growth 分叉不只是“舞台结构不同、灯不同”，连节奏推进和运动调度都不同。
- 这让大型舞台人格更接近真正的演出系统，而不是一组静态视觉皮肤。

## 最新一轮：Stage Projection Script 地面投影层

上一轮把导演调度层接起来之后，舞台的上方和中层已经很明显了，但脚下仍然不够“像一个完整 show”。

目标：

- 让不同路线连地面图样、前景投影和推进方向都完全分家。

实现方式：

- 新增 `frontend/src/visual_engine/stageProjectionScripts.ts`
- 继续以 `getStageSetpiece(...)` 为入口，把 setpiece 映射到不同的 projection script
- `TheorySandbox` 新增 `Stage Projection Script` 面板
- 舞台左上角角标新增 `Projection: ...`
- `RealtimeCanvasRenderer` 新增 `drawStageProjectionScriptLayer(...)`

当前已接入的投影家族：

- `Aisle Lattice`
  - 适用于 `Choir Vault / Aurora Dais / Blue Cloister`
  - 体现礼堂式地网、步道和 choir mark
- `Velvet Bloom`
  - 适用于 `Silken Halo / Rose Arcade / Velvet Arcade`
  - 体现丝绒花窗、花瓣环和拖尾灯带
- `Ember Grid`
  - 适用于 `Forge Throne`
  - 体现锻炉格栅和发烫热区
- `Prism Circuit`
  - 适用于 `Phase Cloister / Prism Vortex`
  - 体现折返回路、相位节点和电路线
- `Velocity Markers`
  - 适用于 `Neon Causeway / Tide Runway`
  - 体现跑道编号、刻度和冲刺箭头
- `Eclipse Seal`
  - 适用于 `Eclipse Altar`
  - 体现封印圆环、辐条和慢速回亮的仪式图样

对应验证：

- 新增 `frontend/src/tests/canvas/stageProjectionScripts.test.ts`
  - 验证 `Choir Vault` 会映射到 `Aisle Lattice`
  - 验证 `Neon Causeway` 会映射到 `Velocity Markers`
  - 验证无 setpiece 时返回 `null`
- 更新 `TheorySandbox.test.tsx`
  - 验证右侧出现 `Stage Projection Script`
  - 验证舞台角标出现 `Projection: Aisle Lattice`
  - 验证 projection 文案真实渲染
- 更新 `realtimeCanvasRenderer.test.ts`
  - 验证 setpiece 驱动的 floor identity 会进入 Canvas 绘制
- 前端整模块测试
  - `71 passed`
- 前端 build
  - 通过

这一轮的价值：

- 现在不同 Growth 分叉不只是“头顶灯不一样、骨架不一样”，连脚下的空间语法都不一样。
- 这让舞台更像完整的演出现场，而不是把所有变化都堆在中心发光体上。

## 最新一轮：Stage Motion Rig 前景动势层

上一轮把地面投影层拆开之后，舞台的远景、中景、脚下都更完整了，但镜头前方还是不够“有机械在运作”。

目标：

- 让不同路线连近景机构、前景幕纱和前冲装置都完全分家。

实现方式：

- 新增 `frontend/src/visual_engine/stageMotionRigs.ts`
- 继续用 `getStageSetpiece(...)` 作为入口，把 setpiece 映射到不同的前景 motion rig
- `TheorySandbox` 新增 `Stage Motion Rig` 面板
- 舞台左上角角标新增 `Motion: ...`
- `RealtimeCanvasRenderer` 新增 `drawStageMotionRigLayer(...)`

当前已接入的动势家族：

- `Choir Crowns`
  - 适用于 `Choir Vault / Aurora Dais / Blue Cloister`
  - 体现拱冠、吊环和礼堂式近景边框
- `Ribbon Veils`
  - 适用于 `Silken Halo / Rose Arcade / Velvet Arcade`
  - 体现贴身幕纱、丝带和柔性近景导光
- `Piston Frames`
  - 适用于 `Forge Throne`
  - 体现锻柱、活塞框和热口挡板
- `Prism Gates`
  - 适用于 `Phase Cloister / Prism Vortex`
  - 体现折返门框、相位门和扫描框
- `Runway Drones`
  - 适用于 `Neon Causeway / Tide Runway`
  - 体现巡航灯点、近景护标和冲刺 drone 轨迹
- `Eclipse Curtains`
  - 适用于 `Eclipse Altar`
  - 体现阴影帘幕、弧形遮挡和祭仪式边框

对应验证：

- 新增 `frontend/src/tests/canvas/stageMotionRigs.test.ts`
  - 验证 `Choir Vault` 会映射到 `Choir Crowns`
  - 验证 `Neon Causeway` 会映射到 `Runway Drones`
  - 验证无 setpiece 时返回 `null`
- 更新 `TheorySandbox.test.tsx`
  - 验证右侧出现 `Stage Motion Rig`
  - 验证舞台角标出现 `Motion: Choir Crowns`
  - 验证 motion rig 文案真实渲染
- 更新 `realtimeCanvasRenderer.test.ts`
  - 验证 setpiece 驱动的近景机构会进入 Canvas 绘制
- 前端整模块测试
  - `75 passed`
- 前端 build
  - 通过

这一轮的价值：

- 现在不同 Growth 分叉不只是“远景和地面不一样”，连靠近镜头的前景机构都不一样。
- 这让舞台更像一整套真正会运作的 show，而不是把差异都留在远处背景里。

## 最新一轮：Stage Takeover 换场接管层

上一轮把前景动势也拆开之后，舞台本身已经更像完整 show 了，但切换的时候仍然有一个问题：很多路线还是共用“统一冲击波”的转场体感。

目标：

- 让不同路线在换场时也走完全不同的接管手势。

实现方式：

- 新增 `frontend/src/visual_engine/stageTakeoverModes.ts`
- 继续用 `getStageSetpiece(...)` 作为入口，把 setpiece 映射到不同的 takeover mode
- `TheorySandbox` 新增 `Stage Takeover` 面板
- 舞台左上角角标新增 `Takeover: ...`
- `RealtimeCanvasRenderer`
  - 扩展 `computeTransitionImpact(...)`
  - 在 `drawTransitionImpact(...)` 里新增 `drawTakeoverTransitionLayer(...)`
  - 根据不同 takeover mode 画不同接管手势

当前已接入的接管家族：

- `Cathedral Iris`
  - 适用于 `Choir Vault / Aurora Dais / Blue Cloister`
  - 体现礼堂开闸、穹顶收束和圆形礼堂波
- `Velvet Drape`
  - 适用于 `Silken Halo / Rose Arcade / Velvet Arcade`
  - 体现双侧幕纱包场和柔性合帘
- `Forge Slam`
  - 适用于 `Forge Throne`
  - 体现上压闸门、热口闪爆和重击式夺权
- `Prism Scanline`
  - 适用于 `Phase Cloister / Prism Vortex`
  - 体现斜向扫描、折返重画和系统重路由
- `Runway Rush`
  - 适用于 `Neon Causeway / Tide Runway`
  - 体现近景追光、跑道冲场和方向重排
- `Eclipse Veil`
  - 适用于 `Eclipse Altar`
  - 体现压暗帘幕、边缘回亮和仪式性遮场

对应验证：

- 新增 `frontend/src/tests/canvas/stageTakeoverModes.test.ts`
  - 验证 `Choir Vault` 会映射到 `Cathedral Iris`
  - 验证 `Neon Causeway` 会映射到 `Runway Rush`
  - 验证无 setpiece 时返回 `null`
- 更新 `TheorySandbox.test.tsx`
  - 验证右侧出现 `Stage Takeover`
  - 验证舞台角标出现 `Takeover: Cathedral Iris`
  - 验证 takeover 文案真实渲染
- 更新 `realtimeCanvasRenderer.test.ts`
  - 验证新舞台人格接管时会触发更强的 transition takeover 绘制
- 前端整模块测试
  - `79 passed`
- 前端 build
  - 通过

这一轮的价值：

- 现在不同 Growth 分叉不只是“舞台长得不一样”，连怎么把旧舞台接管走都不一样。
- 这让切换本身也更像演出，而不是参数变了之后顺手加一圈统一冲击波。

## 最新一轮：后端 Emergent Synergy 系统性交互层

前面几轮把前端舞台层做厚之后，这一轮回到后端，把“乐理 -> 参数”的映射本身再往深处推。

问题：

- 之前后端已经有不少固定组合规则和命名 bonus，但还比较像“命中表”。
- 也就是说，系统能识别 `Lydian + Maj7` 这种固定组合，却还不够会识别“这一堆参数已经长成哪种人格了”。

目标：

- 让后端在固定 combo rule 之外，再根据已经聚合出来的参数族群触发二次加成。

实现方式：

- 在 `backend/app/visual_engine/renderer.py` 新增 `_apply_emergent_synergies(...)`
- 它会在基础 combo、theory synergy、unlock effect 之后运行
- 目前接入 4 类 emergent synergy：

- `Horizon Bloom`
  - 由高开放度 + 高终止牵引 + 高亮度触发
  - 会继续抬高 beam、depth、symmetry、valence、blend
- `Abyss Pressure`
  - 由高 modal tension + 高 grit + 高 gravity 触发
  - 会继续抬高 fracture、grain、contrast、pulse density、arousal
- `Slipstream Pocket`
  - 由高 swing + 高 motion speed + 高 energy 触发
  - 会继续抬高 wave、ripple、motion、pulse、arousal
- `Prism Surge`
  - 由高 complexity + 高 attack + 强 beam + 棱镜/碎裂倾向触发
  - 会继续抬高 lattice、complexity、beam、energy、motion

这一层的意义：

- 后端现在不只会说“你命中了哪条组合公式”，也会说“你已经把参数堆成了哪种人格”，然后顺势把它再往前推一段。
- 这比单纯不断扩固定组合表更接近“参数化映射引擎”的味道。

对应验证：

- 更新 `backend/app/tests/unit/test_visual_engine_components.py`
  - 明亮富三元组合现在要求出现 `Horizon Bloom`
  - 暗压组合要求出现 `Abyss Pressure`
  - 高速推进组合要求出现 `Slipstream Pocket`
  - 高复杂棱镜组合要求出现 `Prism Surge`
- 更新 `backend/app/tests/api/test_sandbox_routes.py`
  - `/sandbox/render` 现在要求把 `Horizon Bloom` 透传出来
- 后端整套测试
  - `92 passed, 1 warning`

注意：

- 这层被我显式限制为至少双元素以上才会触发，避免“单个元素 + 一个解锁”被误判成大型系统性交互。
- 那个 warning 仍然是已有的 `StarletteDeprecationWarning`，不是这轮引入的新问题。

## 最新一轮：Synergy Glyph 协同徽记层

上一轮把 emergent synergy 真正做进后端之后，数据层已经能说出“这堆参数现在像什么人格”，但舞台上还没有对应的视觉符号。

目标：

- 让 `Horizon Bloom / Abyss Pressure / Slipstream Pocket / Prism Surge` 这些系统性交互不只出现在列表里，而是直接长成舞台徽记。

实现方式：

- 新增 `frontend/src/visual_engine/stageSynergyGlyphs.ts`
- 用 `activeSynergies` 作为入口，优先挑 emergent synergy，缺省再回退到 `Cadential Lift / Radiant Voicing`
- `TheorySandbox` 新增 `Synergy Glyph` 面板
- 舞台左上角角标新增 `Glyph: ...`
- `RealtimeCanvasRenderer` 新增 `drawSynergyGlyphLayer(...)`

当前已接入的 glyph 家族：

- `Horizon Bloom`
  - 体现中轴与地平线之间的日冕开叶
- `Abyss Pressure`
  - 体现压缩环、下坠裂口和深井张力
- `Slipstream Pocket`
  - 体现追风 sweep、切线轨迹和推进气流
- `Prism Surge`
  - 体现折线门框、三棱骨架和 surge 扫描
- `Cadence Spine`
  - 作为普通终止协同的回退 glyph
- `Radiant Fan`
  - 作为普通明亮协同的回退 glyph

对应验证：

- 新增 `frontend/src/tests/canvas/stageSynergyGlyphs.test.ts`
  - 验证 `Horizon Bloom` 会优先于 `Cadential Lift`
  - 验证普通协同会回退到 `Cadence Spine`
  - 验证无 synergy 时返回 `null`
- 更新 `TheorySandbox.test.tsx`
  - 验证右侧出现 `Synergy Glyph`
  - 验证舞台角标出现 `Glyph: Horizon Bloom`
  - 验证 glyph 文案真实渲染
- 更新 `realtimeCanvasRenderer.test.ts`
  - 验证 emergent synergy 激活时会进入 Canvas 绘制
- 前端整模块测试
  - `83 passed`
- 前端 build
  - 通过

这一轮的价值：

- 现在后端新长出来的系统性交互，前端不只是“看见一个标签”，而是真的能看到一套舞台徽记。
- 这让“参数化映射引擎”终于更像一个完整闭环，而不是后端很聪明、前端只能显示文本。

## 当前测试结构

### 后端

```text
backend/app/tests/
├── api/
│   ├── test_health.py
│   ├── test_practice_records.py
│   ├── test_progression_routes.py
│   └── test_sandbox_routes.py
└── unit/
    ├── test_database_models.py
    ├── test_exp_service.py
    ├── test_schemas.py
    └── test_visual_engine_components.py
```

### 前端

```text
frontend/src/tests/
├── canvas/
│   ├── realtimeCanvasRenderer.test.ts
│   └── visualEngine.test.ts
├── drag/
│   └── TheorySandboxDrag.test.tsx
├── setup.ts
└── ui/
    └── TheorySandbox.test.tsx
```

## 开发历程

### 1. 项目骨架与第一批红灯测试

提交：

- `2c59faf test(project): add initial structure and failing tests`

测试思路：

- 先创建前后端目录、测试目录和基础配置。
- 后端先测试 EXP 计算，但不实现 `app.services.exp_system`。
- 前端先测试 `mapTheoryToVisuals`，但不实现视觉映射模块。

红灯意义：

- 证明测试不是事后补的，而是先定义目标行为。
- 初始失败点清晰：缺少 EXP 服务和前端视觉映射。

### 2. 数据库模型与数据校验

提交：

- `698b556 test(models): add failing database and schema tests`
- `1810ebe feat(models): implement database models and schemas`

对应中文说明：

- 先添加数据库模型和 Schema 的红灯测试。
- 再实现 SQLAlchemy 模型和 Pydantic 数据结构。

测试思路：

- 用单元测试锁定五张核心表：`users`、`practice_records`、`exp_statistics`、`theory_visual_mapping`、`unlocked_effects`。
- 数据校验测试覆盖用户创建、练习记录创建、沙盘渲染请求的基础校验。

验证重点：

- 表名和字段必须符合计划书。
- 用户与练习记录、经验统计、解锁特效之间的关系必须存在。
- 输入数据必须拒绝空用户名、非正数练习时长、非正数 BPM、空乐理组合。

### 3. EXP 系统

提交：

- `a2f9c10 feat(exp): implement exp calculation service`

测试思路：

- 先测公式：`EXP = T × W_bpm × C`。
- BPM 权重覆盖 `<100`、`100~160`、`>160`。
- 连续签到倍率覆盖 1、3、7、30 天。
- 输入边界覆盖负数、0、闰日连续练习。

验证重点：

- EXP 计算可作为独立服务测试。
- 日期连续性使用 `timedelta(days=1)`，天然支持闰日、跨月、跨年。

### 4. 核心接口路由

提交：

- `673249c test(api): add failing core route tests`
- `a2009a8 feat(api): implement core backend routes`

对应中文说明：

- 先添加核心 API 的红灯测试。
- 再实现练习记录、热力图、技能树、沙盘渲染这些基础接口。

测试思路：

- 先写 `/practice-records`、`/heatmap/yearly`、`/skill-tree`、`/sandbox/render` 的 API 契约测试。
- 红灯阶段这些接口全部返回 404，证明路由尚未实现。
- 实现阶段先返回稳定的最小可用响应，后续再接数据库持久化。

验证重点：

- 创建练习记录会返回 `exp_earned`。
- 缺字段请求返回 422。
- 年度热力图返回 `user_id`、`year`、`days`。
- 技能树返回 Metal、Jazz、Fusion、Neo Soul 四个方向。
- 沙盘渲染能把 Maj7 映射到暖色、发光、柔和几何与 flowing 动画。

### 5. 前端视觉引擎映射

提交：

- `886dec8 feat(visual-engine): implement frontend theory mapping`

对应中文说明：

- 实现前端本地的乐理到视觉参数映射。
- 这样沙盘即使暂时不请求后端，也能实时反馈视觉状态。

测试思路：

- 前端测试直接验证乐理元素到视觉参数的映射。
- Maj7 必须是暖色、高 glow、`soft-orb`、`flowing`。
- Dim7 必须是高粒子密度、`fracture`、`tense`。

验证重点：

- 视觉不是装饰，而是乐理情绪映射。
- 前端沙盘可以在没有后端请求时先进行本地实时反馈。

### 6. 后端视觉引擎模块化

提交：

- `f00e300 test(视觉引擎): 添加模块化组件红灯测试`
- `26913b7 feat(视觉引擎): 拆分后端视觉映射组件`

对应中文说明：

- 先测试视觉引擎应该拆成哪些职责模块。
- 再把原本集中在服务里的视觉逻辑拆成独立模块。

测试思路：

- 将后端视觉逻辑拆成计划书要求的独立模块：

```text
backend/app/visual_engine/
├── animation_controller.py
├── color_mapper.py
├── geometry_generator.py
├── particle_system.py
├── renderer.py
├── tension_analyzer.py
└── types.py
```

验证重点：

- `tension_analyzer` 负责张力等级。
- `color_mapper` 负责情绪色彩。
- `particle_system` 负责粒子密度和解锁效果。
- `geometry_generator` 负责几何形态。
- `animation_controller` 负责动画状态。
- `renderer` 组合各模块输出 API 所需的视觉参数。

### 7. 画布实时渲染器生命周期

提交：

- `2a7acab test(画布): 添加实时渲染器生命周期红灯测试`
- `b9d20eb feat(画布): 实现实时渲染器生命周期管理`

对应中文说明：

- 先测试 Canvas 渲染器的启动、绘制、停止和尺寸适配。
- 再实现可复用的实时渲染器。

测试思路：

- 不急着测试复杂绘制效果，先测试实时渲染最容易出问题的生命周期：
  - `requestAnimationFrame` 启动
  - 每帧绘制
  - `cancelAnimationFrame` 清理
  - Canvas 内部绘制尺寸随设备像素比调整

验证重点：

- renderer 能启动、停止、释放 frame handle。
- resize 后 `canvas.width/height` 与 CSS 尺寸分离，保留高清绘制能力。
- 测试环境 mock Canvas API，避免 JSDOM 缺少真实 Canvas 导致 UI 测试误报。

### 8. 乐理视觉沙盘首屏

提交：

- `0467600 test(界面): 添加沙盘首屏红灯测试`
- `70dbbc9 feat(界面): 实现乐理视觉沙盘首屏`

对应中文说明：

- 先测试用户进入页面后应该看到什么。
- 再实现真正的沙盘首屏，而不是做一个后台管理或介绍页。

测试思路：

- UI 测试不检查“后台页面”，而是验证用户进入后看到的是沙盘体验：
  - 标题 `Scales & Chroma`
  - 乐理元素库
  - Canvas 舞台
  - 视觉状态读数
  - 点击 Dim7 后视觉状态变成 `fracture / tense`

验证重点：

- 首屏直接是工具，不是营销页或 Admin Dashboard。
- Canvas 舞台是真实组件，不是静态背景图。
- 页面通过 `npm run build` 生产构建验证。
- 浏览器实测确认页面可打开、Canvas 可见、状态读数可更新。

### 9. Growth Imprint 独立风格层

这一轮新增的重点不是“再加一点 glow”，而是把 Growth 从原来偏附属的数值增幅，拆成独立可感知的舞台层。

这次测试思路分三层：

1. 后端契约测试

- 在 `render_visual_parameters(...)` 的单元测试里，直接要求 `neo-soul-veil`、`fusion-phase` 这类成长印记字段出现。
- API 测试要求 `/sandbox/render` 返回 `growth_imprint` 与 `growth_imprint_intensity`，避免前端只能靠猜。

2. 前端契约与渲染测试

- `sandboxApi` 测试负责把后端的 `growth_imprint` / `growth_imprint_intensity` 正确归一化到前端类型。
- Canvas renderer 测试要求在高强度成长印记下，仍然会发生独立绘制，不会只剩普通场景层。
- UI 测试要求右侧真的出现 `Growth Imprint` 面板，并能读到像 `Neo Soul 幕纱` 这样的中文结果。

3. 浏览器烟测

- 这次把 `scripts/visual-smoke.mjs` 扩成全链路脚本：
- 注册临时用户
- 提交 240 分钟 `neo soul maj7 groove` 练习
- 等待 `Unlocked velvet_glow`
- 拖入 `Dorian + Maj7`，确认出现 `Growth Imprint` 和 `Neo Soul 幕纱`
- 再切到 `Lydian + Maj7` 与 `Harmonic Minor + Dim7`
- 最后确认舞台仍能在 `日光穹庭` 和 `影纹祭坛` 之间切换，同时 `Valence` 明显从 `1.00` 降到 `0.27`

这部分的意义是：

- 证明 Growth 已经不是后台数值，而是真会改写前端舞台人格。
- 证明“成长风格”和“乐理组合”现在是两层叠加关系，而不是其中一层把另一层盖掉。

### 10. 乐理特征轴与参数化叠层

为了继续推进“不是只换颜色”的目标，这一轮又加了一层更靠近乐理结构的参数：

- `Openness`：开放度
- `Attack`：起音攻击性
- `Swing`：摆动感
- `Gravity`：终止牵引力

测试设计思路：

1. 后端单元测试

- 直接要求 `Lydian + Maj7` 这类明亮开放组合具备更高 `openness`、更低 `gravity`。
- 直接要求 `Harmonic Minor + Dim7` 这类高张力组合具备更高 `attack` 与 `gravity`，更低 `openness`。
- 用 Metal 解锁测试确认成长风格不只改场景，还会把 `attack` 真的推高。

2. 前端契约测试

- `sandboxApi` 新增四个字段的归一化断言。
- `mapTheoryToVisuals` 本地兜底映射也要返回这四个特征，避免离线或未鉴权场景下退化。
- UI 测试要求右侧真实出现 `Harmonic Traits` 面板，而不是只加几个隐藏字段。

3. 浏览器烟测

- 在现有 Growth 烟测链路中新增 `Harmonic Traits` 可见性确认。
- 这样可以证明：这四条新轴不是只在测试里出现，而是已经真正出现在用户能看到的界面上。

### 11. 系统性协同层

这一轮继续往“不是死记组合名”的方向推进，把协同拆成了 4 条新轴：

- `Resonance`
- `Cadence Pull`
- `Modal Tension`
- `Blend Cohesion`

设计目的：

- 让 `调式 + 和弦 + 进行` 的关系不只体现在一个签名字符串里。
- 让系统可以同时表达“这组东西是不是彼此顺手”“有没有明显终止感”“摩擦有多强”“颜色和空间是否真正融合”。

测试设计：

1. 后端单元测试

- 要求 `II-V-I + Maj7 + Lydian` 这类组合不只亮，而且要有更高的 `synergy_resonance` 与 `cadence_pull`。
- 要求 `Harmonic Minor + Dim7` 这类组合要有更高的 `modal_tension`。
- 要求 `Melodic Minor + Dominant7` 这类现代混合组合具备更高的 `blend_cohesion`。

2. 前端契约测试

- `sandboxApi` 必须正确映射 4 条新轴和 `active_synergies`。
- `TheorySandbox` 必须真实渲染 `Theory Synergy` 面板，并出现协同标签，例如 `Cadential Lift`。
- Canvas renderer 测试要求在高协同状态下继续发生额外绘制，保证协同不是只写在面板上。

3. 浏览器烟测

- 烟测脚本现在会同时确认：
- `Growth Imprint`
- `Harmonic Traits`
- `Theory Synergy`

这一步的意义是：

- 新协同层已经不仅能算出来，而且已经变成用户可见、可讲解、可答辩展示的系统。

### 9. 乐理积木拖拽编排

提交：

- `7765826 test(拖拽): 添加乐理积木编排红灯测试`
- `0ac1325 feat(拖拽): 实现乐理积木编排轨道`

测试思路：

- 将“点击选择”推进到“音乐积木编排”。
- 测试从元素库拖入编排轨道。
- 测试轨道内积木删除。
- 测试相邻重复同一乐理元素时出现非法组合提示。

验证重点：

- 编排轨道具备 `aria-label="乐理编排轨道"`。
- 拖入 Dorian 后，轨道显示 Dorian，并驱动视觉状态到 `wave`。
- 删除最后一个积木后，轨道恢复空状态文案。
- 连续拖入两次 Dim7 会提示：`相邻位置不能重复同一个乐理积木`。

### 10. 轨道内积木重排

提交：

- `6364505 test(拖拽): 添加轨道内重排红灯测试`
- `556fbd5 feat(拖拽): 实现轨道内积木重排`

测试思路：

- 编排系统必须支持排列和调整顺序，所以新增轨道内重排测试。
- 先拖入 Dorian，再拖入 Dim7。
- 将 Dim7 拖到 Dorian 前面，断言轨道文本顺序变为 `Dim7 ... Dorian`。

验证重点：

- 轨道积木具备 `aria-label="移动 xxx"` 的可访问拖拽语义。
- 拖拽载荷使用 `lane:<index>`，实现轨道内移动。
- 重排后最后一个元素变化，视觉读数也随之变化。

## 当前验证命令

### 后端

```bash
cd backend
python -m pytest
```

当前结果：

```text
81 passed，1 个 FastAPI/Starlette 测试客户端弃用 warning
```

### 前端测试

```bash
cd frontend
npm test
```

当前结果：

```text
51 passed，仍有 1 个 React act(...) 测试提示
```

### 前端生产构建

```bash
cd frontend
npm run build
```

当前结果：

```text
Vite 构建通过
```

### 浏览器烟测

当前结果：

```text
已验证登录会话恢复、Growth 解锁后的舞台签名切换、中文特效说明展示，以及 Temperature / Symmetry / Depth / Pulse 新读数与 Stage Reading 文案同步刷新。
```

## 当前覆盖能力

已覆盖：

- 数据库表结构与关系
- Pydantic 输入校验
- EXP 计算、BPM 权重、连续签到倍率、闰日连续性
- 核心 API 契约
- 前后端视觉映射
- 后端 visual_engine 模块职责
- Canvas renderer 启停、绘制、清理、resize
- 沙盘首屏 UI
- 乐理积木拖入、删除、非法重复提示
- 轨道内积木重排
- 组合签名库与 Growth 风格 aura 的返回
- 舞台参数新增的温度、对称性、空间深度、脉冲密度
- 中文 bonus 说明与特效说明渲染

尚未覆盖或后续要增强：

- 数据库真实持久化集成测试
- `/practice-records` 与用户经验统计的联动更新
- 热力图真实数据聚合
- 技能树解锁规则
- Canvas 高频刷新性能测试
- Canvas 卸载后的内存泄漏测试
- 移动端响应式截图测试
- 更完整的非法和弦/调式组合规则
- 视觉解锁系统与练习时长的联动测试

## 最近一次视觉升级的测试思路

这次大升级不是单纯“把 Canvas 画得更花”，而是验证一条新的参数链路是否成立：

1. 乐理模块和组合是否真的生成了更多可区分参数。
2. Growth 解锁是否真的改变了舞台风格，而不只是数值轻微波动。
3. 新参数是否能穿过 API、前端 service、React 状态、Canvas renderer 这一整条路径。

这次测试重点因此分成三层：

- 后端单元测试：
  验证 `Celestial Bloom`、`Chrome Meridian`、`Metal Shrapnel`、`Velvet Tide`、`Fusion Prism` 这些签名除了名字变化，还会拉动 `symmetry / depth / pulse_density` 等关键参数。
- 前端映射测试：
  验证本地兜底 `mapTheoryToVisuals` 也能生成相同方向的参数变化，避免后端异常时舞台退化太严重。
- UI 与浏览器烟测：
  验证右侧新读数能显示，`Active Bonuses` 文案能解释来源，登录后的真实用户数据能把舞台签名切到 `Velvet Tide`。

## 本轮继续深化后的测试补充

这轮不是单纯再加几个签名名词，而是把“视觉差异为什么成立”继续往前推了一层：

1. 给视觉引擎补上 `valence / arousal / luminosity / grit` 四条情绪轴。
2. 让组合加成和 Growth 风格不只改颜色，还会改情绪轴。
3. 让 Canvas 根据这些轴去改变氛围层、光幕、粗粝度和整体场景家族。

因此，这轮测试重点改成了下面三件事：

- 参数层：
  验证新的情绪轴字段会从后端返回，并能被前端类型、service 和本地兜底映射同时接住。
- 视觉层：
  验证 `Celestial Bloom`、`Occult Fracture` 这类组合不只是名字不同，而是真的把舞台推向 `日光穹庭`、`影纹祭坛` 这类不同 scene family。
- 体验层：
  验证 `Stage Reading` 被上移后，用户在首屏就能看到“这个舞台在表达什么”，不需要先往下翻一长段参数。

### 本轮烟测脚本

新增：

```text
scripts/visual-smoke.mjs
```

它会真实执行下面这条链路：

1. 打开单端口服务。
2. 注册一个临时用户。
3. 进入沙盘后拖入 `Lydian + Maj7`，截图验证 `日光穹庭`。
4. 清空轨道后拖入 `Harmonic Minor + Dim7`，截图验证 `影纹祭坛`。

这类脚本的意义不只是“多一份自动化”，而是让答辩时可以很清楚地讲：

- 我们不只测 API 返回值。
- 我们也测“真实用户操作后，舞台是否真的变了样子”。

补充结果：

- 在前端直连最新后端的烟测里，`Celestial Bloom / 日光穹庭` 的 `Valence` 读数到了 `0.95`。
- 同一账号切到 `Occult Fracture / 影纹祭坛` 后，`Valence` 读数降到 `0.03`，同时 `Arousal` 被推到 `0.95`。

这说明这轮新增的情绪轴已经真正穿过：

```text
后端 visual_engine -> /sandbox/render -> 前端 service -> React 状态 -> 右侧 Mood Axes 面板
```

而不是停留在单元测试或本地兜底映射里。

## 经验总结

目前测试策略的核心收益是：每次功能推进都有一对清晰的红灯和绿灯提交。这样 Git 历史不仅记录“写了什么代码”，也记录“为什么要写这些代码”。对于 Scales & Chroma 这种重交互、重体验、后续会不断扩展视觉能力的项目，这比一次性堆功能更安全，也更容易回溯设计意图。
