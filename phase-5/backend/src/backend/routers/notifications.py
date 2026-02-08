"""Notification endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlmodel import Session
from uuid import UUID
from typing import Optional, List

from ..database import get_session
from ..auth.jwt import verify_token, validate_token_user_match
from ..services.notification_service import NotificationService
from ..models.notification import Notification
from ..schemas.notification import NotificationResponse, NotificationListResponse


router = APIRouter(prefix="/api", tags=["notifications"])


async def get_token_from_header(authorization: Optional[str] = Header(None)) -> str:
    """Extract Bearer token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    return authorization[7:]


async def validate_and_get_user(token: str = Depends(get_token_from_header)) -> dict:
    """Validate token and return user payload"""
    return await verify_token(token)


@router.get("/{user_id}/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    user_id: str,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all notifications for a user"""
    validate_token_user_match(user_payload, user_id)

    service = NotificationService(session)
    notifications = service.get_user_notifications(
        user_id=user_id,
        unread_only=unread_only,
        limit=limit
    )
    return notifications


@router.patch("/{user_id}/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    user_id: str,
    notification_id: UUID,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Mark a notification as read"""
    validate_token_user_match(user_payload, user_id)

    service = NotificationService(session)
    notification = service.mark_as_read(user_id, notification_id)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return notification


@router.patch("/{user_id}/notifications/read-all")
async def mark_all_notifications_as_read(
    user_id: str,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Mark all unread notifications as read"""
    validate_token_user_match(user_payload, user_id)

    service = NotificationService(session)
    count = service.mark_all_as_read(user_id)

    return {"count": count}


@router.delete("/{user_id}/notifications/{notification_id}")
async def delete_notification(
    user_id: str,
    notification_id: UUID,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Delete a specific notification"""
    validate_token_user_match(user_payload, user_id)

    service = NotificationService(session)
    deleted = service.delete_notification(user_id, notification_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return {"success": True}
