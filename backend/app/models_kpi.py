"""Pre-calculated KPI models for fast dashboard loading."""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship

from .db import Base


class OnTimeKPI(Base):
    """Pre-calculated On Time % KPIs."""
    __tablename__ = "on_time_kpi"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("uploaded_file.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(10), nullable=False)
    group_by = Column(String(20), nullable=False)  # function, company, location
    group_value = Column(String(255), nullable=False)
    members = Column(Integer, nullable=False, default=0)
    present = Column(Integer, nullable=False, default=0)
    late = Column(Integer, nullable=False, default=0)
    on_time = Column(Integer, nullable=False, default=0)
    on_time_pct = Column(Float, nullable=False, default=0.0)
    
    file = relationship("UploadedFile")
    
    __table_args__ = (
        Index('idx_ontime_file', 'file_id'),
        Index('idx_ontime_group', 'group_by', 'month', 'group_value'),
    )


class WorkHourKPI(Base):
    """Pre-calculated Work Hour Completion KPIs."""
    __tablename__ = "work_hour_kpi"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("uploaded_file.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(10), nullable=False)
    group_by = Column(String(20), nullable=False)
    group_value = Column(String(255), nullable=False)
    members = Column(Integer, nullable=False, default=0)
    present = Column(Integer, nullable=False, default=0)
    od = Column(Integer, nullable=False, default=0)
    shift_hours = Column(Float, nullable=False, default=0.0)
    work_hours = Column(Float, nullable=False, default=0.0)
    completed = Column(Integer, nullable=False, default=0)
    completion_pct = Column(Float, nullable=False, default=0.0)
    
    file = relationship("UploadedFile")
    
    __table_args__ = (
        Index('idx_workhour_file', 'file_id'),
        Index('idx_workhour_group', 'group_by', 'month', 'group_value'),
    )


class WorkHourLostKPI(Base):
    """Pre-calculated Work Hour Lost KPIs."""
    __tablename__ = "work_hour_lost_kpi"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("uploaded_file.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(10), nullable=False)
    group_by = Column(String(20), nullable=False)
    group_value = Column(String(255), nullable=False)
    members = Column(Integer, nullable=False, default=0)
    present = Column(Integer, nullable=False, default=0)
    od = Column(Integer, nullable=False, default=0)
    shift_hours = Column(Float, nullable=False, default=0.0)
    work_hours = Column(Float, nullable=False, default=0.0)
    lost_hours = Column(Float, nullable=False, default=0.0)
    lost_pct = Column(Float, nullable=False, default=0.0)
    
    file = relationship("UploadedFile")
    
    __table_args__ = (
        Index('idx_lost_file', 'file_id'),
        Index('idx_lost_group', 'group_by', 'month', 'group_value'),
    )


class LeaveAnalysisKPI(Base):
    """Pre-calculated Leave Analysis KPIs."""
    __tablename__ = "leave_analysis_kpi"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("uploaded_file.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(10), nullable=False)
    group_by = Column(String(20), nullable=False)
    group_value = Column(String(255), nullable=False)
    members = Column(Integer, nullable=False, default=0)
    total_sl = Column(Integer, nullable=False, default=0)
    total_cl = Column(Integer, nullable=False, default=0)
    workdays = Column(Integer, nullable=False, default=0)
    total_a = Column(Integer, nullable=False, default=0)
    sl_adjacent_w = Column(Integer, nullable=False, default=0)
    cl_adjacent_w = Column(Integer, nullable=False, default=0)
    sl_adjacent_h = Column(Integer, nullable=False, default=0)
    cl_adjacent_h = Column(Integer, nullable=False, default=0)
    sl_pct = Column(Float, nullable=False, default=0.0)
    cl_pct = Column(Float, nullable=False, default=0.0)
    a_pct = Column(Float, nullable=False, default=0.0)
    
    file = relationship("UploadedFile")
    
    __table_args__ = (
        Index('idx_leave_file', 'file_id'),
        Index('idx_leave_group', 'group_by', 'month', 'group_value'),
    )

