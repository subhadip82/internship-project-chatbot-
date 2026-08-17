from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models import Notification

router = APIRouter(prefix="/api", tags=["notifications"])


@router.get("/notifications")
@router.get("/notifications/")
def get_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    rows = db.query(Notification).filter(Notification.user_id == current_user["sub"]).order_by(Notification.created_at.desc()).all()
    items = [{
        "id": row.id,
        "type": row.type,
        "title": row.title,
        "message": row.message,
        "is_read": row.is_read,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    } for row in rows]
    return {
        "success": True,
        "notifications": items,
        "data": items,
        "message": "Notifications loaded",
    }


@router.patch("/notifications/{notification_id}/read")
@router.put("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    row = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user["sub"]).first()
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    row.is_read = True
    db.commit()
    return {"success": True, "data": {"read": True}, "message": "Notification marked as read"}


@router.patch("/notifications/read-all")
@router.put("/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user["sub"], Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"success": True, "data": {"read_all": True}, "message": "Notifications updated"}


@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    row = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user["sub"]).first()
    if row:
        db.delete(row)
        db.commit()
    return {"success": True, "data": {"deleted": True}, "message": "Notification deleted"}
