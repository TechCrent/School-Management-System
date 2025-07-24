import { useEffect, useState, useState as useReactState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCustomToast } from '@/hooks/use-toast';
import { Drawer, DrawerTrigger, DrawerContent } from '@/components/ui/drawer';
import { NotificationDrawer } from './NotificationDrawer';
import { useNotification } from './NotificationContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

export const TopNavigation = () => {
  const navigate = useNavigate();
  const { customToast } = useCustomToast();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { notifications, markAllAsRead } = useNotification();
  const unreadCount = notifications.filter(n => !n.read).length;
  const showNotifications = typeof window !== 'undefined' ? localStorage.getItem('showNotifications') !== 'false' : true;
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Universal mock/live toggle
  const [isMock, setIsMock] = useReactState(() => {
    const stored = localStorage.getItem('USE_MOCK');
    if (stored === null) {
      localStorage.setItem('USE_MOCK', 'true');
      return true;
    }
    return stored === 'true';
  });

  useEffect(() => {
    // Ensure default is set on first load
    if (localStorage.getItem('USE_MOCK') === null) {
      localStorage.setItem('USE_MOCK', 'true');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    customToast({
      title: "Logged out successfully",
      description: "You have been securely logged out.",
    });
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mark all as read when opening the drawer
  const handleNotificationDrawerChange = (open: boolean) => {
    setNotificationOpen(open);
    if (open) markAllAsRead();
  };
  return (
    <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Return (Back) Button - mobile only */}
          <button
            onClick={() => navigate(-1)}
            className="lg:hidden mr-2 p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            EduLite Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {showNotifications && (
            <Drawer open={notificationOpen} onOpenChange={handleNotificationDrawerChange}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <NotificationDrawer />
              </DrawerContent>
            </Drawer>
          )}

          {/* Mock/Live Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={isMock}
              onCheckedChange={(checked) => {
                localStorage.setItem('USE_MOCK', checked ? 'true' : 'false');
                setIsMock(checked);
                window.location.reload();
              }}
              id="mock-toggle"
            />
            <label htmlFor="mock-toggle" className="text-xs text-muted-foreground select-none">
              {isMock ? 'Mock Data' : 'Live Data'}
            </label>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {localStorage.getItem('role') || 'user'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLogoutDialogOpen(true)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};