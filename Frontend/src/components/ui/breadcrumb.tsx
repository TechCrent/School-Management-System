import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, idx) => (
        <li key={item.label} className="flex items-center">
          {item.href && idx !== items.length - 1 ? (
            <Link to={item.href} className="hover:underline text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="mx-2">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);
