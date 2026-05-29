# Scales & Chroma

Scales & Chroma 是一个“乐理视觉化沙盘 + 游戏化成长系统”。它不是后台管理或普通打卡工具，而是把音阶、调式、和弦、张力与练习成长转成可交互的视觉反馈。

## 当前状态

项目已经完成可运行的前后端基础闭环：

- 乐理元素库、拖拽编排轨道、Canvas 实时视觉舞台。
- FastAPI 后端、SQLAlchemy 模型、SQLite 开发数据库。
- EXP、连续签到、等级、技能树、年度热力图。
- 练习记录创建、历史读取、主题/日期筛选。
- 用户永久解锁视觉特效，并影响沙盘渲染参数。
- 沙盘组合保存与读取。
- TDD 流程下的后端和前端自动化测试。

## 技术栈

- Frontend：React、TypeScript、Vite、TailwindCSS、HTML5 Canvas。
- Backend：Python、FastAPI、SQLAlchemy、Pydantic。
- Database：SQLite 开发环境，后续可扩展 PostgreSQL。
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

- `POST /practice-records`：创建练习记录，返回 EXP、等级、连续签到和新解锁特效。
- `GET /practice-records`：读取练习历史，支持 `user_id`、`limit`、`topic`、`date_from`、`date_to`。
- `GET /heatmap/yearly`：读取年度热力图。
- `GET /skill-tree`：读取技能树进度，节点等级按累计练习分钟数计算。
- `GET /unlocked-effects`：读取用户永久解锁的视觉能力。
- `POST /sandbox/render`：根据乐理组合和用户解锁状态返回视觉参数。
- `POST /compositions`：保存沙盘组合。
- `GET /compositions`：读取用户保存的沙盘组合。

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

- 后端：64 passed，1 个 FastAPI/Starlette 测试客户端弃用 warning。
- 前端：36 passed，仍有 1 个 React `act(...)` 测试提示，不影响当前功能。
- 前端 build：通过。

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
