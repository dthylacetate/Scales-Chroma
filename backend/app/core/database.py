from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.models import Base

DATABASE_URL = "sqlite+pysqlite:///./scales_chroma.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_database() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Generator[Session]:
    init_database()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
