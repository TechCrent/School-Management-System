import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  FileText,
  Award
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'grade' | 'homework' | 'meeting' | 'attendance' | 'achievement' | 'general';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  studentId?: string;
  studentName?: string;
}

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // Simulate loading notifications for the parent
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Grade Posted',
        description: 'Michelle Hernandez received an A in Mathematics for the Algebra quiz.',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        type: 'grade',
        priority: 'high',
        read: false,
        studentId: 'S0001',
        studentName: 'Michelle Hernandez'
      },
      {
        id: '2',
        title: 'Upcoming Parent-Teacher Meeting',
        description: 'Meeting scheduled for next Friday at 5:00 PM with Mrs. Smith.',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        type: 'meeting',
        priority: 'high',
        read: false
      },
      {
        id: '3',
        title: 'Homework Due Soon',
        description: 'Susan Hernandez has homework due in English tomorrow.',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        type: 'homework',
        priority: 'medium',
        read: true,
        studentId: 'S0002',
        studentName: 'Susan Hernandez'
      },
      {
        id: '4',
        title: 'Attendance Alert',
        description: 'Michelle Hernandez was absent from Mathematics class today.',
        timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
        type: 'attendance',
        priority: 'medium',
        read: false,
        studentId: 'S0001',
        studentName: 'Michelle Hernandez'
      },
      {
        id: '5',
        title: 'Academic Achievement',
        description: 'Susan Hernandez has been selected for the Honor Roll!',
        timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
        type: 'achievement',
        priority: 'high',
        read: false,
        studentId: 'S0002',
        studentName: 'Susan Hernandez'
      },
      {
        id: '6',
        title: 'School Announcement',
        description: 'Parent-teacher conferences will be held next week.',
        timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        type: 'general',
        priority: 'low',
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return <TrendingUp className="h-5 w-5" />;
      case 'homework': return <BookOpen className="h-5 w-5" />;
      case 'meeting': return <Calendar className="h-5 w-5" />;
      case 'attendance': return <Users className="h-5 w-5" />;
      case 'achievement': return <Award className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'grade': return 'text-green-600 bg-green-50';
      case 'homework': return 'text-blue-600 bg-blue-50';
      case 'meeting': return 'text-purple-600 bg-purple-50';
      case 'attendance': return 'text-orange-600 bg-orange-50';
      case 'achievement': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  if (loading) return <Loading size="lg" text="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Notifications' }]} />
      
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Stay updated with your children's academic progress</p>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Important updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button 
            variant={filter === 'high' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('high')}
          >
            High Priority ({highPriorityCount})
          </Button>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'You\'re all caught up! No notifications at the moment.'
                  : `No ${filter} notifications found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`shadow-card transition-all hover:shadow-lg ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        {notification.studentName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Student: {notification.studentName}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentNotifications; 