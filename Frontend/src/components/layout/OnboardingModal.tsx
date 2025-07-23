import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const OnboardingModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('onboarding_complete')) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('onboarding_complete', 'true');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Welcome to EduLite!')}</DialogTitle>
          <DialogDescription>{t('Here are a few tips to get you started:')}</DialogDescription>
        </DialogHeader>
        <ul className="mb-4 space-y-2 text-sm">
          <li>• {t('Use the sidebar to navigate between Dashboard, Students, and more.')}</li>
          <li>• {t('Check your notifications for important updates.')}</li>
          <li>• {t('Update your profile and settings from the top right menu.')}</li>
          <li>• {t('Need help? Visit the Help & Support page anytime.')}</li>
        </ul>
        <Button onClick={handleClose} className="w-full">
          {t('Get Started')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}; 