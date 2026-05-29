from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TheoryVisualMapping(Base):
    __tablename__ = "theory_visual_mapping"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    theory_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    theory_name: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    tension_level: Mapped[int] = mapped_column(Integer, nullable=False)
    color_hex: Mapped[str] = mapped_column(String(7), nullable=False)
    visual_effect: Mapped[str] = mapped_column(String(80), nullable=False)
    particle_density: Mapped[float] = mapped_column(Float, nullable=False)
