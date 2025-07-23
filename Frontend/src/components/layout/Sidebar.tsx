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
  X
} from "lucide-react";
import { EduLiteLogo } from "../ui/logo";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Teachers", url: "/teachers", icon: GraduationCap },
  { title: "Report Cards", url: "/report-cards", icon: FileText },
  { title: "Homework", url: "/homework", icon: BookOpen },
  { title: "Classes", url: "/classes", icon: Calendar },
  { title: "Creativity Board", url: "/creativity-board", icon: Palette },
  { title: "Profile", url: "/profile", icon: User },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <EduLiteLogo className={isCollapsed ? "justify-center" : ""} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
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
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="
                flex items-center gap-3 w-full px-4 py-3 rounded-lg
                text-muted-foreground hover:text-destructive hover:bg-destructive/10
                transition-all duration-200
              "
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
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
    </>
  );
};