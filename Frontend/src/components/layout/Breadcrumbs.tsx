import { useLocation } from 'react-router-dom';
import { Breadcrumbs as SimpleBreadcrumbs } from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/report-cards': 'Report Cards',
  '/homework': 'Homework',
  '/classes': 'Classes',
  '/creativity-board': 'Creativity Board',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const items = [
    { label: 'Dashboard', href: '/' },
    ...pathnames.map((pathname, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = routeLabels[routeTo] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
      return {
        label,
        href: index === pathnames.length - 1 ? undefined : routeTo,
      };
    }),
  ];
  return (
    <div className="px-6 py-3 border-b border-border bg-muted/30">
      <SimpleBreadcrumbs items={items} />
    </div>
  );
};