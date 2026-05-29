from collections.abc import Generator

from sqlalchemy import Engine, create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.models import Base

DATABASE_URL = "sqlite+pysqlite:///./scales_chroma.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_database(target_engine: Engine | None = None) -> None:
    active_engine = target_engine or engine
    Base.metadata.create_all(bind=active_engine)
    _apply_lightweight_migrations(active_engine)


def _apply_lightweight_migrations(target_engine: Engine) -> None:
    if target_engine.dialect.name != "sqlite":
        return

    with target_engine.begin() as connection:
        inspector = inspect(connection)

        if inspector.has_table("users"):
            user_columns = {column["name"] for column in inspector.get_columns("users")}

            if "password" not in user_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''"))


def get_session() -> Generator[Session]:
    init_database()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
