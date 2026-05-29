from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_exp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    practice_records: Mapped[list["PracticeRecord"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    exp_statistics: Mapped["ExpStatistics | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    unlocked_effects: Mapped[list["UnlockedEffect"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    saved_compositions: Mapped[list["SavedComposition"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


from app.models.exp_statistics import ExpStatistics  # noqa: E402
from app.models.practice_record import PracticeRecord  # noqa: E402
from app.models.saved_composition import SavedComposition  # noqa: E402
from app.models.unlocked_effect import UnlockedEffect  # noqa: E402
