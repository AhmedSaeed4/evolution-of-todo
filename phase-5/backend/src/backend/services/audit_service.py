"""Audit service - tracks all task operations for audit logging"""
from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
from typing import Optional, List, Dict, Any
import json

from ..models.audit_log import AuditLog, AuditEventType


def _serialize_datetime(obj: Any) -> Any:
    """
    Convert datetime objects to ISO strings for JSON serialization.

    This is used as a default converter for json.dumps() to handle
    datetime objects in the audit log data.
    """
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def _serialize_audit_data(data: Dict[str, Any]) -> str:
    """
    Serialize audit log data to JSON, handling datetime objects.

    Args:
        data: Dictionary potentially containing datetime objects

    Returns:
        JSON string with datetime objects converted to ISO format
    """
    return json.dumps(data, default=_serialize_datetime)


class AuditService:
    """Service class for audit logging operations"""

    def __init__(self, session: Session):
        """Initialize with database session"""
        self.session = session

    def log_event(
        self,
        event_type: str,
        entity_type: str,
        entity_id: UUID,
        user_id: str,
        data: Dict[str, Any]
    ) -> AuditLog:
        """
        Log an audit event.

        Args:
            event_type: Type of event (created, updated, deleted, completed)
            entity_type: Type of entity (task, etc.)
            entity_id: ID of the affected entity
            user_id: User who performed the action
            data: Additional event data (task title, changes, etc.)

        Returns:
            AuditLog: Created audit log entry
        """
        # Serialize data to handle datetime objects for SQLAlchemy JSON column
        serialized_data = json.loads(_serialize_audit_data(data))

        audit_log = AuditLog(
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            timestamp=datetime.utcnow(),
            data=serialized_data
        )
        self.session.add(audit_log)
        # Note: caller must commit the session
        return audit_log

    def get_user_audit_logs(
        self,
        user_id: str,
        event_type: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Get audit log entries for a user with optional filtering.

        Args:
            user_id: User ID to filter logs
            event_type: Filter by event type (created/updated/deleted/completed)
            entity_type: Filter by entity type (task, etc.)
            entity_id: Filter by specific entity ID
            limit: Maximum number of entries to return
            offset: Number of entries to skip

        Returns:
            List[AuditLog]: List of audit log entries
        """
        query = select(AuditLog).where(AuditLog.user_id == user_id)

        # Apply filters
        if event_type:
            query = query.where(AuditLog.event_type == event_type)
        if entity_type:
            query = query.where(AuditLog.entity_type == entity_type)
        if entity_id:
            query = query.where(AuditLog.entity_id == entity_id)

        # Order by most recent first
        query = query.order_by(AuditLog.timestamp.desc())

        # Apply pagination
        query = query.limit(limit).offset(offset)

        return list(self.session.exec(query).all())

    def get_entity_audit_logs(
        self,
        entity_id: UUID,
        entity_type: str = "task",
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get all audit log entries for a specific entity.

        Args:
            entity_id: Entity ID to get logs for
            entity_type: Type of entity (task, etc.)
            limit: Maximum number of entries to return

        Returns:
            List[AuditLog]: List of audit log entries for the entity
        """
        query = select(AuditLog).where(
            AuditLog.entity_id == entity_id,
            AuditLog.entity_type == entity_type
        ).order_by(AuditLog.timestamp.desc()).limit(limit)

        return list(self.session.exec(query).all())
