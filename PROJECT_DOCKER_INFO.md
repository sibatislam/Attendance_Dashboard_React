# Project Docker Configuration

## Project Name: Attendance Monitoring Dashboard

| Field | Value |
|-------|-------|
| **Project Name** | Attendance Monitoring Dashboard |
| **Container** | Docker |
| **Frontend** | React |
| **Web Server** | Nginx |
| **Frontend Port** | 5173 (host) → 80 (container) |
| **Frontend Access** | http://localhost:5173 |
| **Backend** | FastAPI (Python) |
| **Backend Port** | 8081 (host) → 8081 (container) |
| **Backend Access** | http://localhost:8081/api<br>http://localhost:8081/docs |
| **Database** | MySQL |
| **Database Port** | 3310 (host) → 3306 (container) |

---

## Docker Container Details

### Frontend Service
| Field | Value |
|-------|-------|
| **Docker Container Name** | attendance-dashboard-frontend |
| **Image** | attendance-dashboard-frontend:latest |
| **Port Mapping** | 5173:80 |

### Backend Service
| Field | Value |
|-------|-------|
| **Docker Container Name** | attendance-dashboard-backend |
| **Image** | attendance-dashboard-backend:latest |
| **Port Mapping** | 8081:8081 |

### Database Service
| Field | Value |
|-------|-------|
| **Docker Container Name** | attendance-dashboard-mysql |
| **Image** | attendance-dashboard-mysql:latest |
| **Port Mapping** | 3310:3306 |

---

## Summary Table

| Service | Container Name | Image | Port Mapping | Access URL |
|---------|---------------|-------|--------------|-----------|
| **Frontend** | attendance-dashboard-frontend | attendance-dashboard-frontend:latest | 5173:80 | http://localhost:5173 |
| **Backend** | attendance-dashboard-backend | attendance-dashboard-backend:latest | 8081:8081 | http://localhost:8081 |
| **Database** | attendance-dashboard-mysql | attendance-dashboard-mysql:latest | 3310:3306 | localhost:3310 |

---

## Quick Reference

**Project Name:** Attendance Monitoring Dashboard  
**Container Technology:** Docker  
**Frontend:** React (Vite) + Nginx  
**Backend:** FastAPI (Python)  
**Database:** MySQL 8.0  

**Ports:**
- Frontend: 5173 → 80
- Backend: 8081 → 8081  
- Database: 3310 → 3306

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- API Docs: http://localhost:8081/docs
- Database: localhost:3310

