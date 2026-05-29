from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.practice_records import router as practice_records_router
from app.api.progression import router as progression_router
from app.api.sandbox import router as sandbox_router
from app.core.database import init_database


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_database()
    yield


app = FastAPI(title="Scales & Chroma API", lifespan=lifespan)

app.include_router(practice_records_router)
app.include_router(progression_router)
app.include_router(sandbox_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
