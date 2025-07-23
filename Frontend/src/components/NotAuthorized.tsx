import { useTranslation } from 'react-i18next';

export const NotAuthorized = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-destructive">{t('Not Authorized')}</h1>
        <p className="text-lg mb-6">{t('You do not have permission to view this page.')}</p>
        <a href="/" className="text-primary hover:underline">
          {t('Go to Dashboard')}
        </a>
      </div>
    </div>
  );
}; 