from fastapi import APIRouter

from app.schemas.sandbox import SandboxRenderRequest, VisualParameters
from app.services.visual_engine import map_theory_to_visuals

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/render", response_model=VisualParameters)
def render_sandbox(payload: SandboxRenderRequest) -> VisualParameters:
    return map_theory_to_visuals(payload.elements)
