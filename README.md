# Scales & Chroma

Scales & Chroma 是一个“乐理视觉化沙盘 + 游戏化成长系统”。它不是后台管理或普通打卡工具，而是把音阶、调式、和弦、张力与练习成长转成可交互的视觉反馈。

## 当前状态

项目已经完成可运行的前后端基础闭环：

- 乐理元素库、拖拽编排轨道、Canvas 实时视觉舞台。
- FastAPI 后端、SQLAlchemy 模型、SQLite 开发数据库。
- 最基础认证、登录注册、Bearer Token 会话恢复、用户数据隔离。
- EXP、连续签到、等级、技能树、年度热力图。
- 练习记录创建、历史读取、主题/日期筛选。
- 用户永久解锁视觉特效，并影响沙盘渲染参数。
- 沙盘组合保存、命名、自定义覆盖与读取。
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
docs/
  er-design.md
  testing-strategy.md
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
- `POST /sandbox/render`：根据乐理组合和用户解锁状态返回视觉参数。
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

- 后端：72 passed，1 个 FastAPI/Starlette 测试客户端弃用 warning。
- 前端：43 passed，仍有 1 个 React `act(...)` 测试提示，不影响当前功能。
- 前端 build：通过。
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
