import { Notification } from '@/types';
import { Bell, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering mark as read
    onDelete(notification.id);
  };

  return (
    <div
      className={cn(
        'p-3 border-b border-structure/10 cursor-pointer transition-colors',
        'hover:bg-structure/5',
        !notification.read && 'bg-accent/5'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'mt-0.5 flex-shrink-0',
          notification.read ? 'text-structure/40' : 'text-accent'
        )}>
          {notification.read ? (
            <Check className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm',
            notification.read ? 'text-structure/60' : 'text-structure'
          )}>
            {notification.message}
          </p>

          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1 hover:bg-structure/10 rounded text-structure/40 hover:text-red-500 transition-colors"
          title="Delete notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
