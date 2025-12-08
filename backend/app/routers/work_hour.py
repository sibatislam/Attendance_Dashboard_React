from typing import List, Literal, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..services.work_hour import compute_work_hour_completion
from ..services.work_hour_lost import compute_work_hour_lost
from ..services.leave_analysis import compute_leave_analysis
from ..services.od_analysis import compute_od_analysis
from ..models_kpi import OnTimeKPI, WorkHourKPI, WorkHourLostKPI, LeaveAnalysisKPI


router = APIRouter()


@router.get("/completion/{group_by}")
@router.get("/completion/{group_by}/")
def work_hour_completion(
    group_by: Literal["function", "company", "location"],
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    # Try pre-calculated data first (fast!)
    rows = db.query(WorkHourKPI).filter(WorkHourKPI.group_by == group_by).all()
    
    if rows:
        return [
            {
                "month": r.month,
                "group": r.group_value,
                "members": r.members,
                "present": r.present,
                "od": r.od,
                "shift_hours": float(r.shift_hours),
                "work_hours": float(r.work_hours),
                "completed": r.completed,
                "completion_pct": float(r.completion_pct),
            }
            for r in rows
        ]
    
    # Fallback to on-the-fly calculation
    try:
        return compute_work_hour_completion(db, group_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/lost/{group_by}")
@router.get("/lost/{group_by}/")
def work_hour_lost(
    group_by: Literal["function", "company", "location"],
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    # Try pre-calculated data first (fast!)
    rows = db.query(WorkHourLostKPI).filter(WorkHourLostKPI.group_by == group_by).all()
    
    if rows:
        return [
            {
                "month": r.month,
                "group": r.group_value,
                "members": r.members,
                "present": r.present,
                "od": r.od,
                "shift_hours": float(r.shift_hours),
                "work_hours": float(r.work_hours),
                "lost": float(r.lost_hours),
                "lost_pct": float(r.lost_pct),
            }
            for r in rows
        ]
    
    # Fallback to on-the-fly calculation
    try:
        return compute_work_hour_lost(db, group_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/leave/{group_by}")
@router.get("/leave/{group_by}/")
def leave_analysis(
    group_by: Literal["function", "company", "location"],
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    # Try pre-calculated data first (fast!)
    rows = db.query(LeaveAnalysisKPI).filter(LeaveAnalysisKPI.group_by == group_by).all()
    
    if rows:
        return [
            {
                "month": r.month,
                "group": r.group_value,
                "members": r.members,
                "total_sl": r.total_sl,
                "total_cl": r.total_cl,
                "workdays": r.workdays,
                "total_a": r.total_a,
                "sl_adjacent_w": r.sl_adjacent_w,
                "cl_adjacent_w": r.cl_adjacent_w,
                "sl_adjacent_h": r.sl_adjacent_h,
                "cl_adjacent_h": r.cl_adjacent_h,
                "sl_pct": float(r.sl_pct),
                "cl_pct": float(r.cl_pct),
                "a_pct": float(r.a_pct),
            }
            for r in rows
        ]
    
    # Fallback to on-the-fly calculation
    try:
        return compute_leave_analysis(db, group_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/od/{group_by}")
@router.get("/od/{group_by}/")
def od_analysis(
    group_by: Literal["function", "employee"],
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    try:
        return compute_od_analysis(db, group_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

