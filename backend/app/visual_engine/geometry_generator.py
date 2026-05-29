from app.schemas.theory import TheoryElement
from app.visual_engine.profile_library import DEFAULT_PROFILE, PROFILE_LIBRARY
from app.visual_engine.types import GeometryProfile


def generate_geometry(element: TheoryElement) -> GeometryProfile:
    return PROFILE_LIBRARY.get(element.name.lower(), DEFAULT_PROFILE).geometry
