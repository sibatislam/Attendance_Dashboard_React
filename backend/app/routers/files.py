from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, select, delete

from ..db import get_db
from ..models import UploadedFile, UploadedRow
from ..schemas import UploadedFileListItem, UploadedFileDetail, DeleteRequest, DeleteResponse


router = APIRouter()


@router.get("/", response_model=List[UploadedFileListItem])
def list_files(db: Session = Depends(get_db)):
    stmt = (
        select(
            UploadedFile.id,
            UploadedFile.filename,
            UploadedFile.uploaded_at,
            func.count(UploadedRow.id).label("total_rows"),
        )
        .join(UploadedRow, UploadedFile.id == UploadedRow.file_id, isouter=True)
        .group_by(UploadedFile.id)
        .order_by(UploadedFile.uploaded_at.desc())
    )
    results = db.execute(stmt).all()
    return [
        UploadedFileListItem(
            id=r.id,
            filename=r.filename,
            uploaded_at=r.uploaded_at,
            total_rows=int(r.total_rows or 0),
        )
        for r in results
    ]


@router.get("/{file_id}", response_model=UploadedFileDetail)
def get_file_detail(file_id: int, db: Session = Depends(get_db)):
    file_rec: UploadedFile | None = db.get(UploadedFile, file_id)
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found")

    rows = db.execute(select(UploadedRow.data).where(UploadedRow.file_id == file_id)).scalars().all()

    return UploadedFileDetail(
        id=file_rec.id,
        filename=file_rec.filename,
        uploaded_at=file_rec.uploaded_at,
        header_order=file_rec.header_order,
        rows=rows,
    )


@router.delete("/", response_model=DeleteResponse)
def delete_files(payload: DeleteRequest, db: Session = Depends(get_db)):
    if not payload.file_ids:
        return DeleteResponse(deleted_count=0)

    # Ensure IDs exist
    existing = db.execute(select(UploadedFile.id).where(UploadedFile.id.in_(payload.file_ids))).scalars().all()
    if not existing:
        return DeleteResponse(deleted_count=0)

    # Deleting via ORM will respect cascade
    for fid in existing:
        obj = db.get(UploadedFile, fid)
        if obj:
            db.delete(obj)
    db.commit()
    return DeleteResponse(deleted_count=len(existing))


