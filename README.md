# Scales & Chroma

Scales & Chroma 是一个“乐理视觉化沙盘 + 游戏化成长系统”。它不是后台管理或普通打卡工具，而是把音阶、调式、和弦、张力与练习成长转成可交互的视觉反馈。

## 当前状态

项目已经完成可运行的前后端基础闭环：

- 乐理元素库、拖拽编排轨道、Canvas 实时视觉舞台。
- 中央工作台已固定在视口内，舞台本身也可以直接接住拖拽，不需要再把方块艰难拖到页面很下方的小区域。
- 视觉引擎已升级为“参数化映射 + 组合加成 + Growth 风格放大”的结构，不再只是单个乐理块映射单一颜色。
- 视觉参数已继续拆分为主色、辅色、背景色、张力、复杂度、运动速度、波纹、光束、颗粒密度，以及 `temperature / symmetry / depth / pulse density` 等舞台级参数。
- 组合签名库已扩充到多组和声/调式搭配，Growth 解锁也会形成更明显的风格家族 aura。
- FastAPI 后端、SQLAlchemy 模型、SQLite 开发数据库。
- 最基础认证、登录注册、Bearer Token 会话恢复、用户数据隔离。
- EXP、连续签到、等级、技能树、年度热力图。
- 练习记录创建、历史读取、主题/日期筛选。
- 用户永久解锁视觉特效，并明显改变沙盘舞台的几何重心、波纹、光束、粒子和氛围签名。
- 前端右侧已提供可读的 `Active Bonuses` 说明和中文特效解释，方便理解当前舞台为什么会这样变化。
- 沙盘组合保存、命名、自定义覆盖与读取。
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
- `POST /sandbox/render`：根据乐理组合、组合加成和用户解锁状态返回视觉参数。
- `POST /compositions`：保存当前用户沙盘组合。
- `GET /compositions`：读取当前用户保存的沙盘组合。

仍待补充：

- 组合删除或归档接口。

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

最近完整验证结果：

- 后端：79 passed，1 个 FastAPI/Starlette 测试客户端弃用 warning。
- 前端：48 passed，仍有 1 个 React `act(...)` 测试提示，不影响当前功能。
- 前端 build：通过。
- 浏览器烟测：已验证最新服务下的登录会话恢复、Growth 解锁后 `Unlocked Effects` 与 `Growth` 面板刷新、舞台签名切换到 `Velvet Tide`，并显示新的 `Temperature / Symmetry / Depth / Pulse` 读数与对应风格说明。
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
