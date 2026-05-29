from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.schemas.sandbox import SandboxRenderRequest, VisualParameters
from app.services.user_effects import get_unlocked_effect_names
from app.visual_engine import render_visual_parameters

router = APIRouter(prefix="/sandbox", tags=["sandbox"])


@router.post("/render", response_model=VisualParameters)
def render_sandbox(
    payload: SandboxRenderRequest,
    session: Session = Depends(get_session),
) -> VisualParameters:
    unlocked_effects = get_unlocked_effect_names(session=session, user_id=payload.user_id)
    return render_visual_parameters(payload.elements, unlocked_effects=unlocked_effects)
