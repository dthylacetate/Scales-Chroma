# Testing Strategy

Scales & Chroma uses TDD for core logic and interaction behavior.

## Backend

Backend tests live in `backend/app/tests/`.

- `unit/`: deterministic logic such as EXP and streak calculations
- `integration/`: database and service integration
- `api/`: FastAPI route behavior
- `performance/`: high-volume and concurrency checks
- `edge_cases/`: invalid dates, extreme BPM, leap years, and boundary behavior

## Frontend

Frontend tests live in `frontend/src/tests/`.

- `drag/`: sandbox drag, reorder, replace, and invalid joins
- `canvas/`: visual engine and renderer behavior
- `ui/`: component-level behavior
- `hooks/`: stateful React logic
- `responsiveness/`: viewport coverage and overlap checks

## First Red Tests

The initial failing tests define the first implementation targets:

- `backend/app/tests/unit/test_exp_service.py`
- `frontend/src/tests/canvas/visualEngine.test.ts`

They intentionally import modules that do not exist yet. The next implementation step should make these tests pass without weakening the assertions.
