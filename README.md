# Scales & Chroma

Scales & Chroma 是一个“乐理视觉化沙盘 + 游戏化成长系统”。它不是后台管理或普通打卡工具，而是把音阶、调式、和弦、张力与练习成长转成可交互的视觉反馈。

## 当前状态

项目已经完成可运行的前后端基础闭环：

- 乐理元素库、拖拽编排轨道、Canvas 实时视觉舞台。
- 中央工作台已固定在视口内，舞台本身也可以直接接住拖拽，不需要再把方块艰难拖到页面很下方的小区域。
- 视觉引擎已升级为“参数化映射 + 组合加成 + Growth 风格放大”的结构，不再只是单个乐理块映射单一颜色。
- 视觉参数已继续拆分为主色、辅色、背景色、张力、复杂度、运动速度、波纹、光束、颗粒密度，以及 `temperature / symmetry / depth / pulse density` 等舞台级参数。
- 当前又补上了 `valence / arousal / luminosity / grit` 四条情绪轴，让乐理组合先汇总成情绪结构，再驱动舞台建筑、氛围层和粒子性格。
- 现在又把 Growth 拆成了独立的 `Growth Imprint` 层。也就是说，乐理组合决定“主舞台是什么”，成长方向再决定“这座舞台被什么人格重新覆盖”，两者会叠加，而不是互相替代。
- 这轮又新增了 4 条更贴近乐理结构的特征轴：`openness / attack / swing / gravity`。它们分别对应开放度、起音攻击性、律动摆动感、终止牵引力，并直接驱动舞台扇面、尖峰、摆动线和下拉锚线。
- 这轮继续把固定命名组合扩展成“系统性协同层”，新增 `synergy resonance / cadence pull / modal tension / blend cohesion` 四条协同轴，让不同类型模块之间的共振、终止感、摩擦和融合度也能被单独计算。
- 组合签名库已扩充到多组和声/调式搭配，Growth 解锁也会形成更明显的风格家族 aura。
- 舞台现在会明确落入 `日光穹庭 / 丝绒厅堂 / 金属熔炉 / 和声教堂 / 棱镜阵列 / 夜潮剧场 / 霓虹网格 / 影纹祭坛` 这类场景家族，而不只是“同一舞台换颜色”。
- 右侧新增 `Mood Axes` 条带面板，能直接看到不同组合在明暗情绪、唤醒度、发光空间、粗粝度上的差异。
- 右侧又新增 `Growth Imprint` 面板，会直接解释当前成长风格是 `Neo Soul 幕纱 / Metal Forge / Jazz Lattice / Fusion Phase / Pentatonic Drive` 中的哪一种，以及它对舞台的偏移强度。
- 右侧也新增了 `Harmonic Traits` 面板，用户可以直接看见当前组合在开放度、攻击性、摆动感、牵引力上的分布。
- 右侧再新增 `Theory Synergy` 面板，会直接展示当前组合的 `Resonance / Cadence Pull / Modal Tension / Blend Cohesion`，并列出已触发的协同标签。
- 现在又新增了 `Growth Lens Preview` 预览镜头。用户可以不落库地切到 `Jazz / Neo Soul / Metal / Fusion / Pentatonic` 这些成长视角，直接查看“同一组乐理积木在不同成长路线下会被改写成什么样”。
- 这轮继续把大型舞台人格做成了独立 `Stage Setpiece` 层。像 `Choir Vault / Silken Halo / Forge Throne / Phase Cloister / Neon Causeway` 这些不再只是 bonus 名字，而会同时驱动中间舞台的额外装置骨架和右侧的专门解读。
- 现在 `Stage Setpiece` 又继续长出独立的灯光 cue 层，不同大型装置会有不同的下压光柱、侧洗幕光、熔炉硬光、棱镜扫描和跑道边灯，不再只是换一套线框。
- 这轮再补了一层 `Stage Director Cue`。现在大型装置不只是“搭好骨架、打上灯”，还会再带一套导演式的节奏推进与运动调度，例如 `Cathedral Descent / Silk Breath / Forge Hammer / Prism Scan / Runway Chase / Altar Eclipse`，让不同 Growth 路线更像不同 show director 在接管现场。
- 这一轮又把地面和前景投影彻底拆开成 `Stage Projection Script`。现在不同路线不只是上方骨架和灯光不同，连脚下都会长出 `Aisle Lattice / Velvet Bloom / Ember Grid / Prism Circuit / Velocity Markers / Eclipse Seal` 这类完全不同的投影语言。
- 这一轮继续把近景机械和幕纱动作拆成 `Stage Motion Rig`。现在不同路线连镜头前方的前景机构都不同，会长出 `Choir Crowns / Ribbon Veils / Piston Frames / Prism Gates / Runway Drones / Eclipse Curtains` 这些完全不同的近景动势装置。
- 这一轮又把“换场怎么接管”拆成了 `Stage Takeover`。现在不同路线在切换时会走完全不同的 takeover 手势，比如 `Cathedral Iris / Velvet Drape / Forge Slam / Prism Scanline / Runway Rush / Eclipse Veil`，不再共用一套统一冲击波。
- 后端这轮也继续把“参数化映射”往里推了一层：现在不只是固定组合名会加成，某些参数族群本身也会触发系统性交互，例如 `Horizon Bloom / Abyss Pressure / Slipstream Pocket / Prism Surge`，让明亮终止、暗色压迫、速度推进、复杂棱镜这些性格能自己长出来。
- 这一轮继续把这些系统性交互放大成 `Synergy Glyph`。也就是说，后端刚算出来的 `Horizon Bloom / Abyss Pressure / Slipstream Pocket / Prism Surge` 不再只是列表项，而会在舞台上长出自己的徽记结构。
- FastAPI 后端、SQLAlchemy 模型、SQLite 开发数据库。
- 最基础认证、登录注册、Bearer Token 会话恢复、用户数据隔离。
- EXP、连续签到、等级、技能树、年度热力图。
- 练习记录创建、历史读取、主题/日期筛选。
- 用户永久解锁视觉特效，并明显改变沙盘舞台的几何重心、波纹、光束、粒子和氛围签名。
- 前端右侧已提供可读的 `Active Bonuses` 说明和中文特效解释，方便理解当前舞台为什么会这样变化。
- 前端右侧新增 `Stage Reading`，会直接把当前舞台的情绪、空间、运动和主要来源翻译成可读中文。
- `Stage Reading` 已上移到右侧更靠前的位置，首次进入时更容易直接看懂当前舞台在表达什么。
- 沙盘组合保存、命名、自定义覆盖、删除与读取。
- 后端可以直接托管前端构建产物，支持单进程、单端口访问。
- TDD 流程下的后端和前端自动化测试。

## 当前范围约定

- 成长系统已经可用，后续只保持核心闭环，不优先继续做复杂优化。
- 认证与用户体系采用最基础方案：支持注册、登录、用户隔离；注册不需要验证码；密码阶段性不做加密，优先保证“每个用户只能访问自己的数据”。
- 部署阶段暂不考虑域名，默认按 `服务器 IP + 端口` 的方式访问。
- 数据库最终保持轻量化方案，继续以 SQLite 为主，不以 PostgreSQL 为目标。
- 错误监控只做基础能力，例如应用日志、接口错误记录、健康检查，不追求复杂监控平台。
- API 边界处理和异常场景会继续写进测试规划，作为答辩时的测试设计依据。

## 技术栈

- Frontend：React、TypeScript、Vite、TailwindCSS、HTML5 Canvas。
- Backend：Python、FastAPI、SQLAlchemy、Pydantic。
- Database：SQLite，作为开发与轻量部署的目标方案。
- Tests：pytest、Vitest、Testing Library、jsdom。

## 项目结构

```text
backend/
  app/
    api/
    core/
    models/
    schemas/
    services/
    tests/
      unit/
      integration/
      api/
    visual_engine/
    main.py
frontend/
  src/
    canvas/
    pages/
    services/
    tests/
      api/
      canvas/
      drag/
      ui/
    types/
    visual_engine/
项目进度.md
```

## 启动方式

后端：

```bash
cd backend
python -m uvicorn app.main:app --reload
```

前端：

```bash
cd frontend
npm install
npm run dev
```

默认前端开发地址通常是 `http://localhost:5173/`。

## 单端口上线方式

如果准备直接部署到服务器并通过 `IP + 端口` 访问，当前推荐走这一套：

```bash
cd frontend
npm install
npm run build

cd ../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

完成后直接访问：

```text
http://<服务器IP>:8000/
```

说明：

- 后端会自动托管 `frontend/dist`。
- 前端在这种模式下会自动使用同源后端接口，不需要额外配置 `VITE_API_BASE_URL`。
- SQLite 仍然作为当前默认数据库。
- 旧 SQLite 如果缺少 `users.password` 字段，后端启动时会自动做轻量补齐。

也可以直接用脚本：

```bash
./scripts/run_single_port.sh
```

如果需要指定监听端口：

```bash
HOST=0.0.0.0 PORT=9000 ./scripts/run_single_port.sh
```

## 核心 API

- `POST /auth/register`：注册并立即返回会话 token。
- `POST /auth/login`：登录并返回会话 token。
- `GET /auth/me`：读取当前登录用户信息。
- `POST /auth/logout`：注销当前 token。
- `POST /practice-records`：创建练习记录，返回 EXP、等级、连续签到和新解锁特效。
- `GET /practice-records`：读取当前用户练习历史，支持 `limit`、`topic`、`date_from`、`date_to`。
- `GET /heatmap/yearly`：读取年度热力图。
- `GET /skill-tree`：读取技能树进度，节点等级按累计练习分钟数计算。
- `GET /unlocked-effects`：读取用户永久解锁的视觉能力。
- `POST /sandbox/render`：根据乐理组合、组合加成和用户解锁状态返回视觉参数；同时支持 `preview_growth_imprint` 做不落库的成长预览。
- `POST /compositions`：保存当前用户沙盘组合。
- `GET /compositions`：读取当前用户保存的沙盘组合。
- `PUT /compositions/{composition_id}`：覆盖更新当前用户的已保存组合。
- `DELETE /compositions/{composition_id}`：删除当前用户的已保存组合。

## 测试方式

后端：

```bash
cd backend
python -m pytest
```

前端：

```bash
cd frontend
npm test
npm run build
```

浏览器烟测脚本：

```bash
npx -y -p playwright@1.55.0 sh -lc 'ROOT=$(dirname "$(dirname "$(which playwright)")"); node ./scripts/visual-smoke.mjs "$ROOT"'
```

最近完整验证结果：

- 后端：89 passed，1 个 FastAPI/Starlette 测试客户端弃用 warning。
- 前端：60 passed，仍有 1 个 React `act(...)` 测试提示，不影响当前功能。
- 前端：64 passed，仍有 1 个 React `act(...)` 测试提示，不影响当前功能。
- 前端 build：通过。
- 浏览器烟测：已验证最新服务下的登录会话恢复、Growth 解锁后 `Unlocked Effects` 与 `Growth` 面板刷新、舞台签名切换到 `Velvet Tide`，并显示新的 `Temperature / Symmetry / Depth / Pulse` 读数；同时已确认保存组合后的删除按钮真实可见且可用，并且 `Stage Reading` 会输出当前舞台的中文解读。
- 最新一轮 Playwright 烟测已真实把舞台从 `Celestial Bloom / 日光穹庭` 切到 `Occult Fracture / 影纹祭坛`，确认场景家族、组合签名和右侧解读会一起变化。
- 进一步烟测已验证 `Valence` 会从 `0.95` 明确跌到 `0.03`，说明情绪轴不是静态文案，而是真正从后端走到前端展示。
- 最新烟测脚本还会真实做一次 `Neo Soul Maj7` 解锁，确认 `Growth Imprint` 面板出现、`Neo Soul 幕纱` 文案可见，并且舞台仍能继续切换到 `日光穹庭` 与 `影纹祭坛` 两个极端场景。
- 最新烟测还会确认 `Harmonic Traits` 面板真实出现，说明新特征轴已经贯穿 API、前端和浏览器层，而不是只停留在内部参数里。
- 最新烟测还会确认 `Theory Synergy` 面板真实出现，说明系统性协同层已经真实穿透到浏览器界面。
- 最新这一轮自动化验证还确认 `Growth Lens Preview` 可以在不改动用户真实解锁数据的前提下，向 `/sandbox/render` 发送 `preview_growth_imprint`，并驱动页面切到新的成长印记视角。
- 最新这一轮前端验证还确认 `Stage Setpiece` 会在具有大型分叉舞台人格时真实出现，并把 `Choir Vault` 这类 setpiece 同时显示在舞台角标和右侧说明里。
- 最新这一轮前端验证还确认 `Stage Setpiece` 会附带独立“灯光调度”说明，说明大型装置和光场已经被当成一整套 show cue 在驱动。
- 最新这一轮前端验证还确认 `Stage Director Cue` 会同时出现在舞台角标和右侧说明里，并随 `Choir Vault / Neon Causeway` 这类大型人格切换成不同的节奏调度语言。
- 最新这一轮前端验证还确认 `Stage Projection Script` 会同时出现在舞台角标和右侧说明里，并把礼堂地网、丝绒花窗、熔炉热格、棱镜电路、跑道刻线这些投影图样真实接到舞台上。
- 最新这一轮前端验证还确认 `Stage Motion Rig` 会同时出现在舞台角标和右侧说明里，并把拱冠、幕纱、活塞框、棱镜门、巡航灯点、阴影帘幕这些近景机构真实接进舞台。
- 最新这一轮前端验证还确认 `Stage Takeover` 会同时出现在舞台角标和右侧说明里，并把礼堂开闸、幕纱包场、熔炉重击、棱镜扫描、跑道冲场、祭坛压暗这些接管方式真实接进换场过程。
- 最新这一轮后端验证还确认这些系统性交互会真实进入 `/sandbox/render` 的输出，而不是只停留在前端解释层。
- 最新这一轮前端验证还确认 `Synergy Glyph` 会同时出现在舞台角标和右侧说明里，并把日冕绽放、深井压缩、追风轨迹、棱镜 surge 这些协同人格真实接进舞台。
- API 边界测试会继续补充在测试规划文档中，覆盖非法参数、越权访问、空数据、异常日期和错误状态响应。

## TDD 与 Git 工作流

项目按 TDD 推进：

1. 先写失败测试。
2. commit + push 红灯测试。
3. 实现功能。
4. 跑目标测试和必要的完整测试。
5. commit + push 实现。

commit 信息可以使用中文，例如：

- `test(解锁): 添加多风格视觉奖励红灯测试`
- `feat(解锁): 支持多风格视觉奖励`
- `docs(进度): 整理当前功能与后续计划`
