"""Dashboard summary service - pre-aggregated data for faster loading."""
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from .kpi import compute_on_time_stats
from .work_hour import compute_work_hour_completion
from .work_hour_lost import compute_work_hour_lost
from .leave_analysis import compute_leave_analysis


def get_dashboard_summary(db: Session, group_by: str) -> Dict[str, Any]:
    """
    Get pre-aggregated dashboard data for faster loading.
    Returns summary stats and chart data for all groups.
    """
    # Fetch all KPI data in parallel (already optimized in services)
    on_time_data = compute_on_time_stats(db, group_by)
    work_hour_data = compute_work_hour_completion(db, group_by)
    work_hour_lost_data = compute_work_hour_lost(db, group_by)
    leave_analysis_data = compute_leave_analysis(db, group_by)
    
    # Get all unique groups
    groups = set()
    for item in on_time_data:
        groups.add(item.get('group'))
    for item in work_hour_data:
        groups.add(item.get('group'))
    for item in work_hour_lost_data:
        groups.add(item.get('group'))
    for item in leave_analysis_data:
        groups.add(item.get('group'))
    
    groups.discard(None)
    all_groups = sorted(list(groups))
    
    # Get all unique months
    months = set()
    for item in on_time_data:
        if item.get('month'):
            months.add(item['month'])
    for item in work_hour_data:
        if item.get('month'):
            months.add(item['month'])
    for item in work_hour_lost_data:
        if item.get('month'):
            months.add(item['month'])
    for item in leave_analysis_data:
        if item.get('month'):
            months.add(item['month'])
    
    all_months = sorted(list(months))
    latest_month = all_months[-1] if all_months else None
    
    # Calculate summary statistics from latest month
    total_members = 0
    weighted_on_time = 0
    weighted_completion = 0
    weighted_lost = 0
    total_on_time_members = 0
    total_work_hour_members = 0
    total_lost_members = 0
    
    if latest_month:
        # Sum members from latest month
        for item in on_time_data:
            if item.get('month') == latest_month:
                total_members += item.get('members', 0)
                total_on_time_members += item.get('members', 0)
                weighted_on_time += (item.get('on_time_pct', 0) * item.get('members', 0))
        
        for item in work_hour_data:
            if item.get('month') == latest_month:
                total_work_hour_members += item.get('members', 0)
                weighted_completion += (item.get('completion_pct', 0) * item.get('members', 0))
        
        for item in work_hour_lost_data:
            if item.get('month') == latest_month:
                total_lost_members += item.get('members', 0)
                weighted_lost += (item.get('lost_pct', 0) * item.get('members', 0))
    
    avg_on_time = round(weighted_on_time / total_on_time_members, 2) if total_on_time_members > 0 else 0
    avg_completion = round(weighted_completion / total_work_hour_members, 2) if total_work_hour_members > 0 else 0
    avg_lost = round(weighted_lost / total_lost_members, 2) if total_lost_members > 0 else 0
    
    # Organize data by group for efficient lookup
    data_by_group = {}
    for group in all_groups:
        data_by_group[group] = {
            'on_time': [item for item in on_time_data if item.get('group') == group],
            'work_hour': [item for item in work_hour_data if item.get('group') == group],
            'work_hour_lost': [item for item in work_hour_lost_data if item.get('group') == group],
            'leave_analysis': [item for item in leave_analysis_data if item.get('group') == group]
        }
    
    return {
        'summary': {
            'total_members': total_members,
            'avg_on_time': avg_on_time,
            'avg_completion': avg_completion,
            'avg_lost': avg_lost,
            'latest_month': latest_month
        },
        'groups': all_groups,
        'months': all_months,
        'data_by_group': data_by_group
    }

