"""Teams App Usage analytics endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import TeamsAppUploadedFile, TeamsAppUploadedRow
from ..auth import get_current_user

router = APIRouter()


@router.get("/app-activity")
def get_app_activity(
    file_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get Teams App activity data.
    Returns: App Name, Team Using App, Users Using App
    """
    # Get files
    if file_id:
        files = db.query(TeamsAppUploadedFile).filter(TeamsAppUploadedFile.id == file_id).all()
    else:
        files = db.query(TeamsAppUploadedFile).order_by(TeamsAppUploadedFile.uploaded_at.desc()).all()
    
    if not files:
        return []
    
    # Aggregate app data across all rows in selected files
    app_data = {}
    
    for file in files:
        rows = db.query(TeamsAppUploadedRow).filter(TeamsAppUploadedRow.file_id == file.id).all()
        
        for row in rows:
            data = row.data
            app_name = data.get('App Name', '').strip()
            
            if not app_name:
                continue
            
            if app_name not in app_data:
                app_data[app_name] = {
                    'app_name': app_name,
                    'team_using_app': 0,
                    'users_using_app': 0,
                }
            
            # Aggregate the metrics
            try:
                team_count = int(data.get('Team Using App', 0) or 0)
                app_data[app_name]['team_using_app'] += team_count
            except (ValueError, TypeError):
                pass
            
            try:
                user_count = int(data.get('Users Using App', 0) or 0)
                app_data[app_name]['users_using_app'] += user_count
            except (ValueError, TypeError):
                pass
    
    # Sort by users using app (descending)
    result = list(app_data.values())
    result.sort(key=lambda x: x['users_using_app'], reverse=True)
    
    return result

