"""MS Teams file management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import TeamsUploadedFile, TeamsUploadedRow
from ..schemas import UploadedFileListItem, UploadedFileDetail, DeleteRequest, DeleteResponse
from ..auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[UploadedFileListItem])
def list_teams_files(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all uploaded MS Teams files with row counts and month range."""
    files = (
        db.query(
            TeamsUploadedFile.id,
            TeamsUploadedFile.filename,
            TeamsUploadedFile.uploaded_at,
            TeamsUploadedFile.from_month,
            TeamsUploadedFile.to_month,
            func.count(TeamsUploadedRow.id).label("total_rows")
        )
        .outerjoin(TeamsUploadedRow, TeamsUploadedFile.id == TeamsUploadedRow.file_id)
        .group_by(TeamsUploadedFile.id)
        .order_by(TeamsUploadedFile.uploaded_at.desc())
        .all()
    )
    
    return [
        {
            "id": f.id,
            "filename": f.filename,
            "uploaded_at": f.uploaded_at,
            "total_rows": f.total_rows or 0,
            "from_month": f.from_month,
            "to_month": f.to_month
        }
        for f in files
    ]


@router.get("/{file_id}", response_model=UploadedFileDetail)
def get_teams_file_detail(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed view of a specific MS Teams file."""
    file = db.query(TeamsUploadedFile).filter(TeamsUploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    rows = db.query(TeamsUploadedRow.data).filter(TeamsUploadedRow.file_id == file_id).all()
    
    return {
        "id": file.id,
        "filename": file.filename,
        "uploaded_at": file.uploaded_at,
        "header_order": file.header_order,
        "rows": [r.data for r in rows],
        "from_month": file.from_month,
        "to_month": file.to_month
    }


@router.delete("/", response_model=DeleteResponse)
def delete_teams_files(
    request: DeleteRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete one or more MS Teams files and their rows (cascade)."""
    deleted_count = db.query(TeamsUploadedFile).filter(
        TeamsUploadedFile.id.in_(request.file_ids)
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {"deleted_count": deleted_count}

