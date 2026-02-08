import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import { useAuth } from './useAuth';
import { useNotificationRealtimeUpdates } from './useWebSocket';
import { isAuthBypassEnabled } from '@/lib/auth';
import { toast } from 'sonner';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export function useNotifications(pollInterval: number = 30000) {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });

  const effectiveUserId = isAuthBypassEnabled() ? 'bypass-user' : user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!effectiveUserId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const notifications = await api.getNotifications(effectiveUserId, false, 50);
      const unreadCount = notifications.filter(n => !n.read).length;
      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, [effectiveUserId]);

  // Enable real-time updates via WebSocket for notifications
  // This will automatically refresh notifications when new ones arrive
  useNotificationRealtimeUpdates<{ message: string; notification_id: string }>(
    effectiveUserId,
    (notification) => {
      console.log('[WebSocket] New notification received:', notification);
      // Show toast for new notification
      toast.info(notification.message);
      // Refresh notifications to get updated count
      fetchNotifications();
    },
    true // enabled
  );

  useEffect(() => {
    if (effectiveUserId) {
      fetchNotifications();
    }
  }, [effectiveUserId, fetchNotifications]);

  // Poll for new notifications
  useEffect(() => {
    if (!effectiveUserId) return;

    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [effectiveUserId, fetchNotifications, pollInterval]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      const updated = await api.markNotificationAsRead(effectiveUserId, notificationId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? updated : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [effectiveUserId]);

  const markAllAsRead = useCallback(async () => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      await api.markAllNotificationsAsRead(effectiveUserId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [effectiveUserId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      await api.deleteNotification(effectiveUserId, notificationId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: prev.notifications.find(n => n.id === notificationId)?.read === false
          ? prev.unreadCount - 1
          : prev.unreadCount,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [effectiveUserId]);

  return {
    ...state,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
