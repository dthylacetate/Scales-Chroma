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

## 经验总结

目前测试策略的核心收益是：每次功能推进都有一对清晰的红灯和绿灯提交。这样 Git 历史不仅记录“写了什么代码”，也记录“为什么要写这些代码”。对于 Scales & Chroma 这种重交互、重体验、后续会不断扩展视觉能力的项目，这比一次性堆功能更安全，也更容易回溯设计意图。
