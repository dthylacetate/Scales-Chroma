from pathlib import Path

from sqlalchemy import create_engine, inspect, text

from app.core.database import init_database


def test_init_database_upgrades_legacy_sqlite_schema(tmp_path: Path) -> None:
    database_path = tmp_path / "legacy_scales_chroma.db"
    legacy_engine = create_engine(f"sqlite+pysqlite:///{database_path}")

    with legacy_engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY,
                    username VARCHAR(64) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    level INTEGER NOT NULL DEFAULT 1,
                    total_exp INTEGER NOT NULL DEFAULT 0
                )
                """
            )
        )

    init_database(legacy_engine)

    inspector = inspect(legacy_engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    assert "password" in user_columns
    assert "auth_tokens" in inspector.get_table_names()
