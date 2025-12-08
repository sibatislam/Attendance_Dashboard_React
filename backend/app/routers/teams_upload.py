"""MS Teams file upload endpoint."""
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import TeamsUploadedFile, TeamsUploadedRow
from ..schemas import UploadResponseItem
from ..services.teams_parser import parse_teams_file
from ..auth import get_current_user

router = APIRouter()


@router.post("", response_model=List[UploadResponseItem])
async def upload_teams_files(
    files: List[UploadFile] = File(...),
    from_month: Optional[str] = Form(None),
    to_month: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload one or more MS Teams CSV files and store in database with month range."""
    results = []
    
    for uploaded_file in files:
        try:
            # Parse the file
            headers, rows_data = await parse_teams_file(uploaded_file)
            
            # Create file record
            db_file = TeamsUploadedFile(
                filename=uploaded_file.filename,
                header_order=headers,
                from_month=from_month,
                to_month=to_month
            )
            db.add(db_file)
            db.flush()  # Get the file ID
            
            # Create row records
            for row_dict in rows_data:
                db_row = TeamsUploadedRow(
                    file_id=db_file.id,
                    data=row_dict
                )
                db.add(db_row)
            
            db.commit()
            db.refresh(db_file)
            
            results.append({
                "id": db_file.id,
                "filename": db_file.filename,
                "uploaded_at": db_file.uploaded_at,
                "total_rows": len(rows_data)
            })
            
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Error processing {uploaded_file.filename}: {str(e)}")
    
    return results

