"""Dashboard summary endpoints for optimized loading."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..services.dashboard_summary import get_dashboard_summary
from ..auth import get_current_user

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary_endpoint(
    group_by: str = Query("function", regex="^(function|company|location)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get pre-aggregated dashboard data for faster loading.
    Returns summary stats and organized data by group.
    """
    return get_dashboard_summary(db, group_by)

