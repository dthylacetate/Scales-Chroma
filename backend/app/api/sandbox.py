from fastapi import APIRouter

from app.schemas.sandbox import SandboxRenderRequest, VisualParameters
from app.visual_engine import render_visual_parameters

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/render", response_model=VisualParameters)
def render_sandbox(payload: SandboxRenderRequest) -> VisualParameters:
    return render_visual_parameters(payload.elements)
