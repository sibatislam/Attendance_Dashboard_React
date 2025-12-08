"""Endpoint to rebuild KPIs for all existing files."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import UploadedFile
from ..services.kpi_calculator import calculate_kpis_for_file
from ..models_kpi import OnTimeKPI, WorkHourKPI, WorkHourLostKPI, LeaveAnalysisKPI
from ..auth import get_current_user

router = APIRouter()


@router.post("/rebuild-all")
def rebuild_all_kpis(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Rebuild KPIs for all existing uploaded files.
    Use this to populate pre-calculated tables for existing data.
    """
    # Clear existing KPI data
    db.query(OnTimeKPI).delete()
    db.query(WorkHourKPI).delete()
    db.query(WorkHourLostKPI).delete()
    db.query(LeaveAnalysisKPI).delete()
    db.commit()
    
    # Get all uploaded files
    files = db.query(UploadedFile).all()
    
    calculated_count = 0
    for file in files:
        try:
            calculate_kpis_for_file(db, file.id)
            calculated_count += 1
        except Exception as e:
            print(f"Error calculating KPIs for file {file.id}: {e}")
            continue
    
    return {
        "status": "success",
        "total_files": len(files),
        "calculated": calculated_count,
        "message": f"Successfully calculated KPIs for {calculated_count} out of {len(files)} files"
    }

