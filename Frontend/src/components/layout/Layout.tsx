import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { Breadcrumbs } from './Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { OnboardingModal } from './OnboardingModal';
import { SessionTimeout } from './SessionTimeout';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background flex">
      <OnboardingModal />
      <SessionTimeout />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopNavigation />
        <Breadcrumbs />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};