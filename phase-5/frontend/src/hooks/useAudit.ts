import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AuditLogEntry } from '@/types';
import { useAuth } from './useAuth';
import { isAuthBypassEnabled } from '@/lib/auth';

interface AuditState {
  auditLogs: AuditLogEntry[];
  loading: boolean;
  error: string | null;
}

export function useAudit(filters?: {
  eventType?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  const { user } = useAuth();
  const [state, setAuditState] = useState<AuditState>({
    auditLogs: [],
    loading: false,
    error: null,
  });

  const effectiveUserId = isAuthBypassEnabled() ? 'bypass-user' : user?.id;

  const fetchAuditLogs = useCallback(async () => {
    if (!effectiveUserId) return;

    setAuditState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const auditLogs = await api.getAuditLogs(effectiveUserId, filters);
      setAuditState({
        auditLogs,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuditState({
        auditLogs: [],
        loading: false,
        error: (error as Error).message,
      });
    }
  }, [effectiveUserId, filters]);

  useEffect(() => {
    if (effectiveUserId) {
      fetchAuditLogs();
    }
  }, [effectiveUserId, fetchAuditLogs]);

  return {
    ...state,
    refetch: fetchAuditLogs,
  };
}
