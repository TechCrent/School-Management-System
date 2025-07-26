import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const WARNING_TIME = 110 * 60 * 1000; // 110 minutes
const LOGOUT_TIME = 120 * 60 * 1000; // 120 minutes (2 hours)

export const SessionTimeout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timers on user activity
  const resetTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setOpen(false);
    setCountdown(600);
    warningRef.current = setTimeout(() => {
      setOpen(true);
      let c = 600;
      timerRef.current = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          handleLogout();
        }
      }, 1000);
    }, WARNING_TIME);
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStay = () => {
    resetTimers();
  };

  useEffect(() => {
    resetTimers();
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimers));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimers));
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Session Timeout Warning')}</DialogTitle>
          <DialogDescription>
            {t('You will be logged out soon due to inactivity.')}<br />
            {t('Time remaining')}: <span className="font-bold">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleStay} className="flex-1">
            {t('Stay Logged In')}
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="flex-1">
            {t('Logout Now')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 