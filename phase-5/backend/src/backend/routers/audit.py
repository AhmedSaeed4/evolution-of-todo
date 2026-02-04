"""Audit log endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlmodel import Session
from uuid import UUID
from typing import Optional, List

from ..database import get_session
from ..auth.jwt import verify_token, validate_token_user_match
from ..services.audit_service import AuditService
from ..models.audit_log import AuditLog


router = APIRouter(prefix="/api", tags=["audit"])


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


@router.get("/{user_id}/audit", response_model=List[dict])
async def get_audit_logs(
    user_id: str,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session),
    event_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query("task"),
    entity_id: Optional[UUID] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Get audit log entries for a user"""
    validate_token_user_match(user_payload, user_id)

    service = AuditService(session)
    logs = service.get_user_audit_logs(
        user_id=user_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        limit=limit,
        offset=offset
    )

    # Convert to dict for JSON response
    return [
        {
            "id": str(log.id),
            "eventType": log.event_type,
            "entityType": log.entity_type,
            "entityId": str(log.entity_id),
            "userId": log.user_id,
            "timestamp": log.timestamp.isoformat(),
            "data": log.data
        }
        for log in logs
    ]
