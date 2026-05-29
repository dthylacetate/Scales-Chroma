from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.compositions import router as compositions_router
from app.api.practice_records import router as practice_records_router
from app.api.progression import router as progression_router
from app.api.sandbox import router as sandbox_router
from app.core.database import init_database


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_database()
    yield


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FRONTEND_DIST_DIR = REPO_ROOT / "frontend" / "dist"


def create_app(frontend_dist_dir: Path | None = None) -> FastAPI:
    app = FastAPI(title="Scales & Chroma API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[],
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(practice_records_router)
    app.include_router(progression_router)
    app.include_router(sandbox_router)
    app.include_router(compositions_router)
    app.include_router(auth_router)

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    dist_dir = frontend_dist_dir or DEFAULT_FRONTEND_DIST_DIR

    if dist_dir.exists():
        app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")

    return app


app = create_app()
