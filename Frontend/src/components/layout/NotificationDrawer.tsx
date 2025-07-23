import React from 'react';
import { useNotification } from './NotificationContext';
import { DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export const NotificationDrawer = () => {
  const { notifications, markAllAsRead, clearNotifications } = useNotification();

  return (
    <div className="flex flex-col h-full">
      <DrawerHeader>
        <DrawerTitle>Notifications</DrawerTitle>
        <DrawerDescription>Recent alerts and updates</DrawerDescription>
      </DrawerHeader>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">No notifications</div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className={`p-3 rounded border ${n.read ? 'bg-muted' : 'bg-accent/30 border-accent'} transition-all`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{n.title}</span>
                  {!n.read && <span className="ml-2 text-xs text-accent">● Unread</span>}
                </div>
                {n.description && <div className="text-sm text-muted-foreground mt-1">{n.description}</div>}
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DrawerFooter>
        <Button variant="outline" onClick={markAllAsRead} disabled={notifications.every(n => n.read)}>
          Mark all as read
        </Button>
        <Button variant="destructive" onClick={clearNotifications} disabled={notifications.length === 0}>
          Clear all
        </Button>
      </DrawerFooter>
    </div>
  );
}; 