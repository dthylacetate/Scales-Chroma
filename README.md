# Scales & Chroma

Scales & Chroma is a music-theory visual sandbox with a gamified practice loop. It turns scales, modes, chords, tension, and practice growth into interactive visual feedback rather than a CRUD-style tracking app.

## Current Phase

Phase 1 starts with:

- Project directory structure
- Database ER design
- Test foundation
- First failing tests for TDD

## Architecture

- `frontend/`: React, TypeScript, Vite, TailwindCSS, Canvas renderer, visual sandbox UI
- `backend/`: FastAPI, SQLAlchemy, Pydantic, EXP system, API routes
- `docs/`: architecture notes and ER diagrams

## Project Structure

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
      performance/
      edge_cases/
    utils/
    main.py
frontend/
  src/
    components/
    pages/
    hooks/
    services/
    store/
    canvas/
    visual_engine/
    tests/
      drag/
      canvas/
      ui/
      hooks/
      responsiveness/
    utils/
    types/
docs/
  er-design.md
```

## Test Workflow

This project follows TDD:

1. Add a failing test.
2. Commit and push the test.
3. Implement the smallest feature that passes.
4. Refactor after green tests.

## Backend Tests

```bash
cd backend
python -m pytest
```

## Frontend Tests

```bash
cd frontend
npm install
npm test
```

## Git Workflow

All changes should be committed in small, traceable steps using:

```text
type(scope): message
```

Examples:

- `test(exp): add failing exp calculation tests`
- `feat(exp): implement exp calculation service`
- `docs(er): add initial database design`
