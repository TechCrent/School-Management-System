import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  BookOpen, 
  Calendar, 
  Palette, 
  User, 
  LogOut,
  Menu,
  X,
  LifeBuoy,
  Bell,
  BarChart3
} from "lucide-react";
import { EduLiteLogo } from "../ui/logo";
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useCustomToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Teachers", url: "/teachers", icon: GraduationCap },
  { title: "Report Cards", url: "/report-cards", icon: FileText },
  { title: "Homework", url: "/homework", icon: BookOpen },
  { title: "Classes", url: "/classes", icon: Calendar },
  { title: "Creativity Board", url: "/creativity-board", icon: Palette },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: LifeBuoy },
  { title: "Activity Log", url: "/activity-log", icon: FileText, adminOnly: true },
];

const teacherNavigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Classes", url: "/teacher/classes", icon: Calendar },
  { title: "My Homework", url: "/teacher/homework", icon: BookOpen },
  { title: "My Students", url: "/teacher/students", icon: Users },
  { title: "Report Cards", url: "/report-cards", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: LifeBuoy },
];

const studentNavigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Homework", url: "/homework", icon: BookOpen },
  { title: "Classes", url: "/classes", icon: Calendar },
  { title: "Report Card", url: "/report-card", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: LifeBuoy },
];

const parentNavigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Children", url: "/parent/children", icon: Users },
  { title: "Notifications", url: "/parent/notifications", icon: Bell },
  { title: "Classes", url: "/classes", icon: Calendar },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: LifeBuoy },
];

const adminNavigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Teachers", url: "/teachers", icon: GraduationCap },
  { title: "Classes", url: "/classes", icon: Calendar },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Report Cards", url: "/report-cards", icon: FileText },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Activity Log", url: "/activity-log", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Help & Support", url: "/help", icon: LifeBuoy },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { customToast } = useCustomToast();
  const userRole = localStorage.getItem('role');

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    customToast({
      title: "Logged out successfully",
      description: "You have been securely logged out.",
    });
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case 'admin':
        return adminNavigationItems;
      case 'teacher':
        return teacherNavigationItems;
      case 'student':
        return studentNavigationItems;
      case 'parent':
        return parentNavigationItems;
      default:
        return navigationItems.filter(item => !item.adminOnly || userRole === 'admin');
    }
  };

  const navigationItemsToShow = getNavigationItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-card"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-gradient-card border-r border-border z-40
        transition-all duration-300 ease-smooth
        ${isCollapsed ? '-translate-x-full lg:w-20' : 'w-64'}
        lg:translate-x-0
        w-full max-w-xs sm:max-w-sm md:w-64
        min-h-screen
        flex flex-col
        shadow-lg
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <EduLiteLogo className={isCollapsed ? "justify-center" : ""} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Main sidebar navigation">
            {navigationItemsToShow.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  hover:bg-muted hover:shadow-glow
                  ${isActive(item.url) 
                    ? 'bg-primary text-primary-foreground shadow-glow' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{t(item.title)}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => setLogoutDialogOpen(true)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                hover:bg-destructive/10 hover:text-destructive w-full
                text-muted-foreground hover:text-destructive
              `}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{t('Logout')}</span>}
            </button>
          </div>

          {/* Collapse Toggle (Desktop) */}
          <div className="hidden lg:block p-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};