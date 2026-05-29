from typing import Literal

from pydantic import BaseModel, Field

TheoryType = Literal["scale", "mode", "chord", "progression"]


class TheoryElement(BaseModel):
    id: str = Field(min_length=1)
    type: TheoryType
    name: str = Field(min_length=1, max_length=80)
