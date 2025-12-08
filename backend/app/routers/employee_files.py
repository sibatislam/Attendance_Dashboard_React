"""Employee List file management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import EmployeeUploadedFile, EmployeeUploadedRow
from ..schemas import UploadedFileListItem, UploadedFileDetail, DeleteRequest, DeleteResponse
from ..auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[UploadedFileListItem])
def list_employee_files(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all uploaded Employee List files with row counts."""
    files = (
        db.query(
            EmployeeUploadedFile.id,
            EmployeeUploadedFile.filename,
            EmployeeUploadedFile.uploaded_at,
            func.count(EmployeeUploadedRow.id).label("total_rows")
        )
        .outerjoin(EmployeeUploadedRow, EmployeeUploadedFile.id == EmployeeUploadedRow.file_id)
        .group_by(EmployeeUploadedFile.id)
        .order_by(EmployeeUploadedFile.uploaded_at.desc())
        .all()
    )
    
    return [
        {
            "id": f.id,
            "filename": f.filename,
            "uploaded_at": f.uploaded_at,
            "total_rows": f.total_rows or 0
        }
        for f in files
    ]


@router.get("/{file_id}", response_model=UploadedFileDetail)
def get_employee_file_detail(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed view of a specific Employee List file."""
    file = db.query(EmployeeUploadedFile).filter(EmployeeUploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    rows = db.query(EmployeeUploadedRow.data).filter(EmployeeUploadedRow.file_id == file_id).all()
    
    return {
        "id": file.id,
        "filename": file.filename,
        "uploaded_at": file.uploaded_at,
        "header_order": file.header_order,
        "rows": [r.data for r in rows]
    }


@router.delete("/", response_model=DeleteResponse)
def delete_employee_files(
    request: DeleteRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete one or more Employee List files."""
    deleted_count = 0
    for file_id in request.file_ids:
        file = db.query(EmployeeUploadedFile).filter(EmployeeUploadedFile.id == file_id).first()
        if file:
            db.delete(file)
            deleted_count += 1
    db.commit()
    return {"deleted_count": deleted_count}

