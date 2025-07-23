import { useEffect, useState } from 'react';

const mockParentNotifications = [
  {
    id: '1',
    title: 'New Grade Posted',
    description: 'John Doe received an A in Mathematics.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: '2',
    title: 'Upcoming Parent-Teacher Meeting',
    description: 'Meeting scheduled for next Friday at 5:00 PM.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: '3',
    title: 'Homework Due Soon',
    description: 'Emma Wilson has homework due in English tomorrow.',
    timestamp: Date.now() - 1000 * 60 * 30,
  },
];

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState<typeof mockParentNotifications>([]);

  useEffect(() => {
    // In a real app, fetch notifications for the logged-in parent
    setNotifications(mockParentNotifications);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-muted-foreground">No notifications.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 border rounded-lg shadow-card bg-white">
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-muted-foreground mb-1">{n.description}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentNotifications; 